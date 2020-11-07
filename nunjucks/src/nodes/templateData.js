"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateData = void 0;
const literal_1 = require("./literal");
class TemplateData extends literal_1.Literal {
    get typename() { return 'TemplateData'; }
    constructor(lineno, colno, value) {
        super(lineno, colno, value);
    }
}
exports.TemplateData = TemplateData;
//# sourceMappingURL=templateData.js.map