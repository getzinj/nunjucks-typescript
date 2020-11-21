import { IParserOptions } from './parser/IParserOptions';



export interface ICompilerOptions extends IParserOptions {
  throwOnUndefined?: boolean
}
