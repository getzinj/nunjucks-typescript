import { Frame } from '../runtime/frame';
import { Environment} from './environment';
import { Context } from './context';



export interface IBlockFunction {
  (env: Environment, context: Context, frame: Frame, runtime, cb: (...args: any[]) => void): void;
}
