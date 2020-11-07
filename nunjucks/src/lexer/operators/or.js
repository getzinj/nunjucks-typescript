"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Or = void 0;
const binOp_1 = require("./binOp");
class Or extends binOp_1.BinOp {
    get typename() { return 'Or'; }
    constructor(lineno, colno, left, right) {
        super(lineno, colno, left, right);
    }
}
exports.Or = Or;
//# sourceMappingURL=or.js.map