"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noopTmplSrc = void 0;
/**
 * A no-op template, for use with {% include ignore missing %}
 */
const runtime_1 = require("./runtime");
exports.noopTmplSrc = {
    type: 'code',
    obj: {
        root(env, context, frame, runtime, cb) {
            try {
                cb(null, '');
            }
            catch (e) {
                cb(runtime_1.handleError(e, null, null));
            }
        }
    }
};
//# sourceMappingURL=noopTmplSrc.js.map