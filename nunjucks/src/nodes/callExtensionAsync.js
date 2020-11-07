"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallExtensionAsync = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class CallExtensionAsync extends nunjucksNode_1.CallExtension {
    get typename() { return 'CallExtensionAsync'; }
    constructor(lineno, colno, ext, prop, args, contentArgs) {
        super(lineno, colno, ext, prop, args, contentArgs);
    }
}
exports.CallExtensionAsync = CallExtensionAsync;
//# sourceMappingURL=callExtensionAsync.js.map