"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dict = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class Dict extends nunjucksNode_1.NunjucksNodeList {
    get typename() { return 'Dict'; }
    constructor(lineno, colno, children) {
        super(lineno, colno, children);
    }
}
exports.Dict = Dict;
//# sourceMappingURL=dict.js.map