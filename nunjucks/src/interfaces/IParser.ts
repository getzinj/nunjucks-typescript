import { NunjucksNodeList } from '../nodes/nunjucksNodeList';
import { Token } from '../compiler/lexer/token';
import { TokenType } from '../compiler/lexer/tokenType';
import { Root } from '../nodes/root';

export interface IParser {

  parse(): NunjucksNodeList;

  error(msg: string, lineno, colno): Error;

  fail(msg: string, lineno?: number, colno?: number): void;

  skip(type): boolean;

  expect(type: string): Token<any>;

  skipValue(type: TokenType, val: string): boolean;

  skipSymbol(val: string): boolean;

  parseAsRoot(): Root;
}
