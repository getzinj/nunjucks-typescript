"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.And = void 0;
const binOp_1 = require("./binOp");
class And extends binOp_1.BinOp {
    get typename() { return 'And'; }
    constructor(lineno, colno, left, right) {
        super(lineno, colno, left, right);
    }
}
exports.And = And;
//# sourceMappingURL=and.js.map