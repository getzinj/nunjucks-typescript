"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mul = void 0;
const binOp_1 = require("./binOp");
class Mul extends binOp_1.BinOp {
    get typename() { return 'Mul'; }
    constructor(lineno, colno, left, right) {
        super(lineno, colno, left, right);
    }
}
exports.Mul = Mul;
//# sourceMappingURL=mul.js.map