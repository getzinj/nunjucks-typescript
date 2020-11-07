"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunCall = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class FunCall extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, name, args, ...additional) {
        super(lineno, colno, name, args, ...additional);
    }
    get typename() { return 'FunCall'; }
    get fields() {
        return ['name', 'args'];
    }
}
exports.FunCall = FunCall;
//# sourceMappingURL=funCall.js.map