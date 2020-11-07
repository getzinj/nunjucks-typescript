"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filter = void 0;
const funCall_1 = require("./funCall");
class Filter extends funCall_1.FunCall {
    get typename() { return 'Filter'; }
    constructor(lineno, colno, name, args, ...additional) {
        super(lineno, colno, name, args, ...additional);
    }
}
exports.Filter = Filter;
//# sourceMappingURL=filter.js.map