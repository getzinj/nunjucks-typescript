"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupVal = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class LookupVal extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, target, val) {
        super(lineno, colno, target, val);
    }
    get typename() { return 'LookupVal'; }
    get fields() {
        return ['target', 'val'];
    }
}
exports.LookupVal = LookupVal;
//# sourceMappingURL=lookupVal.js.map