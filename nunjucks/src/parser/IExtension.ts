import { IParser } from './IParser';
import { CallExtension } from '../nodes/nunjucksNode';



export interface IExtension {
  readonly tags: string[];
  __name?: new () => IExtension;

  parse(parser, nodes, lexer): CallExtension;

  run(context: any, prefix: string | (() => string), kwargs: { cutoff?: any; } | (() => string), body: () => string): string;

  parse(parser: IParser, nodes, lexer);
}
