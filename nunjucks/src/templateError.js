"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateError = void 0;
class TemplateError {
    constructor(message, lineno, colno) {
        var err;
        var cause;
        if (message instanceof Error) {
            cause = message;
            message = `${cause.name}: ${cause.message}`;
        }
        if (Object.setPrototypeOf) {
            err = new Error(message);
            Object.setPrototypeOf(err, TemplateError.prototype);
        }
        else {
            err = this;
            Object.defineProperty(err, 'message', {
                enumerable: false,
                writable: true,
                value: message,
            });
        }
        Object.defineProperty(err, 'name', {
            value: 'Template render error',
        });
        if (Error.captureStackTrace) {
            Error.captureStackTrace(err, this.constructor);
        }
        let getStack;
        if (cause) {
            const stackDescriptor = Object.getOwnPropertyDescriptor(cause, 'stack');
            getStack = stackDescriptor && (stackDescriptor.get || (() => stackDescriptor.value));
            if (!getStack) {
                getStack = () => cause.stack;
            }
        }
        else {
            const stack = (new Error(message)).stack;
            getStack = (() => stack);
        }
        Object.defineProperty(err, 'stack', {
            get: () => getStack.call(err),
        });
        Object.defineProperty(err, 'cause', {
            value: cause
        });
        err.lineno = lineno;
        err.colno = colno;
        err.firstUpdate = true;
        err.Update = function Update(path) {
            let msg = '(' + (path || 'unknown path') + ')';
            // only show lineno + colno next to path of template
            // where error occurred
            if (this.firstUpdate) {
                if (this.lineno && this.colno) {
                    msg += ` [Line ${this.lineno}, Column ${this.colno}]`;
                }
                else if (this.lineno) {
                    msg += ` [Line ${this.lineno}]`;
                }
            }
            msg += '\n ';
            if (this.firstUpdate) {
                msg += ' ';
            }
            this.message = msg + (this.message || '');
            this.firstUpdate = false;
            return this;
        };
        return err;
    }
}
exports.TemplateError = TemplateError;
//# sourceMappingURL=templateError.js.map