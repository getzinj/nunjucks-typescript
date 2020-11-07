"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Root = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class Root extends nunjucksNode_1.NunjucksNodeList {
    get typename() { return 'Root'; }
    constructor(lineno, colno, children) {
        super(lineno, colno, children);
    }
}
exports.Root = Root;
//# sourceMappingURL=root.js.map