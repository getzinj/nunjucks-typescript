"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Extends = void 0;
const templateRef_1 = require("./templateRef");
class Extends extends templateRef_1.TemplateRef {
    get typename() { return 'Extends'; }
    constructor(lineno, colno, template) {
        super(lineno, colno, template);
    }
}
exports.Extends = Extends;
//# sourceMappingURL=extends.js.map