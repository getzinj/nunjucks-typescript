import { Token } from '../lexer/token';
import { TokenType } from '../lexer/tokenType';
import { ITokenizer } from '../../interfaces/ITokenizer';
import { IParserTokenStream } from '../../interfaces/IParserTokenStream';



export class ParserTokenStream implements IParserTokenStream {
  peeked: Token<any> | null = null;

  get currentLine(): string { return this.tokens.currentLine; }


  constructor(public tokens: ITokenizer) { }


  nextToken(withWhitespace?: boolean): Token<any> | null {
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
      tok = this.skipWhitespace(tok);
    }

    return tok;
  }


  skipWhitespace(tok: Token<any>): Token<any> | null {
    while (tok && tok.type === TokenType.TOKEN_WHITESPACE) {
      tok = this.tokens.nextToken();
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
