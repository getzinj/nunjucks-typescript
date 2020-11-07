"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfAsync = void 0;
const if_1 = require("./if");
class IfAsync extends if_1.If {
    get typename() { return 'IfAsync'; }
    constructor(lineno, colno, cond, body, else_) {
        super(lineno, colno, cond, body, else_);
    }
}
exports.IfAsync = IfAsync;
//# sourceMappingURL=ifAsync.js.map