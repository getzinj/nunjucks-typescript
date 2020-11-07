"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mod = void 0;
const binOp_1 = require("./binOp");
class Mod extends binOp_1.BinOp {
    get typename() { return 'Mod'; }
    constructor(lineno, colno, left, right) {
        super(lineno, colno, left, right);
    }
}
exports.Mod = Mod;
//# sourceMappingURL=mod.js.map