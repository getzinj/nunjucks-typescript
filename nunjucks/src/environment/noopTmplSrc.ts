/**
 * A no-op template, for use with {% include ignore missing %}
 */
import { handleError, Frame } from '../runtime/runtime';
import { IContext } from '../interfaces/IContext';
import { IEnvironment } from '../interfaces/IEnvironment';



export const noopTmplSrc = {
  type: 'code',
  obj: {
    root(env: IEnvironment, context: IContext, frame: Frame, runtime, cb: (arg0, arg1?: string) => void) {
      try {
        cb(null, '');
      } catch (e) {
        cb(handleError(e, null, null));
      }
    }
  }
};
