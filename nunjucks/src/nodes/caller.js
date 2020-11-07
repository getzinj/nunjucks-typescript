"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Caller = void 0;
const macro_1 = require("./macro");
class Caller extends macro_1.Macro {
    get typename() { return 'Caller'; }
    constructor(lineno, colno, name, args, body) {
        super(lineno, colno, name, args, body);
    }
}
exports.Caller = Caller;
//# sourceMappingURL=caller.js.map