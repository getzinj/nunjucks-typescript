"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncAll = void 0;
const for_1 = require("./for");
class AsyncAll extends for_1.For {
    get typename() { return 'AsyncAll'; }
    constructor(lineno, colno, arr, name, body, else_) {
        super(lineno, colno, arr, name, body, else_);
    }
}
exports.AsyncAll = AsyncAll;
//# sourceMappingURL=asyncAll.js.map