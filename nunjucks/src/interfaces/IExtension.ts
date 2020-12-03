import { IParser } from './IParser';
import { IPreprocessor } from './IPreprocessor';
import { IContext } from './IContext';
import { CallExtension } from '../nodes/callExtension';



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
