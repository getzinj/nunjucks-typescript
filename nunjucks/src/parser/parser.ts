'use strict';

import { indexOf } from '../lib';
import * as lexer from '../lexer/characters';
import { TemplateError } from '../templateError';
import { Obj } from '../obj';
import { Root } from '../nodes/root';
import { Literal } from '../nodes/literal';
import { NunjucksSymbol } from '../nodes/nunjucksSymbol';
import { Group } from '../nodes/group';
import { ArrayNode } from '../nodes/arrayNode';
import { Pair } from '../nodes/pair';
import { Dict } from '../nodes/dict';
import { LookupVal } from '../nodes/lookupVal';
import { If } from '../nodes/if';
import { IfAsync } from '../nodes/ifAsync';
import { InlineIf } from '../nodes/inlineIf';
import { For } from '../nodes/for';
import { AsyncEach } from '../nodes/asyncEach';
import { AsyncAll } from '../nodes/asyncAll';
import { Macro } from '../nodes/macro';
import { Caller } from '../nodes/caller';
import { Import } from '../nodes/import';
import { FunCall } from '../nodes/funCall';
import { Filter } from '../nodes/filter';
import { KeywordArgs } from '../nodes/keywordArgs';
import { Block } from '../nodes/block';
import { Extends } from '../nodes/extends';
import { Include } from '../nodes/include';
import { Set } from '../nodes/set';
import { Switch } from '../nodes/switch';
import { Case } from '../nodes/case';
import { FromImport } from '../nodes/fromImport';
import { Output } from '../nodes/output';
import { Capture } from '../nodes/capture';
import { In } from '../lexer/operators/in';
import { Is } from '../lexer/operators/is';
import { Or } from '../lexer/operators/or';
import { And } from '../lexer/operators/and';
import { Not } from '../lexer/operators/not';
import { Add } from '../lexer/operators/add';
import { Concat } from '../lexer/operators/concat';
import { Sub } from '../lexer/operators/sub';
import { Mul } from '../lexer/operators/mul';
import { Div } from '../lexer/operators/div';
import { FloorDiv } from '../lexer/operators/floorDiv';
import { Mod } from '../lexer/operators/mod';
import { Pow } from '../lexer/operators/pow';
import { Neg } from '../lexer/operators/neg';
import { Pos } from '../lexer/operators/pos';
import { Compare } from '../nodes/compare';
import { CompareOperand } from '../nodes/compareOperand';
import { Tokenizer } from '../lexer/tokenizer';
import { Token } from '../lexer/token';
import { TokenType } from '../lexer/tokenType';
import { TemplateData } from '../nodes/templateData';
import { NunjucksNode, NunjucksNodeList } from '../nodes/nunjucksNode';
import { ParserTokenStream } from './parserTokenStream';
import { IParser } from './IParser';
import { IExtension } from './IExtension';



export class Parser extends Obj implements IParser {
  extensions: IExtension[] | undefined;
  private dropLeadingWhitespace: boolean;
  private breakOnBlocks: string[] | undefined;
  private peeked: Token | null;
  readonly parserTokenStream: ParserTokenStream;


  constructor(public readonly tokens: Tokenizer) {
    super();

    this.peeked = null;
    this.breakOnBlocks = null;
    this.dropLeadingWhitespace = false;

    this.parserTokenStream = new ParserTokenStream(this.tokens);

    this.extensions = [];
  }


  error(msg, lineno, colno): TemplateError {
    if (lineno === undefined || colno === undefined) {
      const tok: Token | { lineno: undefined; colno: undefined } = this.parserTokenStream.peekToken() || { lineno: undefined, colno: undefined };
      lineno = tok.lineno;
      colno = tok.colno;
    }
    if (lineno !== undefined) {
      lineno += 1;
    }
    if (colno !== undefined) {
      colno += 1;
    }
    return new TemplateError(msg, lineno, colno);
  }


  fail(msg, lineno?: number, colno?: number): void {
    throw this.error(msg, lineno, colno);
  }


  skip(type): boolean {
    const tok: Token = this.parserTokenStream.nextToken();
    if (!tok || tok.type !== type) {
      this.parserTokenStream.pushToken(tok);
      return false;
    }
    return true;
  }


  expect(type: string): Token {
    const tok: Token = this.parserTokenStream.nextToken();
    if (tok.type !== type) {
      this.fail('expected ' + type + ', got ' + tok.type,
        tok.lineno,
        tok.colno);
    }
    return tok;
  }


  skipValue(type, val): boolean {
    const tok: Token = this.parserTokenStream.nextToken();
    if (!tok || tok.type !== type || tok.value !== val) {
      this.parserTokenStream.pushToken(tok);
      return false;
    }
    return true;
  }


  skipSymbol(val): boolean {
    return this.skipValue(TokenType.TOKEN_SYMBOL, val);
  }


