"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateRef = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class TemplateRef extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, template) {
        super(lineno, colno, template);
    }
    get typename() { return 'TemplateRef'; }
    get fields() {
        return ['template'];
    }
}
exports.TemplateRef = TemplateRef;
//# sourceMappingURL=templateRef.js.map