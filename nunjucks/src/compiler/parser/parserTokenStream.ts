import { Token } from '../lexer/token';
import { Tokenizer } from '../lexer/tokenizer';
import { TokenType } from '../lexer/tokenType';



export class ParserTokenStream {
  peeked: Token<any> | null = null;

  get currentLine(): string { return this.tokens.currentLine; }


  constructor(public tokens: Tokenizer) { }


  nextToken(withWhitespace?): Token<any> | null {
    let tok: Token<any> | null;

    if (this.peeked) {
      if (!withWhitespace && this.peeked.type === TokenType.TOKEN_WHITESPACE) {
        this.peeked = null;
      } else {
        tok = this.peeked;
        this.peeked = null;
        return tok;
      }
    }

    tok = this.tokens.nextToken();

    if (!withWhitespace) {
      while (tok && tok.type === TokenType.TOKEN_WHITESPACE) {
        tok = this.tokens.nextToken();
      }
    }

    return tok;
  }


  peekToken(): Token<any> {
    this.peeked = this.peeked || this.nextToken();
    return this.peeked;
  }


  pushToken(tok): void {
    if (this.peeked) {
      throw new Error('pushToken: can only push one token on between reads');
    }
    this.peeked = tok;
  }
}
