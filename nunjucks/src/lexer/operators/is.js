"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Is = void 0;
const binOp_1 = require("./binOp");
class Is extends binOp_1.BinOp {
    get typename() { return 'Is'; }
    constructor(lineno, colno, left, right) {
        super(lineno, colno, left, right);
    }
}
exports.Is = Is;
//# sourceMappingURL=is.js.map