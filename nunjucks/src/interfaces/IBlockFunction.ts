import { Frame } from '../runtime/frame';
import { IContext } from './IContext';
import { IEnvironment } from './IEnvironment';



export interface IBlockFunction {
  (env: IEnvironment, context: IContext, frame: Frame, runtime, cb: (...args: any[]) => void): void;
}
