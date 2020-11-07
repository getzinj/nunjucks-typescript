"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pow = void 0;
const binOp_1 = require("./binOp");
class Pow extends binOp_1.BinOp {
    get typename() { return 'Pow'; }
    constructor(lineno, colno, left, right) {
        super(lineno, colno, left, right);
    }
}
exports.Pow = Pow;
//# sourceMappingURL=pow.js.map