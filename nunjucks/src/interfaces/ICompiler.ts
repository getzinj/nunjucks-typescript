import { IExtension } from './IExtension';
import { ICompilerOptions } from './ICompilerOptions';



export interface ICompiler {
  compile(src: string,
          asyncFilters,
          extensions: IExtension[],
          name: string,
          opts: ICompilerOptions): string;
}
