import { IParser } from './IParser';
import { CallExtension } from '../../nodes/nunjucksNode';
import { IPreprocessor } from '../IPreprocessor';
import { Context } from '../../environment/context';



export interface IExtension {
  preprocess?: IPreprocessor;
  readonly tags: string[];
  __name?: new () => IExtension;

  parse(parser: IParser, nodes, lexer): CallExtension;

  run(context: Context, prefix: string | (() => string), kwargs: { cutoff?: any; } | (() => string), body: () => string): string;

  parse(parser: IParser, nodes, lexer);
}
