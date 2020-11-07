"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Not = void 0;
const unaryOp_1 = require("./unaryOp");
class Not extends unaryOp_1.UnaryOp {
    get typename() { return 'Not'; }
    constructor(lineno, colno, target) {
        super(lineno, colno, target);
    }
}
exports.Not = Not;
//# sourceMappingURL=not.js.map