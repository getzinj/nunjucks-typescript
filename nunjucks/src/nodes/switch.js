"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Switch = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class Switch extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, expr, cases, defaultCase) {
        super(lineno, colno, expr, cases, defaultCase);
    }
    get typename() { return 'Switch'; }
    get fields() {
        return ['expr', 'cases', 'default'];
    }
}
exports.Switch = Switch;
//# sourceMappingURL=switch.js.map