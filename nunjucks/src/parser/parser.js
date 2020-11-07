'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.Parser = void 0;
const lib_1 = require("../lib");
const lexer = __importStar(require("../lexer/characters"));
const templateError_1 = require("../templateError");
const obj_1 = require("../obj");
const root_1 = require("../nodes/root");
const literal_1 = require("../nodes/literal");
const nunjucksSymbol_1 = require("../nodes/nunjucksSymbol");
const group_1 = require("../nodes/group");
const arrayNode_1 = require("../nodes/arrayNode");
const pair_1 = require("../nodes/pair");
const dict_1 = require("../nodes/dict");
const lookupVal_1 = require("../nodes/lookupVal");
const if_1 = require("../nodes/if");
const ifAsync_1 = require("../nodes/ifAsync");
const inlineIf_1 = require("../nodes/inlineIf");
const for_1 = require("../nodes/for");
const asyncEach_1 = require("../nodes/asyncEach");
const asyncAll_1 = require("../nodes/asyncAll");
const macro_1 = require("../nodes/macro");
const caller_1 = require("../nodes/caller");
const import_1 = require("../nodes/import");
const funCall_1 = require("../nodes/funCall");
const filter_1 = require("../nodes/filter");
const keywordArgs_1 = require("../nodes/keywordArgs");
const block_1 = require("../nodes/block");
const extends_1 = require("../nodes/extends");
const include_1 = require("../nodes/include");
const set_1 = require("../nodes/set");
const switch_1 = require("../nodes/switch");
const case_1 = require("../nodes/case");
const fromImport_1 = require("../nodes/fromImport");
const output_1 = require("../nodes/output");
const capture_1 = require("../nodes/capture");
const in_1 = require("../lexer/operators/in");
const is_1 = require("../lexer/operators/is");
const or_1 = require("../lexer/operators/or");
const and_1 = require("../lexer/operators/and");
const not_1 = require("../lexer/operators/not");
const add_1 = require("../lexer/operators/add");
const concat_1 = require("../lexer/operators/concat");
const sub_1 = require("../lexer/operators/sub");
const mul_1 = require("../lexer/operators/mul");
const div_1 = require("../lexer/operators/div");
const floorDiv_1 = require("../lexer/operators/floorDiv");
const mod_1 = require("../lexer/operators/mod");
const pow_1 = require("../lexer/operators/pow");
const neg_1 = require("../lexer/operators/neg");
const pos_1 = require("../lexer/operators/pos");
const compare_1 = require("../nodes/compare");
const compareOperand_1 = require("../nodes/compareOperand");
const tokenizer_1 = require("../lexer/tokenizer");
const tokenType_1 = require("../lexer/tokenType");
const templateData_1 = require("../nodes/templateData");
const nunjucksNode_1 = require("../nodes/nunjucksNode");
const parserTokenStream_1 = require("./parserTokenStream");
class Parser extends obj_1.Obj {
    constructor(tokens) {
        super();
        this.tokens = tokens;
        this.peeked = null;
        this.breakOnBlocks = null;
        this.dropLeadingWhitespace = false;
        this.parserTokenStream = new parserTokenStream_1.ParserTokenStream(this.tokens);
        this.extensions = [];
    }
    error(msg, lineno, colno) {
        if (lineno === undefined || colno === undefined) {
            const tok = this.parserTokenStream.peekToken() || { lineno: undefined, colno: undefined };
            lineno = tok.lineno;
            colno = tok.colno;
        }
        if (lineno !== undefined) {
            lineno += 1;
        }
        if (colno !== undefined) {
            colno += 1;
        }
        return new templateError_1.TemplateError(msg, lineno, colno);
    }
    fail(msg, lineno, colno) {
        throw this.error(msg, lineno, colno);
    }
    skip(type) {
        const tok = this.parserTokenStream.nextToken();
        if (!tok || tok.type !== type) {
            this.parserTokenStream.pushToken(tok);
            return false;
        }
        return true;
    }
    expect(type) {
        const tok = this.parserTokenStream.nextToken();
        if (tok.type !== type) {
            this.fail('expected ' + type + ', got ' + tok.type, tok.lineno, tok.colno);
        }
        return tok;
    }
    skipValue(type, val) {
        const tok = this.parserTokenStream.nextToken();
        if (!tok || tok.type !== type || tok.value !== val) {
            this.parserTokenStream.pushToken(tok);
            return false;
        }
        return true;
    }
    skipSymbol(val) {
        return this.skipValue(tokenType_1.TokenType.TOKEN_SYMBOL, val);
    }
    advanceAfterBlockEnd(name) {
        let tok;
        if (!name) {
            tok = this.parserTokenStream.peekToken();
            if (!tok) {
                this.fail('unexpected end of file');
            }
            if (tok.type !== tokenType_1.TokenType.TOKEN_SYMBOL) {
                this.fail('advanceAfterBlockEnd: expected symbol token or ' +
                    'explicit name to be passed');
            }
            name = this.parserTokenStream.nextToken().value;
        }
        tok = this.parserTokenStream.nextToken();
        if (tok && tok.type === tokenType_1.TokenType.TOKEN_BLOCK_END) {
            if (tok.value.charAt(0) === '-') {
                this.dropLeadingWhitespace = true;
            }
        }
        else {
            this.fail('expected block end in ' + name + ' statement');
        }
        return tok;
    }
    advanceAfterVariableEnd() {
        const tok = this.parserTokenStream.nextToken();
        if (tok && tok.type === tokenType_1.TokenType.TOKEN_VARIABLE_END) {
            this.dropLeadingWhitespace = tok.value.charAt(tok.value.length - this.tokens.tags.VARIABLE_END.length - 1) === '-';
        }
        else {
            this.parserTokenStream.pushToken(tok);
            this.fail('expected variable end');
        }
    }
    parseFor() {
        const forTok = this.parserTokenStream.peekToken();
        let node;
        let endBlock;
        if (this.skipSymbol('for')) {
            node = new for_1.For(forTok.lineno, forTok.colno);
            endBlock = 'endfor';
        }
        else if (this.skipSymbol('asyncEach')) {
            node = new asyncEach_1.AsyncEach(forTok.lineno, forTok.colno);
            endBlock = 'endeach';
        }
        else if (this.skipSymbol('asyncAll')) {
            node = new asyncAll_1.AsyncAll(forTok.lineno, forTok.colno);
            endBlock = 'endall';
        }
        else {
            this.fail('parseFor: expected for{Async}', forTok.lineno, forTok.colno);
        }
        node.name = this.parsePrimary();
        if (!(node.name instanceof nunjucksSymbol_1.NunjucksSymbol)) {
            this.fail('parseFor: variable name expected for loop');
        }
        if (this.parserTokenStream.peekToken().type === tokenType_1.TokenType.TOKEN_COMMA) {
            // key/value iteration
            const key = node.name;
            node.name = new arrayNode_1.ArrayNode(forTok.lineno, forTok.colno);
            node.name.addChild(key);
            while (this.skip(tokenType_1.TokenType.TOKEN_COMMA)) {
                const prim = this.parsePrimary();
                node.name.addChild(prim);
            }
        }
        if (!this.skipSymbol('in')) {
            this.fail('parseFor: expected "in" keyword for loop', forTok.lineno, forTok.colno);
        }
        node.arr = this.parseExpression();
        this.advanceAfterBlockEnd(forTok.value);
        node.body = this.parseUntilBlocks(endBlock, 'else');
        if (this.skipSymbol('else')) {
            this.advanceAfterBlockEnd('else');
            node.else_ = this.parseUntilBlocks(endBlock);
        }
        this.advanceAfterBlockEnd();
        return node;
    }
    parseMacro() {
        const macroTok = this.parserTokenStream.peekToken();
        if (!this.skipSymbol('macro')) {
            this.fail('expected macro');
        }
        const name = this.parsePrimary(true);
        const args = this.parseSignature();
        const node = new macro_1.Macro(macroTok.lineno, macroTok.colno, name, args);
        this.advanceAfterBlockEnd(macroTok.value);
        node.body = this.parseUntilBlocks('endmacro');
        this.advanceAfterBlockEnd();
        return node;
    }
    parseCall() {
        // a call block is parsed as a normal FunCall, but with an added
        // 'caller' kwarg which is a Caller node.
        const callTok = this.parserTokenStream.peekToken();
        if (!this.skipSymbol('call')) {
            this.fail('expected call');
        }
        const callerArgs = this.parseSignature(true) || new nunjucksNode_1.NunjucksNodeList(callTok.lineno, callTok.colno);
        const macroCall = this.parsePrimary();
        this.advanceAfterBlockEnd(callTok.value);
        const body = this.parseUntilBlocks('endcall');
        this.advanceAfterBlockEnd();
        const callerName = new nunjucksSymbol_1.NunjucksSymbol(callTok.lineno, callTok.colno, 'caller');
        const callerNode = new caller_1.Caller(callTok.lineno, callTok.colno, callerName, callerArgs, body);
        // add the additional caller kwarg, adding kwargs if necessary
        const args = macroCall.args.children;
        if (!(args[args.length - 1] instanceof keywordArgs_1.KeywordArgs)) {
            args.push(new keywordArgs_1.KeywordArgs(callTok.lineno, callTok.colno));
        }
        const kwargs = args[args.length - 1];
        kwargs.addChild(new pair_1.Pair(callTok.lineno, callTok.colno, callerName, callerNode));
        return new output_1.Output(callTok.lineno, callTok.colno, [macroCall]);
    }
    parseWithContext() {
        const tok = this.parserTokenStream.peekToken();
        let withContext = null;
        if (this.skipSymbol('with')) {
            withContext = true;
        }
        else if (this.skipSymbol('without')) {
            withContext = false;
        }
        if (withContext !== null) {
            if (!this.skipSymbol('context')) {
                this.fail('parseFrom: expected context after with/without', tok.lineno, tok.colno);
            }
        }
        return withContext;
    }
    parseImport() {
        const importTok = this.parserTokenStream.peekToken();
        if (!this.skipSymbol('import')) {
            this.fail('parseImport: expected import', importTok.lineno, importTok.colno);
        }
        const template = this.parseExpression();
        if (!this.skipSymbol('as')) {
            this.fail('parseImport: expected "as" keyword', importTok.lineno, importTok.colno);
        }
        const target = this.parseExpression();
        const withContext = this.parseWithContext();
        const node = new import_1.Import(importTok.lineno, importTok.colno, template, target, withContext);
        this.advanceAfterBlockEnd(importTok.value);
        return node;
    }
    parseFrom() {
        const fromTok = this.parserTokenStream.peekToken();
        if (!this.skipSymbol('from')) {
            this.fail('parseFrom: expected from');
        }
        const template = this.parseExpression();
        if (!this.skipSymbol('import')) {
            this.fail('parseFrom: expected import', fromTok.lineno, fromTok.colno);
        }
        const names = new nunjucksNode_1.NunjucksNodeList(fromTok.lineno, fromTok.colno);
        let withContext;
        while (1) { // eslint-disable-line no-constant-condition
            const nextTok = this.parserTokenStream.peekToken();
            if (nextTok.type === tokenType_1.TokenType.TOKEN_BLOCK_END) {
                if (!names.children.length) {
                    this.fail('parseFrom: Expected at least one import name', fromTok.lineno, fromTok.colno);
                }
                // Since we are manually advancing past the block end,
                // need to keep track of whitespace control (normally
                // this is done in `advanceAfterBlockEnd`
                if (nextTok.value.charAt(0) === '-') {
                    this.dropLeadingWhitespace = true;
                }
                this.parserTokenStream.nextToken();
                break;
            }
            if (names.children.length > 0 && !this.skip(tokenType_1.TokenType.TOKEN_COMMA)) {
                this.fail('parseFrom: expected comma', fromTok.lineno, fromTok.colno);
            }
            const name = this.parsePrimary();
            if (name.value.charAt(0) === '_') {
                this.fail('parseFrom: names starting with an underscore cannot be imported', name.lineno, name.colno);
            }
            if (this.skipSymbol('as')) {
                const alias = this.parsePrimary();
                names.addChild(new pair_1.Pair(name.lineno, name.colno, name, alias));
            }
            else {
                names.addChild(name);
            }
            withContext = this.parseWithContext();
        }
        return new fromImport_1.FromImport(fromTok.lineno, fromTok.colno, template, names, withContext);
    }
    parseBlock() {
        const tag = this.parserTokenStream.peekToken();
        if (!this.skipSymbol('block')) {
            this.fail('parseBlock: expected block', tag.lineno, tag.colno);
        }
        const node = new block_1.Block(tag.lineno, tag.colno);
        node.name = this.parsePrimary();
        if (!(node.name instanceof nunjucksSymbol_1.NunjucksSymbol)) {
            this.fail('parseBlock: variable name expected', tag.lineno, tag.colno);
        }
        this.advanceAfterBlockEnd(tag.value);
        node.body = this.parseUntilBlocks('endblock');
        this.skipSymbol('endblock');
        this.skipSymbol(node.name.value);
        const tok = this.parserTokenStream.peekToken();
        if (!tok) {
            this.fail('parseBlock: expected endblock, got end of file');
        }
        this.advanceAfterBlockEnd(tok.value);
        return node;
    }
    parseExtends() {
        const tagName = 'extends';
        const tag = this.parserTokenStream.peekToken();
        if (!this.skipSymbol(tagName)) {
            this.fail('parseTemplateRef: expected ' + tagName);
        }
        const node = new extends_1.Extends(tag.lineno, tag.colno);
        node.template = this.parseExpression();
        this.advanceAfterBlockEnd(tag.value);
        return node;
    }
    parseInclude() {
        const tagName = 'include';
        const tag = this.parserTokenStream.peekToken();
        if (!this.skipSymbol(tagName)) {
            this.fail('parseInclude: expected ' + tagName);
        }
        const node = new include_1.Include(tag.lineno, tag.colno);
        node.template = this.parseExpression();
        if (this.skipSymbol('ignore') && this.skipSymbol('missing')) {
            node.ignoreMissing = true;
        }
        this.advanceAfterBlockEnd(tag.value);
        return node;
    }
    parseIf() {
        const tag = this.parserTokenStream.peekToken();
        let node;
        if (this.skipSymbol('if') || this.skipSymbol('elif') || this.skipSymbol('elseif')) {
            node = new if_1.If(tag.lineno, tag.colno);
        }
        else if (this.skipSymbol('ifAsync')) {
            node = new ifAsync_1.IfAsync(tag.lineno, tag.colno);
        }
        else {
            this.fail('parseIf: expected if, elif, or elseif', tag.lineno, tag.colno);
        }
        node.cond = this.parseExpression();
        this.advanceAfterBlockEnd(tag.value);
        node.body = this.parseUntilBlocks('elif', 'elseif', 'else', 'endif');
        const tok = this.parserTokenStream.peekToken();
        switch (tok && tok.value) {
            case 'elseif':
            case 'elif':
                node.else_ = this.parseIf();
                break;
            case 'else':
                this.advanceAfterBlockEnd();
                node.else_ = this.parseUntilBlocks('endif');
                this.advanceAfterBlockEnd();
                break;
            case 'endif':
                node.else_ = null;
                this.advanceAfterBlockEnd();
                break;
            default:
                this.fail('parseIf: expected elif, else, or endif, got end of file');
        }
        return node;
    }
    parseSet() {
        const tag = this.parserTokenStream.peekToken();
        if (!this.skipSymbol('set')) {
            this.fail('parseSet: expected set', tag.lineno, tag.colno);
        }
        const node = new set_1.Set(tag.lineno, tag.colno, []);
        let target;
        while ((target = this.parsePrimary())) {
            node.targets.push(target);
            if (!this.skip(tokenType_1.TokenType.TOKEN_COMMA)) {
                break;
            }
        }
        if (!this.skipValue(tokenType_1.TokenType.TOKEN_OPERATOR, '=')) {
            if (!this.skip(tokenType_1.TokenType.TOKEN_BLOCK_END)) {
                this.fail('parseSet: expected = or block end in set tag', tag.lineno, tag.colno);
            }
            else {
                node.body = new capture_1.Capture(tag.lineno, tag.colno, this.parseUntilBlocks('endset'));
                node.value = null;
                this.advanceAfterBlockEnd();
            }
        }
        else {
            node.value = this.parseExpression();
            this.advanceAfterBlockEnd(tag.value);
        }
        return node;
    }
    parseSwitch() {
        /*
         * Store the tag names in variables in case someone ever wants to
         * customize this.
         */
        const switchStart = 'switch';
        const switchEnd = 'endswitch';
        const caseStart = 'case';
        const caseDefault = 'default';
        // Get the switch tag.
        const tag = this.parserTokenStream.peekToken();
        // fail early if we get some unexpected tag.
        if (!this.skipSymbol(switchStart)
            && !this.skipSymbol(caseStart)
            && !this.skipSymbol(caseDefault)) {
            this.fail('parseSwitch: expected "switch," "case" or "default"', tag.lineno, tag.colno);
        }
        // parse the switch expression
        const expr = this.parseExpression();
        // advance until a start of a case, a default case or an endswitch.
        this.advanceAfterBlockEnd(switchStart);
        this.parseUntilBlocks(caseStart, caseDefault, switchEnd);
        // this is the first case. it could also be an endswitch, we'll check.
        let tok = this.parserTokenStream.peekToken();
        // create new variables for our cases and default case.
        const cases = [];
        let defaultCase;
        // while we're dealing with new cases nodes...
        do {
            // skip the start symbol and get the case expression
            this.skipSymbol(caseStart);
            const cond = this.parseExpression();
            this.advanceAfterBlockEnd(switchStart);
            // get the body of the case node and add it to the array of cases.
            const body = this.parseUntilBlocks(caseStart, caseDefault, switchEnd);
            cases.push(new case_1.Case(tok.lineno, tok.colno, cond, body));
            // get our next case
            tok = this.parserTokenStream.peekToken();
        } while (tok && tok.value === caseStart);
        // we either have a default case or a switch end.
        switch (tok.value) {
            case caseDefault:
                this.advanceAfterBlockEnd();
                defaultCase = this.parseUntilBlocks(switchEnd);
                this.advanceAfterBlockEnd();
                break;
            case switchEnd:
                this.advanceAfterBlockEnd();
                break;
            default:
                // otherwise bail because EOF
                this.fail('parseSwitch: expected "case," "default" or "endswitch," got EOF.');
        }
        // and return the switch node.
        return new switch_1.Switch(tag.lineno, tag.colno, expr, cases, defaultCase);
    }
    parseStatement() {
        const tok = this.parserTokenStream.peekToken();
        if (tok.type !== tokenType_1.TokenType.TOKEN_SYMBOL) {
            this.fail('tag name expected', tok.lineno, tok.colno);
        }
        if (this.breakOnBlocks &&
            lib_1.indexOf(this.breakOnBlocks, tok.value) !== -1) {
            return null;
        }
        switch (tok.value) {
            case 'raw':
                return this.parseRaw();
            case 'verbatim':
                return this.parseRaw('verbatim');
            case 'if':
            case 'ifAsync':
                return this.parseIf();
            case 'for':
            case 'asyncEach':
            case 'asyncAll':
                return this.parseFor();
            case 'block':
                return this.parseBlock();
            case 'extends':
                return this.parseExtends();
            case 'include':
                return this.parseInclude();
            case 'set':
                return this.parseSet();
            case 'macro':
                return this.parseMacro();
            case 'call':
                return this.parseCall();
            case 'import':
                return this.parseImport();
            case 'from':
                return this.parseFrom();
            case 'filter':
                return this.parseFilterStatement();
            case 'switch':
                return this.parseSwitch();
            default:
                if (this.extensions.length) {
                    for (let i = 0; i < this.extensions.length; i++) {
                        const ext = this.extensions[i];
                        if (lib_1.indexOf(ext.tags || [], tok.value) !== -1) {
                            return ext.parse(this, undefined, lexer); // TODO: Handle missing nodes declaration
                        }
                    }
                }
                this.fail('unknown block tag: ' + tok.value, tok.lineno, tok.colno);
        }
        return undefined;
    }
    parseRaw(tagName) {
        tagName = tagName || 'raw';
        const endTagName = 'end' + tagName;
        // Look for upcoming raw blocks (ignore all other kinds of blocks)
        const rawBlockRegex = new RegExp('([\\s\\S]*?){%\\s*(' + tagName + '|' + endTagName + ')\\s*(?=%})%}');
        let rawLevel = 1;
        let str = '';
        let matches = null;
        // Skip opening raw token
        // Keep this token to track line and column numbers
        const begun = this.advanceAfterBlockEnd();
        // Exit when there's nothing to match
        // or when we've found the matching "endraw" block
        while ((matches = this.tokens._extractRegex(rawBlockRegex)) && rawLevel > 0) {
            const all = matches[0];
            const pre = matches[1];
            const blockName = matches[2];
            // Adjust rawlevel
            if (blockName === tagName) {
                rawLevel += 1;
            }
            else if (blockName === endTagName) {
                rawLevel -= 1;
            }
            // Add to str
            if (rawLevel === 0) {
                // We want to exclude the last "endraw"
                str += pre;
                // Move tokenizer to beginning of endraw block
                this.tokens.backN(all.length - pre.length);
            }
            else {
                str += all;
            }
        }
        return new output_1.Output(begun.lineno, begun.colno, [new templateData_1.TemplateData(begun.lineno, begun.colno, str)]);
    }
    parsePostfix(node) {
        let lookup;
        let tok = this.parserTokenStream.peekToken();
        while (tok) {
            if (tok.type === tokenType_1.TokenType.TOKEN_LEFT_PAREN) {
                // Function call
                node = new funCall_1.FunCall(tok.lineno, tok.colno, node, this.parseSignature());
            }
            else if (tok.type === tokenType_1.TokenType.TOKEN_LEFT_BRACKET) {
                // Reference
                lookup = this.parseAggregate();
                if (lookup.children.length > 1) {
                    this.fail('invalid index');
                }
                node = new lookupVal_1.LookupVal(tok.lineno, tok.colno, node, lookup.children[0]);
            }
            else if (tok.type === tokenType_1.TokenType.TOKEN_OPERATOR && tok.value === '.') {
                // Reference
                this.parserTokenStream.nextToken();
                const val = this.parserTokenStream.nextToken();
                if (val.type !== tokenType_1.TokenType.TOKEN_SYMBOL) {
                    this.fail('expected name as lookup value, got ' + val.value, val.lineno, val.colno);
                }
                // Make a literal string because it's not a variable
                // reference
                lookup = new literal_1.Literal(val.lineno, val.lineno, val.value);
                node = new lookupVal_1.LookupVal(tok.lineno, tok.colno, node, lookup);
            }
            else {
                break;
            }
            tok = this.parserTokenStream.peekToken();
        }
        return node;
    }
    parseExpression() {
        return this.parseInlineIf();
    }
    parseInlineIf() {
        let node = this.parseOr();
        if (this.skipSymbol('if')) {
            const condNode = this.parseOr();
            const bodyNode = node;
            node = new inlineIf_1.InlineIf(node.lineno, node.colno);
            node.body = bodyNode;
            node.cond = condNode;
            if (this.skipSymbol('else')) {
                node.else_ = this.parseOr();
            }
            else {
                node.else_ = null;
            }
        }
        return node;
    }
    parseOr() {
        let node = this.parseAnd();
        while (this.skipSymbol('or')) {
            const node2 = this.parseAnd();
            node = new or_1.Or(node.lineno, node.colno, node, node2);
        }
        return node;
    }
    parseAnd() {
        let node = this.parseNot();
        while (this.skipSymbol('and')) {
            const node2 = this.parseNot();
            node = new and_1.And(node.lineno, node.colno, node, node2);
        }
        return node;
    }
    parseNot() {
        const tok = this.parserTokenStream.peekToken();
        if (this.skipSymbol('not')) {
            return new not_1.Not(tok.lineno, tok.colno, this.parseNot());
        }
        return this.parseIn();
    }
    parseIn() {
        let node = this.parseIs();
        while (1) { // eslint-disable-line no-constant-condition
            // check if the next token is 'not'
            const tok = this.parserTokenStream.nextToken();
            if (!tok) {
                break;
            }
            const invert = tok.type === tokenType_1.TokenType.TOKEN_SYMBOL && tok.value === 'not';
            // if it wasn't 'not', put it back
            if (!invert) {
                this.parserTokenStream.pushToken(tok);
            }
            if (this.skipSymbol('in')) {
                const node2 = this.parseIs();
                node = new in_1.In(node.lineno, node.colno, node, node2);
                if (invert) {
                    node = new not_1.Not(node.lineno, node.colno, node);
                }
            }
            else {
                // if we'd found a 'not' but this wasn't an 'in', put back the 'not'
                if (invert) {
                    this.parserTokenStream.pushToken(tok);
                }
                break;
            }
        }
        return node;
    }
    // I put this right after "in" in the operator precedence stack. That can
    // obviously be changed to be closer to Jinja.
    parseIs() {
        let node = this.parseCompare();
        // look for an is
        if (this.skipSymbol('is')) {
            // look for a not
            const not = this.skipSymbol('not');
            // get the next node
            const node2 = this.parseCompare();
            // create an Is node using the next node and the info from our Is node.
            node = new is_1.Is(node.lineno, node.colno, node, node2);
            // if we have a Not, create a Not node from our Is node.
            if (not) {
                node = new not_1.Not(node.lineno, node.colno, node);
            }
        }
        // return the node.
        return node;
    }
    parseCompare() {
        const compareOps = ['==', '===', '!=', '!==', '<', '>', '<=', '>='];
        const expr = this.parseConcat();
        const ops = [];
        while (1) { // eslint-disable-line no-constant-condition
            const tok = this.parserTokenStream.nextToken();
            if (!tok) {
                break;
            }
            else if (compareOps.indexOf(tok.value) !== -1) {
                ops.push(new compareOperand_1.CompareOperand(tok.lineno, tok.colno, this.parseConcat(), tok.value));
            }
            else {
                this.parserTokenStream.pushToken(tok);
                break;
            }
        }
        if (ops.length) {
            return new compare_1.Compare(ops[0].lineno, ops[0].colno, expr, ops);
        }
        else {
            return expr;
        }
    }
    // finds the '~' for string concatenation
    parseConcat() {
        let node = this.parseAdd();
        while (this.skipValue(tokenType_1.TokenType.TOKEN_TILDE, '~')) {
            const node2 = this.parseAdd();
            node = new concat_1.Concat(node.lineno, node.colno, node, node2);
        }
        return node;
    }
    parseAdd() {
        let node = this.parseSub();
        while (this.skipValue(tokenType_1.TokenType.TOKEN_OPERATOR, '+')) {
            const node2 = this.parseSub();
            node = new add_1.Add(node.lineno, node.colno, node, node2);
        }
        return node;
    }
    parseSub() {
        let node = this.parseMul();
        while (this.skipValue(tokenType_1.TokenType.TOKEN_OPERATOR, '-')) {
            const node2 = this.parseMul();
            node = new sub_1.Sub(node.lineno, node.colno, node, node2);
        }
        return node;
    }
    parseMul() {
        let node = this.parseDiv();
        while (this.skipValue(tokenType_1.TokenType.TOKEN_OPERATOR, '*')) {
            const node2 = this.parseDiv();
            node = new mul_1.Mul(node.lineno, node.colno, node, node2);
        }
        return node;
    }
    parseDiv() {
        let node = this.parseFloorDiv();
        while (this.skipValue(tokenType_1.TokenType.TOKEN_OPERATOR, '/')) {
            const node2 = this.parseFloorDiv();
            node = new div_1.Div(node.lineno, node.colno, node, node2);
        }
        return node;
    }
    parseFloorDiv() {
        let node = this.parseMod();
        while (this.skipValue(tokenType_1.TokenType.TOKEN_OPERATOR, '//')) {
            const node2 = this.parseMod();
            node = new floorDiv_1.FloorDiv(node.lineno, node.colno, node, node2);
        }
        return node;
    }
    parseMod() {
        let node = this.parsePow();
        while (this.skipValue(tokenType_1.TokenType.TOKEN_OPERATOR, '%')) {
            const node2 = this.parsePow();
            node = new mod_1.Mod(node.lineno, node.colno, node, node2);
        }
        return node;
    }
    parsePow() {
        let node = this.parseUnary();
        while (this.skipValue(tokenType_1.TokenType.TOKEN_OPERATOR, '**')) {
            const node2 = this.parseUnary();
            node = new pow_1.Pow(node.lineno, node.colno, node, node2);
        }
        return node;
    }
    parseUnary(noFilters) {
        const tok = this.parserTokenStream.peekToken();
        let node;
        if (this.skipValue(tokenType_1.TokenType.TOKEN_OPERATOR, '-')) {
            node = new neg_1.Neg(tok.lineno, tok.colno, this.parseUnary(true));
        }
        else if (this.skipValue(tokenType_1.TokenType.TOKEN_OPERATOR, '+')) {
            node = new pos_1.Pos(tok.lineno, tok.colno, this.parseUnary(true));
        }
        else {
            node = this.parsePrimary();
        }
        if (!noFilters) {
            node = this.parseFilter(node);
        }
        return node;
    }
    parsePrimary(noPostfix = false) {
        const tok = this.parserTokenStream.nextToken();
        let val;
        if (!tok) {
            this.fail('expected expression, got end of file');
        }
        else if (tok.type === tokenType_1.TokenType.TOKEN_STRING) {
            val = tok.value;
        }
        else if (tok.type === tokenType_1.TokenType.TOKEN_INT) {
            val = parseInt(tok.value, 10);
        }
        else if (tok.type === tokenType_1.TokenType.TOKEN_FLOAT) {
            val = parseFloat(tok.value);
        }
        else if (tok.type === tokenType_1.TokenType.TOKEN_BOOLEAN) {
            if (tok.value === 'true') {
                val = true;
            }
            else if (tok.value === 'false') {
                val = false;
            }
            else {
                this.fail('invalid boolean: ' + tok.value, tok.lineno, tok.colno);
            }
        }
        else if (tok.type === tokenType_1.TokenType.TOKEN_NONE) {
            val = null;
        }
        else if (tok.type === tokenType_1.TokenType.TOKEN_REGEX) {
            val = new RegExp(tok.value.body, tok.value.flags);
        }
        let node;
        if (val !== undefined) {
            node = new literal_1.Literal(tok.lineno, tok.lineno, val);
        }
        else if (tok.type === tokenType_1.TokenType.TOKEN_SYMBOL) {
            node = new nunjucksSymbol_1.NunjucksSymbol(tok.lineno, tok.colno, tok.value);
        }
        else {
            // See if it's an aggregate type, we need to push the
            // current delimiter token back on
            this.parserTokenStream.pushToken(tok);
            node = this.parseAggregate();
        }
        if (!noPostfix) {
            node = this.parsePostfix(node);
        }
        if (node) {
            return node;
        }
        else {
            throw this.error(`unexpected token: ${tok.value}`, tok.lineno, tok.colno);
        }
    }
    parseFilterName() {
        const tok = this.expect(tokenType_1.TokenType.TOKEN_SYMBOL);
        let name = tok.value;
        while (this.skipValue(tokenType_1.TokenType.TOKEN_OPERATOR, '.')) {
            name += '.' + this.expect(tokenType_1.TokenType.TOKEN_SYMBOL).value;
        }
        return new nunjucksSymbol_1.NunjucksSymbol(tok.lineno, tok.colno, tok.value);
    }
    parseFilterArgs(node) {
        if (this.parserTokenStream.peekToken().type === tokenType_1.TokenType.TOKEN_LEFT_PAREN) {
            // Get a FunCall node and add the parameters to the
            // filter
            const call = this.parsePostfix(node);
            return call.args.children;
        }
        return [];
    }
    parseFilter(node) {
        while (this.skip(tokenType_1.TokenType.TOKEN_PIPE)) {
            const name = this.parseFilterName();
            node = new filter_1.Filter(name.lineno, name.colno, name, new nunjucksNode_1.NunjucksNodeList(name.lineno, name.colno, [node, ...this.parseFilterArgs(node)]));
        }
        return node;
    }
    parseFilterStatement() {
        const filterTok = this.parserTokenStream.peekToken();
        if (!this.skipSymbol('filter')) {
            this.fail('parseFilterStatement: expected filter');
        }
        const name = this.parseFilterName();
        const args = this.parseFilterArgs(name);
        this.advanceAfterBlockEnd(filterTok.value);
        const body = new capture_1.Capture(name.lineno, name.colno, this.parseUntilBlocks('endset'));
        this.advanceAfterBlockEnd();
        const node = new filter_1.Filter(name.lineno, name.colno, name, new nunjucksNode_1.NunjucksNodeList(name.lineno, name.colno, [body, ...args]));
        return new output_1.Output(name.lineno, name.colno, [node]);
    }
    parseAggregate() {
        const tok = this.parserTokenStream.nextToken();
        let node;
        switch (tok.type) {
            case tokenType_1.TokenType.TOKEN_LEFT_PAREN:
                node = new group_1.Group(tok.lineno, tok.colno);
                break;
            case tokenType_1.TokenType.TOKEN_LEFT_BRACKET:
                node = new arrayNode_1.ArrayNode(tok.lineno, tok.colno);
                break;
            case tokenType_1.TokenType.TOKEN_LEFT_CURLY:
                node = new dict_1.Dict(tok.lineno, tok.colno);
                break;
            default:
                return null;
        }
        while (1) { // eslint-disable-line no-constant-condition
            const type = this.parserTokenStream.peekToken().type;
            if (type === tokenType_1.TokenType.TOKEN_RIGHT_PAREN ||
                type === tokenType_1.TokenType.TOKEN_RIGHT_BRACKET ||
                type === tokenType_1.TokenType.TOKEN_RIGHT_CURLY) {
                this.parserTokenStream.nextToken();
                break;
            }
            if (node.children.length > 0) {
                if (!this.skip(tokenType_1.TokenType.TOKEN_COMMA)) {
                    this.fail('parseAggregate: expected comma after expression', tok.lineno, tok.colno);
                }
            }
            if (node instanceof dict_1.Dict) {
                // TODO: check for errors
                const key = this.parsePrimary();
                // We expect a key/value pair for dicts, separated by a
                // colon
                if (!this.skip(tokenType_1.TokenType.TOKEN_COLON)) {
                    this.fail('parseAggregate: expected colon after dict key', tok.lineno, tok.colno);
                }
                // TODO: check for errors
                const value = this.parseExpression();
                node.addChild(new pair_1.Pair(key.lineno, key.colno, key, value));
            }
            else {
                // TODO: check for errors
                const expr = this.parseExpression();
                node.addChild(expr);
            }
        }
        return node;
    }
    parseSignature(tolerant, noParens) {
        let tok = this.parserTokenStream.peekToken();
        if (!noParens && tok.type !== tokenType_1.TokenType.TOKEN_LEFT_PAREN) {
            if (tolerant) {
                return null;
            }
            else {
                this.fail('expected arguments', tok.lineno, tok.colno);
            }
        }
        if (tok.type === tokenType_1.TokenType.TOKEN_LEFT_PAREN) {
            tok = this.parserTokenStream.nextToken();
        }
        const args = new nunjucksNode_1.NunjucksNodeList(tok.lineno, tok.colno);
        const kwargs = new keywordArgs_1.KeywordArgs(tok.lineno, tok.colno);
        let checkComma = false;
        while (1) { // eslint-disable-line no-constant-condition
            tok = this.parserTokenStream.peekToken();
            if (!noParens && tok.type === tokenType_1.TokenType.TOKEN_RIGHT_PAREN) {
                this.parserTokenStream.nextToken();
                break;
            }
            else if (noParens && tok.type === tokenType_1.TokenType.TOKEN_BLOCK_END) {
                break;
            }
            if (checkComma && !this.skip(tokenType_1.TokenType.TOKEN_COMMA)) {
                this.fail('parseSignature: expected comma after expression', tok.lineno, tok.colno);
            }
            else {
                const arg = this.parseExpression();
                if (this.skipValue(tokenType_1.TokenType.TOKEN_OPERATOR, '=')) {
                    kwargs.addChild(new pair_1.Pair(arg.lineno, arg.colno, arg, this.parseExpression()));
                }
                else {
                    args.addChild(arg);
                }
            }
            checkComma = true;
        }
        if (kwargs.children.length) {
            args.addChild(kwargs);
        }
        return args;
    }
    parseUntilBlocks(...blockNames) {
        const prev = this.breakOnBlocks;
        this.breakOnBlocks = blockNames;
        const ret = this.parse();
        this.breakOnBlocks = prev;
        return ret;
    }
    parseNodes() {
        let tok;
        const buf = [];
        while ((tok = this.parserTokenStream.nextToken())) {
            if (tok.type === tokenType_1.TokenType.TOKEN_DATA) {
                let data = tok.value;
                const nextToken = this.parserTokenStream.peekToken();
                const nextVal = nextToken && nextToken.value;
                // If the last token has "-" we need to trim the
                // leading whitespace of the data. This is marked with
                // the `dropLeadingWhitespace` variable.
                if (this.dropLeadingWhitespace) {
                    // TODO: this could be optimized (don't use regex)
                    data = data.replace(/^\s*/, '');
                    this.dropLeadingWhitespace = false;
                }
                // Same for the succeeding block start token
                if (nextToken &&
                    ((nextToken.type === tokenType_1.TokenType.TOKEN_BLOCK_START && nextVal.charAt(nextVal.length - 1) === '-') ||
                        (nextToken.type === tokenType_1.TokenType.TOKEN_VARIABLE_START && nextVal.charAt(this.tokens.tags.VARIABLE_START.length) === '-') ||
                        (nextToken.type === tokenType_1.TokenType.TOKEN_COMMENT && nextVal.charAt(this.tokens.tags.COMMENT_START.length) === '-'))) {
                    // TODO: this could be optimized (don't use regex)
                    data = data.replace(/\s*$/, '');
                }
                buf.push(new output_1.Output(tok.lineno, tok.colno, [new templateData_1.TemplateData(tok.lineno, tok.colno, data)]));
            }
            else if (tok.type === tokenType_1.TokenType.TOKEN_BLOCK_START) {
                this.dropLeadingWhitespace = false;
                const n = this.parseStatement();
                if (!n) {
                    break;
                }
                buf.push(n);
            }
            else if (tok.type === tokenType_1.TokenType.TOKEN_VARIABLE_START) {
                const e = this.parseExpression();
                this.dropLeadingWhitespace = false;
                this.advanceAfterVariableEnd();
                buf.push(new output_1.Output(tok.lineno, tok.colno, [e]));
            }
            else if (tok.type === tokenType_1.TokenType.TOKEN_COMMENT) {
                this.dropLeadingWhitespace = tok.value.charAt(tok.value.length - this.tokens.tags.COMMENT_END.length - 1) === '-';
            }
            else {
                // Ignore comments, otherwise this should be an error
                this.fail('Unexpected token at top-level: ' +
                    tok.type, tok.lineno, tok.colno);
            }
        }
        return buf;
    }
    parse() {
        return new nunjucksNode_1.NunjucksNodeList(0, 0, this.parseNodes());
    }
    parseAsRoot() {
        return new root_1.Root(0, 0, this.parseNodes());
    }
}
exports.Parser = Parser;
// var util = require('util');
// var l = lex('{%- if x -%}\n hello {% endif %}');
// var t;
// while((t = l.nextToken())) {
//     console.log(util.inspect(t));
// }
// var p = new Parser(lex('hello {% filter title %}' +
//                              'Hello madam how are you' +
//                              '{% endfilter %}'));
// var n = p.parseAsRoot();
// nodes.printNodes(n);
function parse(src, extensions, opts) {
    const p = new Parser(new tokenizer_1.Tokenizer(src, opts));
    if (extensions !== undefined) {
        p.extensions = extensions;
    }
    return p.parseAsRoot();
}
exports.parse = parse;
//# sourceMappingURL=parser.js.map