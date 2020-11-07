"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FromImport = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class FromImport extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, template, names, withContext) {
        super(lineno, colno, template, names || new nunjucksNode_1.NunjucksNodeList(lineno, colno, undefined), withContext);
    }
    get typename() { return 'FromImport'; }
    get fields() {
        return ['template', 'names', 'withContext'];
    }
}
exports.FromImport = FromImport;
//# sourceMappingURL=fromImport.js.map