"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
class Token {
    constructor(type, value, lineno, colno) {
        this.type = type;
        this.value = value;
        this.lineno = lineno;
        this.colno = colno;
    }
}
exports.Token = Token;
//# sourceMappingURL=token.js.map