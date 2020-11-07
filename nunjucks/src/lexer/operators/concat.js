"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Concat = void 0;
const binOp_1 = require("./binOp");
class Concat extends binOp_1.BinOp {
    get typename() { return 'Concat'; }
    constructor(lineno, colno, node1, node2) {
        super(lineno, colno, node1, node2);
    }
}
exports.Concat = Concat;
//# sourceMappingURL=concat.js.map