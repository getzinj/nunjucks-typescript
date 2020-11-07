/**
 * A no-op template, for use with {% include ignore missing %}
 */
import { handleError } from './runtime';



export const noopTmplSrc = {
  type: 'code',
  obj: {
    root(env, context, frame, runtime, cb) {
      try {
        cb(null, '');
      } catch (e) {
        cb(handleError(e, null, null));
      }
    }
  }
};
