import { IParser } from './IParser';



export interface IExtension {
  tags?;

  parse(parser: IParser, nodes, lexer);
}
