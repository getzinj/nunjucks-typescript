"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineIf = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class InlineIf extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, cond, body, else_) {
        super(lineno, colno, cond, body, else_);
    }
    get typename() { return 'InlineIf'; }
    get fields() {
        return ['cond', 'body', 'else_'];
    }
}
exports.InlineIf = InlineIf;
//# sourceMappingURL=inlineIf.js.map