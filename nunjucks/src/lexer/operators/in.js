"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.In = void 0;
const binOp_1 = require("./binOp");
class In extends binOp_1.BinOp {
    get typename() { return 'In'; }
    constructor(lineno, colno, left, right) {
        super(lineno, colno, left, right);
    }
}
exports.In = In;
//# sourceMappingURL=in.js.map