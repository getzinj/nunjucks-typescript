"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class Block extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, name, body) {
        super(lineno, colno, name, body);
    }
    get typename() { return 'Block'; }
    get fields() {
        return ['name', 'body'];
    }
}
exports.Block = Block;
//# sourceMappingURL=block.js.map