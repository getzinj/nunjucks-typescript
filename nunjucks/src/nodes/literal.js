"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Literal = void 0;
const value_1 = require("./value");
class Literal extends value_1.Value {
    get typename() { return 'Literal'; }
    constructor(lineno, colno, value) {
        super(lineno, colno, value);
    }
}
exports.Literal = Literal;
//# sourceMappingURL=literal.js.map