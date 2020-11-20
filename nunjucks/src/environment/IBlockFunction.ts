import { Frame } from '../runtime/frame';
import { Environment, Context } from './environment';



export interface IBlockFunction {
  (env: Environment, context: Context, frame: Frame, runtime, cb: (...args: any[]) => void): void;
}
