'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromIterator = exports.asyncAll = exports.asyncEach = exports.handleError = exports.contextOrFrameLookup = exports.callWrap = exports.memberLookup = exports.ensureDefined = exports.suppressValue = exports.markSafe = exports.copySafeness = exports.numArgs = exports.getKeywordArgs = exports.isKeywordArgs = exports.makeKeywordArgs = exports.makeMacro = exports.NunjucksSymbol = exports.TemplateError = exports.keys = exports.inOperator = exports.keys_ = exports.asyncIter = exports.isArray = exports.asyncFor = exports.SafeString = exports.Frame = void 0;
var frame_1 = require("./frame");
Object.defineProperty(exports, "Frame", { enumerable: true, get: function () { return frame_1.Frame; } });
var SafeString_1 = require("./SafeString");
Object.defineProperty(exports, "SafeString", { enumerable: true, get: function () { return SafeString_1.SafeString; } });
const SafeString_2 = require("./SafeString");
var lib_1 = require("./lib");
Object.defineProperty(exports, "asyncFor", { enumerable: true, get: function () { return lib_1.asyncFor; } });
Object.defineProperty(exports, "isArray", { enumerable: true, get: function () { return lib_1.isArray; } });
Object.defineProperty(exports, "asyncIter", { enumerable: true, get: function () { return lib_1.asyncIter; } });
Object.defineProperty(exports, "keys_", { enumerable: true, get: function () { return lib_1.keys; } });
Object.defineProperty(exports, "inOperator", { enumerable: true, get: function () { return lib_1.inOperator; } });
Object.defineProperty(exports, "keys", { enumerable: true, get: function () { return lib_1.keys; } });
const lib_2 = require("./lib");
var templateError_1 = require("./templateError");
Object.defineProperty(exports, "TemplateError", { enumerable: true, get: function () { return templateError_1.TemplateError; } });
const templateError_2 = require("./templateError");
var nunjucksSymbol_1 = require("./nodes/nunjucksSymbol");
Object.defineProperty(exports, "NunjucksSymbol", { enumerable: true, get: function () { return nunjucksSymbol_1.NunjucksSymbol; } });
const nunjucksSymbol_2 = require("./nodes/nunjucksSymbol");
const supportsIterators = (typeof nunjucksSymbol_2.NunjucksSymbol === 'function' && nunjucksSymbol_2.NunjucksSymbol['iterator'] && typeof Array.from === 'function');
function makeMacro(argNames, kwargNames, func) {
    return function macro(...macroArgs) {
        const argCount = numArgs(macroArgs);
        let args;
        const kwargs = getKeywordArgs(macroArgs);
        if (argCount > argNames.length) {
            args = macroArgs.slice(0, argNames.length);
            // Positional arguments that should be passed in as
            // keyword arguments (essentially default values)
            macroArgs.slice(args.length, argCount).forEach((val, i) => {
                if (i < kwargNames.length) {
                    kwargs[kwargNames[i]] = val;
                }
            });
            args.push(kwargs);
        }
        else if (argCount < argNames.length) {
            args = macroArgs.slice(0, argCount);
            for (let i = argCount; i < argNames.length; i++) {
                const arg = argNames[i];
                // Keyword arguments that should be passed as
                // positional arguments, i.e. the caller explicitly
                // used the name of a positional arg
                args.push(kwargs[arg]);
                delete kwargs[arg];
            }
            args.push(kwargs);
        }
        else {
            args = macroArgs;
        }
        return func.apply(this, args);
    };
}
exports.makeMacro = makeMacro;
function makeKeywordArgs(obj) {
    obj.__keywords = true;
    return obj;
}
exports.makeKeywordArgs = makeKeywordArgs;
function isKeywordArgs(obj) {
    return obj && Object.prototype.hasOwnProperty.call(obj, '__keywords');
}
exports.isKeywordArgs = isKeywordArgs;
function getKeywordArgs(args) {
    const len = args.length;
    if (len) {
        const lastArg = args[len - 1];
        if (isKeywordArgs(lastArg)) {
            return lastArg;
        }
    }
    return {};
}
exports.getKeywordArgs = getKeywordArgs;
function numArgs(args) {
    const len = args.length;
    if (len === 0) {
        return 0;
    }
    const lastArg = args[len - 1];
    if (isKeywordArgs(lastArg)) {
        return len - 1;
    }
    else {
        return len;
    }
}
exports.numArgs = numArgs;
function copySafeness(dest, target) {
    if (dest instanceof SafeString_2.SafeString) {
        return new SafeString_2.SafeString(target);
    }
    return target.toString();
}
exports.copySafeness = copySafeness;
function markSafe(val) {
    const type = typeof val;
    if (type === 'string') {
        return new SafeString_2.SafeString(val);
    }
    else if (type !== 'function') {
        return val;
    }
    else {
        return function wrapSafe(args) {
            const ret = val.apply(this, arguments);
            if (typeof ret === 'string') {
                return new SafeString_2.SafeString(ret);
            }
            return ret;
        };
    }
}
exports.markSafe = markSafe;
function suppressValue(val, autoescape) {
    val = (val !== undefined && val !== null) ? val : '';
    if (autoescape && !(val instanceof SafeString_2.SafeString)) {
        val = escape(val.toString());
    }
    return val;
}
exports.suppressValue = suppressValue;
function ensureDefined(val, lineno, colno) {
    if (val === null || val === undefined) {
        throw new templateError_2.TemplateError('attempted to output null or undefined value', lineno + 1, colno + 1);
    }
    return val;
}
exports.ensureDefined = ensureDefined;
exports.memberLookup = function memberLookup(obj, val) {
    if (obj === undefined || obj === null) {
        return undefined;
    }
    if (typeof obj[val] === 'function') {
        return (...args) => obj[val].apply(obj, args);
    }
    return obj[val];
};
function callWrap(obj, name, context, args) {
    if (!obj) {
        throw new Error('Unable to call `' + name + '`, which is undefined or falsey');
    }
    else if (typeof obj !== 'function') {
        throw new Error('Unable to call `' + name + '`, which is not a function');
    }
    return obj.apply(context, args);
}
exports.callWrap = callWrap;
function contextOrFrameLookup(context, frame, name) {
    const val = frame.lookup(name);
    return (val !== undefined) ?
        val :
        context.lookup(name);
}
exports.contextOrFrameLookup = contextOrFrameLookup;
function handleError(error, lineno, colno) {
    if (error.lineno) {
        return error;
    }
    else {
        return new templateError_2.TemplateError(error, lineno, colno);
    }
}
exports.handleError = handleError;
function asyncEach(arr, dimen, iter, cb) {
    if (lib_2.isArray(arr)) {
        const len = arr.length;
        lib_2.asyncIter(arr, function iterCallback(item, i, next) {
            switch (dimen) {
                case 1:
                    iter(item, i, len, next);
                    break;
                case 2:
                    iter(item[0], item[1], i, len, next);
                    break;
                case 3:
                    iter(item[0], item[1], item[2], i, len, next);
                    break;
                default:
                    item.push(i, len, next);
                    iter.apply(this, item);
            }
        }, cb);
    }
    else {
        lib_2.asyncFor(arr, function iterCallback(key, val, i, len, next) {
            iter(key, val, i, len, next);
        }, cb);
    }
}
exports.asyncEach = asyncEach;
function asyncAll(arr, dimen, func, cb) {
    let finished = 0;
    let len;
    let outputArr;
    function done(i, output) {
        finished++;
        outputArr[i] = output;
        if (finished === len) {
            cb(null, outputArr.join(''));
        }
    }
    if (lib_2.isArray(arr)) {
        len = arr.length;
        outputArr = new Array(len);
        if (len === 0) {
            cb(null, '');
        }
        else {
            for (let i = 0; i < arr.length; i++) {
                const item = arr[i];
                switch (dimen) {
                    case 1:
                        func(item, i, len, done);
                        break;
                    case 2:
                        func(item[0], item[1], i, len, done);
                        break;
                    case 3:
                        func(item[0], item[1], item[2], i, len, done);
                        break;
                    default:
                        item.push(i, len, done);
                        func.apply(this, item);
                }
            }
        }
    }
    else {
        const keys = lib_2.keys(arr || {});
        len = keys.length;
        outputArr = new Array(len);
        if (len === 0) {
            cb(null, '');
        }
        else {
            for (let i = 0; i < keys.length; i++) {
                const k = keys[i];
                func(k, arr[k], i, len, done);
            }
        }
    }
}
exports.asyncAll = asyncAll;
function fromIterator(arr) {
    if (typeof arr !== 'object' || arr === null || lib_2.isArray(arr)) {
        return arr;
    }
    else if (supportsIterators && nunjucksSymbol_2.NunjucksSymbol['iterator'] in arr) {
        return Array.from(arr);
    }
    else {
        return arr;
    }
}
exports.fromIterator = fromIterator;
//# sourceMappingURL=runtime.js.map