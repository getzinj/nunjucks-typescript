"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pos = void 0;
const unaryOp_1 = require("./unaryOp");
class Pos extends unaryOp_1.UnaryOp {
    get typename() { return 'Pos'; }
    constructor(lineno, colno, target) {
        super(lineno, colno, target);
    }
}
exports.Pos = Pos;
//# sourceMappingURL=pos.js.map