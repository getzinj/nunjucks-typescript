"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Include = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class Include extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, template, ignoreMissing) {
        super(lineno, colno, template, ignoreMissing);
    }
    get typename() { return 'Include'; }
    get fields() {
        return ['template', 'ignoreMissing'];
    }
}
exports.Include = Include;
//# sourceMappingURL=include.js.map