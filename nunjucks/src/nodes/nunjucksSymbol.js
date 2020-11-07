"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NunjucksSymbol = void 0;
const value_1 = require("./value");
class NunjucksSymbol extends value_1.Value {
    get typename() { return 'NunjucksSymbol'; }
    constructor(lineno, colno, value) {
        super(lineno, colno, value);
    }
}
exports.NunjucksSymbol = NunjucksSymbol;
//# sourceMappingURL=nunjucksSymbol.js.map