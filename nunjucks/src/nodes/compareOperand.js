"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompareOperand = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class CompareOperand extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, expr, type) {
        super(lineno, colno, expr, type);
    }
    get typename() { return 'CompareOperand'; }
    get fields() {
        return ['expr', 'type'];
    }
}
exports.CompareOperand = CompareOperand;
//# sourceMappingURL=compareOperand.js.map