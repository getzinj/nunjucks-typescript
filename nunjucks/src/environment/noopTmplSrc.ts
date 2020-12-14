/**
 * A no-op template, for use with {% include ignore missing %}
 */
import { handleError } from '../runtime/runtime';
import { IContext } from '../interfaces/IContext';
import { IEnvironment } from '../interfaces/IEnvironment';
import { ISourceDetails } from '../interfaces/ISourceDetails';
import { IFrame } from '../interfaces/IFrame';
import { IRuntime } from '../interfaces/IRuntime';



export const noopTmplSrc: ISourceDetails = {
  type: 'code',
  obj: {
    root(env: IEnvironment,
         context: IContext,
         frame: IFrame,
         runtime: IRuntime,
         cb: (arg0, arg1?: string) => void): void {
      try {
        cb(null, '');
      } catch (e) {
        cb(handleError(e, null, null));
      }
    }
  }
};
