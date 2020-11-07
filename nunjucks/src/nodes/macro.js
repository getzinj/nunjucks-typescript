"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Macro = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class Macro extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, name, args, body) {
        super(lineno, colno, name, args, body);
    }
    get typename() { return 'Macro'; }
    get fields() {
        return ['name', 'args', 'body'];
    }
}
exports.Macro = Macro;
//# sourceMappingURL=macro.js.map