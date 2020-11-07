"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sub = void 0;
const binOp_1 = require("./binOp");
class Sub extends binOp_1.BinOp {
    get typename() { return 'Sub'; }
    constructor(lineno, colno, node1, node2) {
        super(lineno, colno, node1, node2);
    }
}
exports.Sub = Sub;
//# sourceMappingURL=sub.js.map