  advanceAfterBlockEnd(name?: string): Token {
    let tok: Token;
    if (!name) {
      tok = this.parserTokenStream.peekToken();

      if (!tok) {
        this.fail('unexpected end of file');
      }

      if (tok.type !== TokenType.TOKEN_SYMBOL) {
        this.fail('advanceAfterBlockEnd: expected symbol token or ' +
          'explicit name to be passed');
      }

      name = this.parserTokenStream.nextToken().value;
    }

    tok = this.parserTokenStream.nextToken();

    if (tok && tok.type === TokenType.TOKEN_BLOCK_END) {
      if (tok.value.charAt(0) === '-') {
        this.dropLeadingWhitespace = true;
      }
    } else {
      this.fail('expected block end in ' + name + ' statement');
    }

    return tok;
  }


  advanceAfterVariableEnd(): void {
    const tok: Token = this.parserTokenStream.nextToken();

    if (tok && tok.type === TokenType.TOKEN_VARIABLE_END) {
      this.dropLeadingWhitespace = tok.value.charAt(
        tok.value.length - this.tokens.tags.VARIABLE_END.length - 1
      ) === '-';
    } else {
      this.parserTokenStream.pushToken(tok);
      this.fail('expected variable end');
    }
  }


  parseFor(): For {
    const forTok: Token = this.parserTokenStream.peekToken();
    let node: For;
    let endBlock: string;

    if (this.skipSymbol('for')) {
      node = new For(forTok.lineno, forTok.colno);
      endBlock = 'endfor';
    } else if (this.skipSymbol('asyncEach')) {
      node = new AsyncEach(forTok.lineno, forTok.colno);
      endBlock = 'endeach';
    } else if (this.skipSymbol('asyncAll')) {
      node = new AsyncAll(forTok.lineno, forTok.colno);
      endBlock = 'endall';
    } else {
      this.fail('parseFor: expected for{Async}', forTok.lineno, forTok.colno);
    }

    node.name = this.parsePrimary();

    if (!(node.name instanceof NunjucksSymbol)) {
      this.fail('parseFor: variable name expected for loop');
    }

    if (this.parserTokenStream.peekToken().type === TokenType.TOKEN_COMMA) {
      // key/value iteration
      const key: NunjucksNode = node.name;
      node.name = new ArrayNode(forTok.lineno, forTok.colno);
      (node.name as ArrayNode).addChild(key);

      while (this.skip(TokenType.TOKEN_COMMA)) {
        const prim: NunjucksNode = this.parsePrimary();
        (node.name as ArrayNode).addChild(prim);
      }
    }

    if (!this.skipSymbol('in')) {
      this.fail('parseFor: expected "in" keyword for loop',
        forTok.lineno,
        forTok.colno);
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


  parseMacro(): Macro {
    const macroTok: Token = this.parserTokenStream.peekToken();
    if (!this.skipSymbol('macro')) {
      this.fail('expected macro');
    }

    const name: NunjucksNode = this.parsePrimary(true);
    const args: NunjucksNodeList = this.parseSignature();
    const node: Macro = new Macro(macroTok.lineno, macroTok.colno, name, args);

    this.advanceAfterBlockEnd(macroTok.value);
    node.body = this.parseUntilBlocks('endmacro');
    this.advanceAfterBlockEnd();

    return node;
  }


  parseCall(): Output {
    // a call block is parsed as a normal FunCall, but with an added
    // 'caller' kwarg which is a Caller node.
    const callTok: Token = this.parserTokenStream.peekToken();
    if (!this.skipSymbol('call')) {
      this.fail('expected call');
    }

    const callerArgs: NunjucksNodeList = this.parseSignature(true) || new NunjucksNodeList(callTok.lineno, callTok.colno);
    const macroCall: Macro = this.parsePrimary() as Macro;

    this.advanceAfterBlockEnd(callTok.value);
    const body: NunjucksNodeList = this.parseUntilBlocks('endcall');
    this.advanceAfterBlockEnd();

    const callerName: NunjucksSymbol = new NunjucksSymbol(callTok.lineno, callTok.colno, 'caller');
    const callerNode: Caller = new Caller(callTok.lineno,
      callTok.colno,
      callerName,
      callerArgs,
      body);

    // add the additional caller kwarg, adding kwargs if necessary
    const args: NunjucksNode[] | undefined = macroCall.args.children;
    if (!(args[args.length - 1] instanceof KeywordArgs)) {
      args.push(new KeywordArgs(callTok.lineno, callTok.colno));
    }
    const kwargs: NunjucksNodeList = args[args.length - 1] as NunjucksNodeList;
    kwargs.addChild(new Pair(callTok.lineno,
      callTok.colno,
      callerName,
      callerNode));

    return new Output(callTok.lineno, callTok.colno, [ macroCall ]);
  }


  parseWithContext(): boolean | undefined {
    const tok: Token = this.parserTokenStream.peekToken();

    let withContext: boolean | null = null;
    if (this.skipSymbol('with')) {
      withContext = true;
    } else if (this.skipSymbol('without')) {
      withContext = false;
    }

    if (withContext !== null) {
      if (!this.skipSymbol('context')) {
        this.fail('parseFrom: expected context after with/without',
          tok.lineno,
          tok.colno);
      }
    }

    return withContext;
  }


  parseImport(): Import {
    const importTok: Token = this.parserTokenStream.peekToken();
    if (!this.skipSymbol('import')) {
      this.fail('parseImport: expected import',
        importTok.lineno,
        importTok.colno);
    }

    const template: NunjucksNode = this.parseExpression();

    if (!this.skipSymbol('as')) {
      this.fail('parseImport: expected "as" keyword',
        importTok.lineno,
        importTok.colno);
    }

    const target: NunjucksNode = this.parseExpression();
    const withContext: boolean = this.parseWithContext();
    const node: Import = new Import(importTok.lineno,
      importTok.colno,
      template,
      target,
      withContext);

    this.advanceAfterBlockEnd(importTok.value);

    return node;
  }


  parseFrom(): FromImport {
    const fromTok: Token = this.parserTokenStream.peekToken();
    if (!this.skipSymbol('from')) {
      this.fail('parseFrom: expected from');
    }

    const template: NunjucksNode = this.parseExpression();

    if (!this.skipSymbol('import')) {
      this.fail('parseFrom: expected import',
        fromTok.lineno,
        fromTok.colno);
    }

    const names: NunjucksNodeList = new NunjucksNodeList(fromTok.lineno, fromTok.colno);
    let withContext: boolean;

    while (1) { // eslint-disable-line no-constant-condition
      const nextTok: Token = this.parserTokenStream.peekToken();
      if (nextTok.type === TokenType.TOKEN_BLOCK_END) {
        if (!names.children.length) {
          this.fail('parseFrom: Expected at least one import name',
            fromTok.lineno,
            fromTok.colno);
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

      if (names.children.length > 0 && !this.skip(TokenType.TOKEN_COMMA)) {
        this.fail('parseFrom: expected comma',
          fromTok.lineno,
          fromTok.colno);
      }

      const name: NunjucksSymbol = this.parsePrimary() as NunjucksSymbol;
      if (name.value.charAt(0) === '_') {
        this.fail('parseFrom: names starting with an underscore cannot be imported',
          name.lineno,
          name.colno);
      }

      if (this.skipSymbol('as')) {
        const alias: NunjucksNode = this.parsePrimary();
        names.addChild(new Pair(name.lineno,
          name.colno,
          name,
          alias));
      } else {
        names.addChild(name);
      }

      withContext = this.parseWithContext();
    }

    return new FromImport(fromTok.lineno,
      fromTok.colno,
      template,
      names,
      withContext);
  }


  parseBlock(): Block {
    const tag: Token = this.parserTokenStream.peekToken();
    if (!this.skipSymbol('block')) {
      this.fail('parseBlock: expected block', tag.lineno, tag.colno);
    }

    const node: Block = new Block(tag.lineno, tag.colno);

    node.name = this.parsePrimary();
    if (!(node.name instanceof NunjucksSymbol)) {
      this.fail('parseBlock: variable name expected',
        tag.lineno,
        tag.colno);
    }

    this.advanceAfterBlockEnd(tag.value);

    node.body = this.parseUntilBlocks('endblock');
    this.skipSymbol('endblock');
    this.skipSymbol(node.name.value);

    const tok: Token = this.parserTokenStream.peekToken();
    if (!tok) {
      this.fail('parseBlock: expected endblock, got end of file');
    }

    this.advanceAfterBlockEnd(tok.value);

    return node;
  }


  parseExtends(): Extends {
    const tagName: string = 'extends';
    const tag: Token = this.parserTokenStream.peekToken();
    if (!this.skipSymbol(tagName)) {
      this.fail('parseTemplateRef: expected ' + tagName);
    }

    const node: Extends = new Extends(tag.lineno, tag.colno);
    node.template = this.parseExpression();

    this.advanceAfterBlockEnd(tag.value);
    return node;
  }


  parseInclude(): Include {
    const tagName: string = 'include';
    const tag: Token = this.parserTokenStream.peekToken();
    if (!this.skipSymbol(tagName)) {
      this.fail('parseInclude: expected ' + tagName);
    }

    const node: Include = new Include(tag.lineno, tag.colno);
    node.template = this.parseExpression();

    if (this.skipSymbol('ignore') && this.skipSymbol('missing')) {
      node.ignoreMissing = true;
    }

    this.advanceAfterBlockEnd(tag.value);
    return node;
  }


  parseIf(): If {
    const tag: Token = this.parserTokenStream.peekToken();
    let node: If;

    if (this.skipSymbol('if') || this.skipSymbol('elif') || this.skipSymbol('elseif')) {
      node = new If(tag.lineno, tag.colno);
    } else if (this.skipSymbol('ifAsync')) {
      node = new IfAsync(tag.lineno, tag.colno);
    } else {
      this.fail('parseIf: expected if, elif, or elseif',
        tag.lineno,
        tag.colno);
    }

    node.cond = this.parseExpression();
    this.advanceAfterBlockEnd(tag.value);

    node.body = this.parseUntilBlocks('elif', 'elseif', 'else', 'endif');
    const tok: Token = this.parserTokenStream.peekToken();

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


  parseSet(): Set {
    const tag: Token = this.parserTokenStream.peekToken();
    if (!this.skipSymbol('set')) {
      this.fail('parseSet: expected set', tag.lineno, tag.colno);
    }

    const node: Set = new Set(tag.lineno, tag.colno, [ ]);

    let target;
    while ((target = this.parsePrimary())) {
      node.targets.push(target);

      if (!this.skip(TokenType.TOKEN_COMMA)) {
        break;
      }
    }

    if (!this.skipValue(TokenType.TOKEN_OPERATOR, '=')) {
      if (!this.skip(TokenType.TOKEN_BLOCK_END)) {
        this.fail('parseSet: expected = or block end in set tag',
          tag.lineno,
          tag.colno);
      } else {
        node.body = new Capture(
          tag.lineno,
          tag.colno,
          this.parseUntilBlocks('endset')
        );
        node.value = null;
        this.advanceAfterBlockEnd();
      }
    } else {
      node.value = this.parseExpression();
      this.advanceAfterBlockEnd(tag.value);
    }

    return node;
  }


  parseSwitch(): Switch {
    /*
     * Store the tag names in variables in case someone ever wants to
     * customize this.
     */
    const switchStart: string = 'switch';
    const switchEnd: string = 'endswitch';
    const caseStart: string = 'case';
    const caseDefault: string = 'default';

    // Get the switch tag.
    const tag: Token = this.parserTokenStream.peekToken();

    // fail early if we get some unexpected tag.
    if (
      !this.skipSymbol(switchStart)
      && !this.skipSymbol(caseStart)
      && !this.skipSymbol(caseDefault)
    ) {
      this.fail('parseSwitch: expected "switch," "case" or "default"', tag.lineno, tag.colno);
    }

    // parse the switch expression
    const expr: NunjucksNode = this.parseExpression();

    // advance until a start of a case, a default case or an endswitch.
    this.advanceAfterBlockEnd(switchStart);
    this.parseUntilBlocks(caseStart, caseDefault, switchEnd);

    // this is the first case. it could also be an endswitch, we'll check.
    let tok: Token = this.parserTokenStream.peekToken();

    // create new variables for our cases and default case.
    const cases: Case[] = [];
    let defaultCase;

    // while we're dealing with new cases nodes...
    do {
      // skip the start symbol and get the case expression
      this.skipSymbol(caseStart);
      const cond: NunjucksNode = this.parseExpression();
      this.advanceAfterBlockEnd(switchStart);
      // get the body of the case node and add it to the array of cases.
      const body: NunjucksNodeList = this.parseUntilBlocks(caseStart, caseDefault, switchEnd);
      cases.push(new Case(tok.lineno, tok.colno, cond, body));
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
    return new Switch(tag.lineno, tag.colno, expr, cases, defaultCase);
  }


  parseStatement(): null | NunjucksNode {
    const tok: Token = this.parserTokenStream.peekToken();
    if (tok.type !== TokenType.TOKEN_SYMBOL) {
      this.fail('tag name expected', tok.lineno, tok.colno);
    }

    if (this.breakOnBlocks &&
      indexOf(this.breakOnBlocks, tok.value) !== -1) {
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
          for (let i: number = 0; i < this.extensions.length; i++) {
            const ext = this.extensions[i];
            if (indexOf(ext.tags || [], tok.value) !== -1) {
              return ext.parse(this, undefined, lexer); // TODO: Handle missing nodes declaration
            }
          }
        }
        this.fail('unknown block tag: ' + tok.value, tok.lineno, tok.colno);
    }

    return undefined;
  }


  parseRaw(tagName?): Output {
    tagName = tagName || 'raw';
    const endTagName: string = 'end' + tagName;
    // Look for upcoming raw blocks (ignore all other kinds of blocks)
    const rawBlockRegex: RegExp = new RegExp('([\\s\\S]*?){%\\s*(' + tagName + '|' + endTagName + ')\\s*(?=%})%}');
    let rawLevel: number = 1;
    let str: string = '';
    let matches: null | RegExpMatchArray = null;

    // Skip opening raw token
    // Keep this token to track line and column numbers
    const begun: Token = this.advanceAfterBlockEnd();

    // Exit when there's nothing to match
    // or when we've found the matching "endraw" block
    while ((matches = this.tokens._extractRegex(rawBlockRegex)) && rawLevel > 0) {
      const all: string = matches[0];
      const pre: string = matches[1];
      const blockName: string = matches[2];

      // Adjust rawlevel
      if (blockName === tagName) {
        rawLevel += 1;
      } else if (blockName === endTagName) {
        rawLevel -= 1;
      }

      // Add to str
      if (rawLevel === 0) {
        // We want to exclude the last "endraw"
        str += pre;
        // Move tokenizer to beginning of endraw block
        this.tokens.backN(all.length - pre.length);
      } else {
        str += all;
      }
    }

    return new Output(
        begun.lineno,
        begun.colno,
        [new TemplateData(begun.lineno, begun.colno, str)]
    );
  }


  parsePostfix(node: NunjucksNode): NunjucksNode {
    let lookup: Group | ArrayNode | Dict | Literal;
    let tok: Token = this.parserTokenStream.peekToken();

    while (tok) {
      if (tok.type === TokenType.TOKEN_LEFT_PAREN) {
        // Function call
        node = new FunCall(tok.lineno,
          tok.colno,
          node,
          this.parseSignature());
      } else if (tok.type === TokenType.TOKEN_LEFT_BRACKET) {
        // Reference
        lookup = this.parseAggregate();
        if (lookup.children.length > 1) {
          this.fail('invalid index');
        }

        node = new LookupVal(tok.lineno,
          tok.colno,
          node,
          lookup.children[0]);
      } else if (tok.type === TokenType.TOKEN_OPERATOR && tok.value === '.') {
        // Reference
        this.parserTokenStream.nextToken();
        const val: Token = this.parserTokenStream.nextToken();

        if (val.type !== TokenType.TOKEN_SYMBOL) {
          this.fail('expected name as lookup value, got ' + val.value,
            val.lineno,
            val.colno);
        }

        // Make a literal string because it's not a variable
        // reference
        lookup = new Literal(val.lineno, val.lineno, val.value);

        node = new LookupVal(tok.lineno,
          tok.colno,
          node,
          lookup);
      } else {
        break;
      }

      tok = this.parserTokenStream.peekToken();
    }

    return node;
  }


  parseExpression(): NunjucksNode {
    return this.parseInlineIf();
  }


  parseInlineIf(): NunjucksNode {
    let node: NunjucksNode | InlineIf = this.parseOr();
    if (this.skipSymbol('if')) {
      const condNode: NunjucksNode = this.parseOr();
      const bodyNode: NunjucksNode = node;
      node = new InlineIf(node.lineno, node.colno);
      (node as InlineIf).body = bodyNode;
      (node as InlineIf).cond = condNode;
      if (this.skipSymbol('else')) {
        (node as InlineIf).else_ = this.parseOr();
      } else {
        (node as InlineIf).else_ = null;
      }
    }

    return node;
  }


  parseOr(): NunjucksNode {
    let node: NunjucksNode = this.parseAnd();
    while (this.skipSymbol('or')) {
      const node2: NunjucksNode = this.parseAnd();
      node = new Or(node.lineno,
        node.colno,
        node,
        node2);
    }
    return node;
  }


  parseAnd(): NunjucksNode {
    let node: NunjucksNode = this.parseNot();
    while (this.skipSymbol('and')) {
      const node2: NunjucksNode = this.parseNot();
      node = new And(node.lineno,
        node.colno,
        node,
        node2);
    }
    return node;
  }


  parseNot(): NunjucksNode {
    const tok: Token = this.parserTokenStream.peekToken();
    if (this.skipSymbol('not')) {
      return new Not(tok.lineno,
        tok.colno,
        this.parseNot());
    }
    return this.parseIn();
  }


  parseIn(): NunjucksNode {
    let node: NunjucksNode = this.parseIs();
    while (1) { // eslint-disable-line no-constant-condition
      // check if the next token is 'not'
      const tok: Token = this.parserTokenStream.nextToken();
      if (!tok) {
        break;
      }
      const invert: boolean = tok.type === TokenType.TOKEN_SYMBOL && tok.value === 'not';
      // if it wasn't 'not', put it back
      if (!invert) {
        this.parserTokenStream.pushToken(tok);
      }
      if (this.skipSymbol('in')) {
        const node2: NunjucksNode = this.parseIs();
        node = new In(node.lineno,
          node.colno,
          node,
          node2);
        if (invert) {
          node = new Not(node.lineno,
            node.colno,
            node);
        }
      } else {
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
  parseIs(): NunjucksNode {
    let node: NunjucksNode = this.parseCompare();
    // look for an is
    if (this.skipSymbol('is')) {
      // look for a not
      const not: boolean = this.skipSymbol('not');
      // get the next node
      const node2: NunjucksNode = this.parseCompare();
      // create an Is node using the next node and the info from our Is node.
      node = new Is(node.lineno, node.colno, node, node2);
      // if we have a Not, create a Not node from our Is node.
      if (not) {
        node = new Not(node.lineno, node.colno, node);
      }
    }
    // return the node.
    return node;
  }


  parseCompare(): NunjucksNode {
    const compareOps: string[] = ['==', '===', '!=', '!==', '<', '>', '<=', '>='];
    const expr: NunjucksNode = this.parseConcat();
    const ops: NunjucksNode[] = [];

    while (1) { // eslint-disable-line no-constant-condition
      const tok: Token = this.parserTokenStream.nextToken();

      if (!tok) {
        break;
      } else if (compareOps.indexOf(tok.value) !== -1) {
        ops.push(new CompareOperand(tok.lineno,
          tok.colno,
          this.parseConcat(),
          tok.value));
      } else {
        this.parserTokenStream.pushToken(tok);
        break;
      }
    }

    if (ops.length) {
      return new Compare(ops[0].lineno,
        ops[0].colno,
        expr,
        ops);
    } else {
      return expr;
    }
  }


  // finds the '~' for string concatenation
  parseConcat(): NunjucksNode {
    let node: NunjucksNode = this.parseAdd();
    while (this.skipValue(TokenType.TOKEN_TILDE, '~')) {
      const node2: NunjucksNode = this.parseAdd();
      node = new Concat(node.lineno,
        node.colno,
        node,
        node2);
    }
    return node;
  }


  parseAdd(): NunjucksNode {
    let node: NunjucksNode = this.parseSub();
    while (this.skipValue(TokenType.TOKEN_OPERATOR, '+')) {
      const node2: NunjucksNode = this.parseSub();
      node = new Add(node.lineno,
        node.colno,
        node,
        node2);
    }
    return node;
  }


  parseSub(): NunjucksNode {
    let node: NunjucksNode = this.parseMul();
    while (this.skipValue(TokenType.TOKEN_OPERATOR, '-')) {
      const node2: NunjucksNode = this.parseMul();
      node = new Sub(node.lineno,
        node.colno,
        node,
        node2);
    }
    return node;
  }


  parseMul(): NunjucksNode {
    let node: NunjucksNode = this.parseDiv();
    while (this.skipValue(TokenType.TOKEN_OPERATOR, '*')) {
      const node2: NunjucksNode = this.parseDiv();
      node = new Mul(node.lineno,
        node.colno,
        node,
        node2);
    }
    return node;
  }


  parseDiv(): NunjucksNode {
    let node: NunjucksNode = this.parseFloorDiv();
    while (this.skipValue(TokenType.TOKEN_OPERATOR, '/')) {
      const node2: NunjucksNode = this.parseFloorDiv();
      node = new Div(node.lineno,
        node.colno,
        node,
        node2);
    }
    return node;
  }


  parseFloorDiv(): NunjucksNode {
    let node: NunjucksNode = this.parseMod();
    while (this.skipValue(TokenType.TOKEN_OPERATOR, '//')) {
      const node2: NunjucksNode = this.parseMod();
      node = new FloorDiv(node.lineno,
        node.colno,
        node,
        node2);
    }
    return node;
  }


  parseMod(): NunjucksNode {
    let node: NunjucksNode = this.parsePow();
    while (this.skipValue(TokenType.TOKEN_OPERATOR, '%')) {
      const node2: NunjucksNode = this.parsePow();
      node = new Mod(node.lineno,
        node.colno,
        node,
        node2);
    }
    return node;
  }


  parsePow(): NunjucksNode {
    let node: NunjucksNode = this.parseUnary();
    while (this.skipValue(TokenType.TOKEN_OPERATOR, '**')) {
      const node2: NunjucksNode = this.parseUnary();
      node = new Pow(node.lineno,
        node.colno,
        node,
        node2);
    }
    return node;
  }


  parseUnary(noFilters?: boolean): NunjucksNode {
    const tok: Token = this.parserTokenStream.peekToken();
    let node: NunjucksNode;

    if (this.skipValue(TokenType.TOKEN_OPERATOR, '-')) {
      node = new Neg(tok.lineno,
        tok.colno,
        this.parseUnary(true));
    } else if (this.skipValue(TokenType.TOKEN_OPERATOR, '+')) {
      node = new Pos(tok.lineno,
        tok.colno,
        this.parseUnary(true));
    } else {
      node = this.parsePrimary();
    }

    if (!noFilters) {
      node = this.parseFilter(node);
    }

    return node;
  }


  parsePrimary(noPostfix: boolean = false): NunjucksNode {
    const tok: Token = this.parserTokenStream.nextToken();
    let val;

    if (!tok) {
      this.fail('expected expression, got end of file');
    } else if (tok.type === TokenType.TOKEN_STRING) {
      val = tok.value;
    } else if (tok.type === TokenType.TOKEN_INT) {
      val = parseInt(tok.value, 10);
    } else if (tok.type === TokenType.TOKEN_FLOAT) {
      val = parseFloat(tok.value);
    } else if (tok.type === TokenType.TOKEN_BOOLEAN) {
      if (tok.value === 'true') {
        val = true;
      } else if (tok.value === 'false') {
        val = false;
      } else {
        this.fail('invalid boolean: ' + tok.value,
          tok.lineno,
          tok.colno);
      }
    } else if (tok.type === TokenType.TOKEN_NONE) {
      val = null;
    } else if (tok.type === TokenType.TOKEN_REGEX) {
      val = new RegExp(tok.value.body, tok.value.flags);
    }

    let node: NunjucksNode | undefined;
    if (val !== undefined) {
      node = new Literal(tok.lineno, tok.lineno, val);
    } else if (tok.type === TokenType.TOKEN_SYMBOL) {
      node = new NunjucksSymbol(tok.lineno, tok.colno, tok.value);
    } else {
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
    } else {
      throw this.error(`unexpected token: ${tok.value}`, tok.lineno, tok.colno);
    }
  }


  parseFilterName(): NunjucksSymbol {
    const tok: Token = this.expect(TokenType.TOKEN_SYMBOL);
    let name: string = tok.value;

    while (this.skipValue(TokenType.TOKEN_OPERATOR, '.')) {
      name += '.' + this.expect(TokenType.TOKEN_SYMBOL).value;
    }

    return new NunjucksSymbol(tok.lineno, tok.colno, tok.value);
  }


  parseFilterArgs(node: NunjucksNode): NunjucksNode[] {
    if (this.parserTokenStream.peekToken().type === TokenType.TOKEN_LEFT_PAREN) {
      // Get a FunCall node and add the parameters to the
      // filter
      const call: FunCall = this.parsePostfix(node) as FunCall;
      return call.args.children;
    }
    return [ ];
  }


  parseFilter(node: NunjucksNode): NunjucksNode {
    while (this.skip(TokenType.TOKEN_PIPE)) {
      const name: NunjucksSymbol = this.parseFilterName();

      node = new Filter(
        name.lineno,
        name.colno,
        name,
        new NunjucksNodeList(
            name.lineno,
            name.colno,
            [ node, ...this.parseFilterArgs(node) ]
        )
      );
    }

    return node;
  }


  parseFilterStatement(): Output {
    const filterTok: Token = this.parserTokenStream.peekToken();
    if (!this.skipSymbol('filter')) {
      this.fail('parseFilterStatement: expected filter');
    }

    const name: NunjucksSymbol = this.parseFilterName();
    const args = this.parseFilterArgs(name);

    this.advanceAfterBlockEnd(filterTok.value);
    const body: Capture = new Capture(name.lineno, name.colno, this.parseUntilBlocks('endfilter'));
    this.advanceAfterBlockEnd();

    const node: Filter = new Filter(
        name.lineno,
        name.colno,
        name,
        new NunjucksNodeList(
            name.lineno,
            name.colno,
            [body, ...args]
        )
    );

    return new Output(
        name.lineno,
        name.colno,
        [ node ]
    );
  }


  parseAggregate(): Group | ArrayNode | Dict | null {
    const tok: Token = this.parserTokenStream.nextToken();
    let node: Group | ArrayNode | Dict;

    switch (tok.type) {
      case TokenType.TOKEN_LEFT_PAREN:
        node = new Group(tok.lineno, tok.colno);
        break;
      case TokenType.TOKEN_LEFT_BRACKET:
        node = new ArrayNode(tok.lineno, tok.colno);
        break;
      case TokenType.TOKEN_LEFT_CURLY:
        node = new Dict(tok.lineno, tok.colno);
        break;
      default:
        return null;
    }

    while (1) { // eslint-disable-line no-constant-condition
      const type: TokenType = this.parserTokenStream.peekToken().type;
      if (type === TokenType.TOKEN_RIGHT_PAREN ||
        type === TokenType.TOKEN_RIGHT_BRACKET ||
        type === TokenType.TOKEN_RIGHT_CURLY) {
        this.parserTokenStream.nextToken();
        break;
      }

      if (node.children.length > 0) {
        if (!this.skip(TokenType.TOKEN_COMMA)) {
          this.fail('parseAggregate: expected comma after expression',
            tok.lineno,
            tok.colno);
        }
      }

      if (node instanceof Dict) {
        // TODO: check for errors
        const key: NunjucksNode = this.parsePrimary();

        // We expect a key/value pair for dicts, separated by a
        // colon
        if (!this.skip(TokenType.TOKEN_COLON)) {
          this.fail('parseAggregate: expected colon after dict key',
            tok.lineno,
            tok.colno);
        }

        // TODO: check for errors
        const value: NunjucksNode = this.parseExpression();
        node.addChild(new Pair(key.lineno,
          key.colno,
          key,
          value));
      } else {
        // TODO: check for errors
        const expr: NunjucksNode = this.parseExpression();
        node.addChild(expr);
      }
    }

    return node;
  }


  parseSignature(tolerant?: boolean, noParens?: boolean): NunjucksNodeList | null {
    let tok: Token = this.parserTokenStream.peekToken();
    if (!noParens && tok.type !== TokenType.TOKEN_LEFT_PAREN) {
      if (tolerant) {
        return null;
      } else {
        this.fail('expected arguments', tok.lineno, tok.colno);
      }
    }

    if (tok.type === TokenType.TOKEN_LEFT_PAREN) {
      tok = this.parserTokenStream.nextToken();
    }

    const args: NunjucksNodeList = new NunjucksNodeList(tok.lineno, tok.colno);
    const kwargs: KeywordArgs = new KeywordArgs(tok.lineno, tok.colno);
    let checkComma: boolean = false;

    while (1) { // eslint-disable-line no-constant-condition
      tok = this.parserTokenStream.peekToken();
      if (!noParens && tok.type === TokenType.TOKEN_RIGHT_PAREN) {
        this.parserTokenStream.nextToken();
        break;
      } else if (noParens && tok.type === TokenType.TOKEN_BLOCK_END) {
        break;
      }

      if (checkComma && !this.skip(TokenType.TOKEN_COMMA)) {
        this.fail('parseSignature: expected comma after expression',
          tok.lineno,
          tok.colno);
      } else {
        const arg: NunjucksNode = this.parseExpression();

        if (this.skipValue(TokenType.TOKEN_OPERATOR, '=')) {
          kwargs.addChild(
            new Pair(arg.lineno,
              arg.colno,
              arg,
              this.parseExpression())
          );
        } else {
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


  parseUntilBlocks(...blockNames: string[]): NunjucksNodeList {
    const prev: string[] | undefined = this.breakOnBlocks;
    this.breakOnBlocks = blockNames;

    const ret: NunjucksNodeList = this.parse();

    this.breakOnBlocks = prev;
    return ret;
  }


  parseNodes(): NunjucksNode[] {
    let tok: Token | null;
    const buf: NunjucksNode[] = [];

    while ((tok = this.parserTokenStream.nextToken())) {
      if (tok.type === TokenType.TOKEN_DATA) {
        let data = tok.value;
        const nextToken: Token = this.parserTokenStream.peekToken();
        const nextVal: string = nextToken && nextToken.value;

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
          ((nextToken.type === TokenType.TOKEN_BLOCK_START && nextVal.charAt(nextVal.length - 1) === '-') ||
          (nextToken.type === TokenType.TOKEN_VARIABLE_START && nextVal.charAt(this.tokens.tags.VARIABLE_START.length) === '-') ||
          (nextToken.type === TokenType.TOKEN_COMMENT && nextVal.charAt(this.tokens.tags.COMMENT_START.length) === '-'))) {
          // TODO: this could be optimized (don't use regex)
          data = data.replace(/\s*$/, '');
        }

        buf.push(new Output(tok.lineno,
            tok.colno,
            [ new TemplateData(tok.lineno, tok.colno, data)]));
      } else if (tok.type === TokenType.TOKEN_BLOCK_START) {
        this.dropLeadingWhitespace = false;
        const n = this.parseStatement();
        if (!n) {
          break;
        }
        buf.push(n);
      } else if (tok.type === TokenType.TOKEN_VARIABLE_START) {
        const e: NunjucksNode = this.parseExpression();
        this.dropLeadingWhitespace = false;
        this.advanceAfterVariableEnd();
        buf.push(new Output(tok.lineno, tok.colno, [ e ]));
      } else if (tok.type === TokenType.TOKEN_COMMENT) {
        this.dropLeadingWhitespace = tok.value.charAt(tok.value.length - this.tokens.tags.COMMENT_END.length - 1) === '-';
      } else {
        // Ignore comments, otherwise this should be an error
        this.fail('Unexpected token at top-level: ' +
          tok.type, tok.lineno, tok.colno);
      }
    }

    return buf;
  }


  parse(): NunjucksNodeList {
    return new NunjucksNodeList(0, 0, this.parseNodes());
  }


  parseAsRoot(): Root {
    return new Root(0, 0, this.parseNodes());
  }
}


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

export function parse(src, extensions, opts): Root {
  const p: Parser = new Parser(new Tokenizer(src, opts));
  if (extensions !== undefined) {
    p.extensions = extensions;
  }
  return p.parseAsRoot();
}
