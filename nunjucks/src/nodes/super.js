"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Super = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class Super extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, blockName, symbol) {
        super(lineno, colno, blockName, symbol);
    }
    get typename() { return 'Super'; }
    get fields() {
        return ['blockName', 'symbol'];
    }
}
exports.Super = Super;
//# sourceMappingURL=super.js.map