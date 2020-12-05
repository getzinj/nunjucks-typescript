import { IEnvironment } from './IEnvironment';
import { IContext } from './IContext';
import { Frame } from '../runtime/frame';



export interface ISourceDetailsObj {
  root?: (env: IEnvironment, context: IContext, frame: Frame, runtime, cb: (arg0, arg1?: string) => void) => void;
}
