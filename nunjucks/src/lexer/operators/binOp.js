"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinOp = void 0;
const nunjucksNode_1 = require("../../nodes/nunjucksNode");
class BinOp extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, left, right) {
        super(lineno, colno, left, right);
    }
    get typename() { return 'BinOp'; }
    get fields() {
        return ['left', 'right'];
    }
}
exports.BinOp = BinOp;
//# sourceMappingURL=binOp.js.map