"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserTokenStream = void 0;
const tokenType_1 = require("../lexer/tokenType");
class ParserTokenStream {
    constructor(tokens) {
        this.tokens = tokens;
    }
    nextToken(withWhitespace) {
        let tok;
        if (this.peeked) {
            if (!withWhitespace && this.peeked.type === tokenType_1.TokenType.TOKEN_WHITESPACE) {
                this.peeked = null;
            }
            else {
                tok = this.peeked;
                this.peeked = null;
                return tok;
            }
        }
        tok = this.tokens.nextToken();
        if (!withWhitespace) {
            while (tok && tok.type === tokenType_1.TokenType.TOKEN_WHITESPACE) {
                tok = this.tokens.nextToken();
            }
        }
        return tok;
    }
    peekToken() {
        this.peeked = this.peeked || this.nextToken();
        return this.peeked;
    }
    pushToken(tok) {
        if (this.peeked) {
            throw new Error('pushToken: can only push one token on between reads');
        }
        this.peeked = tok;
    }
}
exports.ParserTokenStream = ParserTokenStream;
//# sourceMappingURL=parserTokenStream.js.map