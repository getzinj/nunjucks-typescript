"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Set = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class Set extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, targets, value) {
        super(lineno, colno, targets, value);
    }
    get typename() { return 'Set'; }
    get fields() {
        return ['targets', 'value', 'body'];
    }
}
exports.Set = Set;
//# sourceMappingURL=set.js.map