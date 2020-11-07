"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterAsync = void 0;
const filter_1 = require("./filter");
class FilterAsync extends filter_1.Filter {
    constructor(lineno, colno, name, args, symbol) {
        super(lineno, colno, name, args, symbol);
    }
    get typename() { return 'FilterAsync'; }
    get fields() {
        return ['name', 'args', 'symbol'];
    }
}
exports.FilterAsync = FilterAsync;
//# sourceMappingURL=filterAsync.js.map