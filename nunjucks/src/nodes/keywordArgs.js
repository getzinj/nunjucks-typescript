"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordArgs = void 0;
const dict_1 = require("./dict");
class KeywordArgs extends dict_1.Dict {
    get typename() { return 'KeywordArgs'; }
    constructor(lineno, colno, children) {
        super(lineno, colno, children);
    }
}
exports.KeywordArgs = KeywordArgs;
//# sourceMappingURL=keywordArgs.js.map