"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pair = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class Pair extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, key, value) {
        super(lineno, colno, key, value);
    }
    get typename() { return 'Pair'; }
    get fields() {
        return ['key', 'value'];
    }
}
exports.Pair = Pair;
//# sourceMappingURL=pair.js.map