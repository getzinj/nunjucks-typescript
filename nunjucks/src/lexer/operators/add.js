"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Add = void 0;
const binOp_1 = require("./binOp");
class Add extends binOp_1.BinOp {
    get typename() { return 'Add'; }
    constructor(lineno, colno, left, right) {
        super(lineno, colno, left, right);
    }
}
exports.Add = Add;
//# sourceMappingURL=add.js.map