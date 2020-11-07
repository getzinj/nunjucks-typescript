"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnaryOp = void 0;
const nunjucksNode_1 = require("../../nodes/nunjucksNode");
class UnaryOp extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, target) {
        super(lineno, colno, target);
    }
    get typename() { return 'UnaryOp'; }
    get fields() {
        return ['target'];
    }
}
exports.UnaryOp = UnaryOp;
//# sourceMappingURL=unaryOp.js.map