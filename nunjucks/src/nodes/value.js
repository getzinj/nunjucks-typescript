"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Value = void 0;
// Abstract nodes
const nunjucksNode_1 = require("./nunjucksNode");
class Value extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, value) {
        super(lineno, colno, value);
        this.value = value;
    }
    get typename() { return 'Value'; }
    get fields() {
        return ['value'];
    }
}
exports.Value = Value;
//# sourceMappingURL=value.js.map