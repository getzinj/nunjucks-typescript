"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class Group extends nunjucksNode_1.NunjucksNodeList {
    get typename() { return 'Group'; }
    constructor(lineno, colno, children) {
        super(lineno, colno, children);
    }
}
exports.Group = Group;
//# sourceMappingURL=group.js.map