"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Case = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class Case extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, cond, body) {
        super(lineno, colno, cond, body);
    }
    get typename() { return 'Case'; }
    get fields() {
        return ['cond', 'body'];
    }
}
exports.Case = Case;
//# sourceMappingURL=case.js.map