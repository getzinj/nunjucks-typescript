"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Output = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class Output extends nunjucksNode_1.NunjucksNodeList {
    get typename() { return 'Output'; }
    constructor(lineno, colno, children) {
        super(lineno, colno, children);
    }
}
exports.Output = Output;
//# sourceMappingURL=output.js.map