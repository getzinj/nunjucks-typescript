"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayNode = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class ArrayNode extends nunjucksNode_1.NunjucksNodeList {
    get typename() { return 'ArrayNode'; }
    constructor(lineno, colno, children) {
        super(lineno, colno, children);
    }
}
exports.ArrayNode = ArrayNode;
//# sourceMappingURL=arrayNode.js.map