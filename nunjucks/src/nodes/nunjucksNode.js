"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printNodes = exports.print = exports.traverseAndCheck = exports.CallExtension = exports.NunjucksNodeList = exports.NunjucksNode = void 0;
class NunjucksNode {
    constructor(lineno, colno, ...args) {
        this.lineno = lineno;
        this.colno = colno;
        this.assignValuesToFields(args);
    }
    get typename() { return 'NunjucksNode'; }
    get fields() { return []; }
    assignValuesToFields(args) {
        this.fields.forEach((fieldName, i) => {
            var _a;
            // Fields should never be undefined, but null. It makes
            // testing easier to normalize values.
            this[fieldName] = (_a = args === null || args === void 0 ? void 0 : args[i]) !== null && _a !== void 0 ? _a : null;
        });
    }
    findAll(type, results) {
        results = results || [];
        this.fields.forEach((field) => traverseAndCheck(this[field], type, results));
        return results;
    }
    iterFields(func) {
        this.fields.forEach((field) => {
            func(this[field], field);
        });
    }
}
exports.NunjucksNode = NunjucksNode;
class NunjucksNodeList extends NunjucksNode {
    constructor(lineno, colno, nodes) {
        super(lineno, colno, nodes !== null && nodes !== void 0 ? nodes : []);
    }
    get typename() {
        return 'NunjucksNodeList';
    }
    addChild(node) {
        this.children.push(node);
    }
    get fields() {
        return ['children'];
    }
    findAll(type, results) {
        results = results || [];
        this.children.forEach((child) => traverseAndCheck(child, type, results));
        return results;
    }
}
exports.NunjucksNodeList = NunjucksNodeList;
class CallExtension extends NunjucksNode {
    constructor(ext, prop, args, contentArgs) {
        super(undefined, undefined);
        this.extName = ext.__name || ext;
        this.prop = prop;
        this.args = args !== null && args !== void 0 ? args : new NunjucksNodeList(undefined, undefined, undefined);
        this.contentArgs = contentArgs || [];
        this.autoescape = ext.autoescape;
    }
    get typename() {
        return 'CallExtension';
    }
    get fields() {
        return ['extName', 'prop', 'args', 'contentArgs'];
    }
}
exports.CallExtension = CallExtension;
function traverseAndCheck(obj, type, results) {
    if (obj instanceof type) {
        results.push(obj);
    }
    if (obj instanceof NunjucksNode) {
        obj.findAll(type, results);
    }
}
exports.traverseAndCheck = traverseAndCheck;
// This is hacky, but this is just a debugging function anyway
function print(str, indent, inline) {
    var lines = str.split('\n');
    lines.forEach((line, i) => {
        if (line && ((inline && i > 0) || !inline)) {
            process.stdout.write((' ').repeat(indent));
        }
        const nl = (i === lines.length - 1) ? '' : '\n';
        process.stdout.write(`${line}${nl}`);
    });
}
exports.print = print;
// Print the AST in a nicely formatted tree format for debugging
function printNodes(node, indent) {
    indent = indent || 0;
    print(node.typename + ': ', indent);
    if (node instanceof NunjucksNodeList) {
        print('\n');
        node.children.forEach((n) => {
            printNodes(n, indent + 2);
        });
    }
    else if (node instanceof CallExtension) {
        print(`${node.extName}.${node.prop}\n`);
        if (node.args) {
            printNodes(node.args, indent + 2);
        }
        if (node.contentArgs) {
            node.contentArgs.forEach((n) => {
                printNodes(n, indent + 2);
            });
        }
    }
    else {
        let nodes = [];
        let props = null;
        node.iterFields((val, fieldName) => {
            if (val instanceof NunjucksNode) {
                nodes.push([fieldName, val]);
            }
            else {
                props = props || {};
                props[fieldName] = val;
            }
        });
        if (props) {
            print(JSON.stringify(props, null, 2) + '\n', null, true);
        }
        else {
            print('\n');
        }
        nodes.forEach(([fieldName, n]) => {
            print(`[${fieldName}] =>`, indent + 2);
            printNodes(n, indent + 4);
        });
    }
}
exports.printNodes = printNodes;
//# sourceMappingURL=nunjucksNode.js.map