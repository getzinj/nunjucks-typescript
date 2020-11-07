"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncEach = void 0;
const for_1 = require("./for");
class AsyncEach extends for_1.For {
    get typename() { return 'AsyncEach'; }
    constructor(lineno, colno, arr, name, body, else_) {
        super(lineno, colno, arr, name, body, else_);
    }
}
exports.AsyncEach = AsyncEach;
//# sourceMappingURL=asyncEach.js.map