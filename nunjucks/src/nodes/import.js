"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Import = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class Import extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, template, target, withContext) {
        super(lineno, colno, template, target, withContext);
    }
    get typename() { return 'Import'; }
    get fields() {
        return ['template', 'target', 'withContext'];
    }
}
exports.Import = Import;
//# sourceMappingURL=import.js.map