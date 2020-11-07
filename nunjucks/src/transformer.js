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
exports.transform = void 0;
const lib = __importStar(require("./lib"));
const block_1 = require("./nodes/block");
const ifAsync_1 = require("./nodes/ifAsync");
const set_1 = require("./nodes/set");
const nunjucksSymbol_1 = require("./nodes/nunjucksSymbol");
const for_1 = require("./nodes/for");
const asyncAll_1 = require("./nodes/asyncAll");
const filterAsync_1 = require("./nodes/filterAsync");
const super_1 = require("./nodes/super");
const funCall_1 = require("./nodes/funCall");
const filter_1 = require("./nodes/filter");
const output_1 = require("./nodes/output");
const if_1 = require("./nodes/if");
const asyncEach_1 = require("./nodes/asyncEach");
const callExtensionAsync_1 = require("./nodes/callExtensionAsync");
const nunjucksNode_1 = require("./nodes/nunjucksNode");
const add_1 = require("./lexer/operators/add");
const group_1 = require("./nodes/group");
const import_1 = require("./nodes/import");
const or_1 = require("./lexer/operators/or");
const in_1 = require("./lexer/operators/in");
const macro_1 = require("./nodes/macro");
const include_1 = require("./nodes/include");
const is_1 = require("./lexer/operators/is");
const capture_1 = require("./nodes/capture");
const case_1 = require("./nodes/case");
const concat_1 = require("./lexer/operators/concat");
const literal_1 = require("./nodes/literal");
const compare_1 = require("./nodes/compare");
const extends_1 = require("./nodes/extends");
const pair_1 = require("./nodes/pair");
const inlineIf_1 = require("./nodes/inlineIf");
const sub_1 = require("./lexer/operators/sub");
const mod_1 = require("./lexer/operators/mod");
const root_1 = require("./nodes/root");
const compareOperand_1 = require("./nodes/compareOperand");
const lookupVal_1 = require("./nodes/lookupVal");
const mul_1 = require("./lexer/operators/mul");
const floorDiv_1 = require("./lexer/operators/floorDiv");
const div_1 = require("./lexer/operators/div");
const fromImport_1 = require("./nodes/fromImport");
const neg_1 = require("./lexer/operators/neg");
const not_1 = require("./lexer/operators/not");
const templateData_1 = require("./nodes/templateData");
const switch_1 = require("./nodes/switch");
const caller_1 = require("./nodes/caller");
const pos_1 = require("./lexer/operators/pos");
const and_1 = require("./lexer/operators/and");
const value_1 = require("./nodes/value");
const pow_1 = require("./lexer/operators/pow");
const binOp_1 = require("./lexer/operators/binOp");
const keywordArgs_1 = require("./nodes/keywordArgs");
const dict_1 = require("./nodes/dict");
const arrayNode_1 = require("./nodes/arrayNode");
let sym = 0;
function gensym() {
    return 'hole_' + sym++;
}
// copy-on-write version of map
function mapCOW(arr, func) {
    let res = null;
    for (let i = 0; i < arr.length; i++) {
        const item = func(arr[i]);
        if (item !== arr[i]) {
            if (!res) {
                res = arr.slice();
            }
            res[i] = item;
        }
    }
    return res || arr;
}
function createDynamicNode(typename, ...args) {
    switch (typename) {
        case 'Node':
        case 'NunjucksNode':
            // @ts-ignore
            return new nunjucksNode_1.NunjucksNode(...args);
        case 'Root':
            // @ts-ignore
            return new root_1.Root(...args);
        case 'NodeList':
        case 'NunjucksNodeList':
            // @ts-ignore
            return new nunjucksNode_1.NunjucksNodeList(...args);
        case 'Value':
            // @ts-ignore
            return new value_1.Value(...args);
        case 'Literal':
            // @ts-ignore
            return new literal_1.Literal(...args);
        case 'Symbol':
        case 'NunjucksSymbol':
            // @ts-ignore
            return new nunjucksSymbol_1.NunjucksSymbol(...args);
        case 'Group':
            // @ts-ignore
            return new group_1.Group(...args);
        case 'Array':
            // @ts-ignore
            return new arrayNode_1.ArrayNode(...args);
        case 'Pair':
            // @ts-ignore
            return new pair_1.Pair(...args);
        case 'Dict':
            // @ts-ignore
            return new dict_1.Dict(...args);
        case 'Output':
            // @ts-ignore
            return new output_1.Output(...args);
        case 'Capture':
            // @ts-ignore
            return new capture_1.Capture(...args);
        case 'TemplateData':
            // @ts-ignore
            return new templateData_1.TemplateData(...args);
        case 'If':
            // @ts-ignore
            return new if_1.If(...args);
        case 'IfAsync':
            // @ts-ignore
            return new ifAsync_1.IfAsync(...args);
        case 'InlineIf':
            // @ts-ignore
            return new inlineIf_1.InlineIf(...args);
        case 'For':
            // @ts-ignore
            return new for_1.For(...args);
        case 'AsyncEach':
            // @ts-ignore
            return new asyncEach_1.AsyncEach(...args);
        case 'AsyncAll':
            // @ts-ignore
            return new asyncAll_1.AsyncAll(...args);
        case 'Macro':
            // @ts-ignore
            return new macro_1.Macro(...args);
        case 'Caller':
            // @ts-ignore
            return new caller_1.Caller(...args);
        case 'Import':
            // @ts-ignore
            return new import_1.Import(...args);
        case 'FromImport':
            // @ts-ignore
            return new fromImport_1.FromImport(...args);
        case 'FunCall':
            // @ts-ignore
            return new funCall_1.FunCall(...args);
        case 'Filter':
            // @ts-ignore
            return new filter_1.Filter(...args);
        case 'FilterAsync':
            // @ts-ignore
            return new filterAsync_1.FilterAsync(...args);
        case 'KeywordArgs':
            // @ts-ignore
            return new keywordArgs_1.KeywordArgs(...args);
        case 'Block':
            // @ts-ignore
            return new block_1.Block(...args);
        case 'Super':
            // @ts-ignore
            return new super_1.Super(...args);
        case 'Extends':
            // @ts-ignore
            return new extends_1.Extends(...args);
        case 'Include':
            // @ts-ignore
            return new include_1.Include(...args);
        case 'Set':
            // @ts-ignore
            return new set_1.Set(...args);
        case 'Switch':
            // @ts-ignore
            return new switch_1.Switch(...args);
        case 'Case':
            // @ts-ignore
            return new case_1.Case(...args);
        case 'LookupVal':
            // @ts-ignore
            return new lookupVal_1.LookupVal(...args);
        case 'BinOp':
            // @ts-ignore
            return new binOp_1.BinOp(...args);
        case 'In':
            // @ts-ignore
            return new in_1.In(...args);
        case 'Is':
            // @ts-ignore
            return new is_1.Is(...args);
        case 'Or':
            // @ts-ignore
            return new or_1.Or(...args);
        case 'And':
            // @ts-ignore
            return new and_1.And(...args);
        case 'Not':
            // @ts-ignore
            return new not_1.Not(...args);
        case 'Add':
            // @ts-ignore
            return new add_1.Add(...args);
        case 'Concat':
            // @ts-ignore
            return new concat_1.Concat(...args);
        case 'Sub':
            // @ts-ignore
            return new sub_1.Sub(...args);
        case 'Mul':
            // @ts-ignore
            return new mul_1.Mul(...args);
        case 'Div':
            // @ts-ignore
            return new div_1.Div(...args);
        case 'FloorDiv':
            // @ts-ignore
            return new floorDiv_1.FloorDiv(...args);
        case 'Mod':
            // @ts-ignore
            return new mod_1.Mod(...args);
        case 'Pow':
            // @ts-ignore
            return new pow_1.Pow(...args);
        case 'Neg':
            // @ts-ignore
            return new neg_1.Neg(...args);
        case 'Pos':
            // @ts-ignore
            return new pos_1.Pos(...args);
        case 'Compare':
            // @ts-ignore
            return new compare_1.Compare(...args);
        case 'CompareOperand':
            // @ts-ignore
            return new compareOperand_1.CompareOperand(...args);
        case 'CallExtension':
            // @ts-ignore
            return new nunjucksNode_1.CallExtension(...args);
        case 'CallExtensionAsync':
            // @ts-ignore
            return new callExtensionAsync_1.CallExtensionAsync(...args);
        default:
            throw new Error(`Invalid type ${typename}`);
    }
}
function walk(ast, func, depthFirst) {
    if (!(ast instanceof nunjucksNode_1.NunjucksNode)) {
        return ast;
    }
    if (!depthFirst) {
        const astT = func(ast);
        if (astT && astT !== ast) {
            return astT;
        }
    }
    if (ast instanceof nunjucksNode_1.NunjucksNodeList) {
        const children = mapCOW(ast.children, (node) => walk(node, func, depthFirst));
        if (children !== ast.children) {
            ast = createDynamicNode(ast.typename, ast.lineno, ast.colno, children);
        }
    }
    else if (ast instanceof nunjucksNode_1.CallExtension) {
        const args = walk(ast.args, func, depthFirst);
        const contentArgs = mapCOW(ast.contentArgs, (node) => walk(node, func, depthFirst));
        if (args !== ast.args || contentArgs !== ast.contentArgs) {
            ast = createDynamicNode(ast.typename, ast.extName, ast.prop, args, contentArgs);
        }
    }
    else {
        const props = ast.fields.map((field) => ast[field]);
        const propsT = mapCOW(props, (prop) => walk(prop, func, depthFirst));
        if (propsT !== props) {
            ast = createDynamicNode(ast.typename, ast.lineno, ast.colno);
            propsT.forEach((prop, i) => {
                ast[ast.fields[i]] = prop;
            });
        }
    }
    return depthFirst ? (func(ast) || ast) : ast;
}
function depthWalk(ast, func) {
    return walk(ast, func, true);
}
function _liftFilters(node, asyncFilters, prop) {
    const children = [];
    const walked = depthWalk(prop ? node[prop] : node, (descNode) => {
        let symbol;
        if (descNode instanceof block_1.Block) {
            return descNode;
        }
        else if ((descNode instanceof filter_1.Filter &&
            lib.indexOf(asyncFilters, descNode.name.value) !== -1) ||
            descNode instanceof callExtensionAsync_1.CallExtensionAsync) {
            symbol = new nunjucksSymbol_1.NunjucksSymbol(descNode.lineno, descNode.colno, gensym());
            children.push(new filterAsync_1.FilterAsync(descNode.lineno, descNode.colno, descNode.name, descNode.args, symbol));
        }
        return symbol;
    });
    if (prop) {
        node[prop] = walked;
    }
    else {
        node = walked;
    }
    if (children.length) {
        children.push(node);
        return new nunjucksNode_1.NunjucksNodeList(node.lineno, node.colno, children);
    }
    else {
        return node;
    }
}
function liftFilters(ast, asyncFilters) {
    return depthWalk(ast, (node) => {
        if (node instanceof output_1.Output) {
            return _liftFilters(node, asyncFilters);
        }
        else if (node instanceof set_1.Set) {
            return _liftFilters(node, asyncFilters, 'value');
        }
        else if (node instanceof for_1.For) {
            return _liftFilters(node, asyncFilters, 'arr');
        }
        else if (node instanceof if_1.If) {
            return _liftFilters(node, asyncFilters, 'cond');
        }
        else if (node instanceof nunjucksNode_1.CallExtension) {
            return _liftFilters(node, asyncFilters, 'args');
        }
        else {
            return undefined;
        }
    });
}
function liftSuper(ast) {
    return walk(ast, (blockNode) => {
        if (!(blockNode instanceof block_1.Block)) {
            return;
        }
        let hasSuper = false;
        const symbol = gensym();
        blockNode.body = walk(blockNode.body, (node) => {
            if (node instanceof funCall_1.FunCall && node.name.value === 'super') {
                hasSuper = true;
                return new nunjucksSymbol_1.NunjucksSymbol(node.lineno, node.colno, symbol);
            }
        });
        if (hasSuper) {
            blockNode.body.children.unshift(new super_1.Super(0, 0, blockNode.name, new nunjucksSymbol_1.NunjucksSymbol(0, 0, symbol)));
        }
    });
}
function convertStatements(ast) {
    return depthWalk(ast, (node) => {
        if (!(node instanceof if_1.If) && !(node instanceof for_1.For)) {
            return undefined;
        }
        let async = false;
        walk(node, (child) => {
            if (child instanceof filterAsync_1.FilterAsync ||
                child instanceof ifAsync_1.IfAsync ||
                child instanceof asyncEach_1.AsyncEach ||
                child instanceof asyncAll_1.AsyncAll ||
                child instanceof callExtensionAsync_1.CallExtensionAsync) {
                async = true;
                // Stop iterating by returning the node
                return child;
            }
            return undefined;
        });
        if (async) {
            if (node instanceof if_1.If) {
                return new ifAsync_1.IfAsync(node.lineno, node.colno, node.cond, node.body, node.else_);
            }
            else if (node instanceof for_1.For && !(node instanceof asyncAll_1.AsyncAll)) {
                return new asyncEach_1.AsyncEach(node.lineno, node.colno, node.arr, node.name, node.body, node.else_);
            }
        }
        return undefined;
    });
}
function cps(ast, asyncFilters) {
    return convertStatements(liftSuper(liftFilters(ast, asyncFilters)));
}
function transform(ast, asyncFilters, name) {
    return cps(ast, asyncFilters || []);
}
exports.transform = transform;
//# sourceMappingURL=transformer.js.map