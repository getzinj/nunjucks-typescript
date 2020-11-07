"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compare = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class Compare extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, expr, ops) {
        super(lineno, colno, expr, ops);
    }
    get typename() { return 'Compare'; }
    get fields() {
        return ['expr', 'ops'];
    }
}
exports.Compare = Compare;
//# sourceMappingURL=compare.js.map