import { Token } from '../compiler/lexer/token';



export interface ITokenizer {
  currentLine_: string;
  colno: number;
  lineno: number;
  index: number;
  tags: Record<string, string>;
  currentLine: string;

  nextToken(): Token<any>;

  _extractRegex(rawBlockRegex: RegExp): RegExpMatchArray;

  backN(number: number): void;
}
