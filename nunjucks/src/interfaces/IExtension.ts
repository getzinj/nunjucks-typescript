import { IParser } from './IParser';
import { CallExtension } from '../nodes/nunjucksNode';
import { IPreprocessor } from './IPreprocessor';
import { IContext } from './IContext';



export interface IExtension {
  preprocess?: IPreprocessor;
  readonly tags: string[];
  __name?;

  parse(parser: IParser, nodes): CallExtension;

  run(context: IContext,
      prefix: string | (() => string),
      kwargs: { cutoff?: any; } | (() => string),
      body: () => string): string;

  parse(parser: IParser, nodes, lexer);
}
