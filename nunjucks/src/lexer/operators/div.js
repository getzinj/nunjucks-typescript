"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Div = void 0;
const binOp_1 = require("./binOp");
class Div extends binOp_1.BinOp {
    get typename() { return 'Div'; }
    constructor(lineno, colno, left, right) {
        super(lineno, colno, left, right);
    }
}
exports.Div = Div;
//# sourceMappingURL=div.js.map