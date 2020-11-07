"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Neg = void 0;
const unaryOp_1 = require("./unaryOp");
class Neg extends unaryOp_1.UnaryOp {
    get typename() { return 'Neg'; }
    constructor(lineno, colno, target) {
        super(lineno, colno, target);
    }
}
exports.Neg = Neg;
//# sourceMappingURL=neg.js.map