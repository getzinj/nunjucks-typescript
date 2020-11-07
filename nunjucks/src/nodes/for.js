"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.For = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class For extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, arr, name, body, else_) {
        super(lineno, colno, arr, name, body, else_);
    }
    get typename() { return 'For'; }
    get fields() {
        return ['arr', 'name', 'body', 'else_'];
    }
}
exports.For = For;
//# sourceMappingURL=for.js.map