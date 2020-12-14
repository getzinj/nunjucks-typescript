import { Token } from '../compiler/lexer/token';



export interface IParserTokenStream {
  currentLine: string;
  nextToken(withWhitespace?: boolean): Token<any> | null;

  skipWhitespace(tok: Token<any>): Token<any> | null;

  peekToken(): Token<any>;

  pushToken(tok): void;
}
