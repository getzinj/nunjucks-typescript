"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.If = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class If extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, cond, body, else_) {
        super(lineno, colno, cond, body, else_);
    }
    get typename() { return 'If'; }
    get fields() {
        return ['cond', 'body', 'else_'];
    }
}
exports.If = If;
//# sourceMappingURL=if.js.map