"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloorDiv = void 0;
const binOp_1 = require("./binOp");
class FloorDiv extends binOp_1.BinOp {
    get typename() { return 'FloorDiv'; }
    constructor(lineno, colno, left, right) {
        super(lineno, colno, left, right);
    }
}
exports.FloorDiv = FloorDiv;
//# sourceMappingURL=floorDiv.js.map