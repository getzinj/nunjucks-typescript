'use strict';


import { escape } from './lib';
import { Frame } from './frame';

export { Frame } from './frame';

export { SafeString} from './SafeString';
import { SafeString } from './SafeString';
export { asyncFor, isArray, asyncIter, keys as keys_, inOperator, keys } from './lib';
import { asyncFor, isArray, asyncIter, keys as keys_, inOperator, keys } from './lib';
export { TemplateError } from './templateError';
import { TemplateError } from './templateError';
export { NunjucksSymbol } from './nodes/nunjucksSymbol';
import { NunjucksSymbol } from './nodes/nunjucksSymbol';
import { Context } from './environment';


const supportsIterators: boolean = (
    typeof NunjucksSymbol === 'function' && NunjucksSymbol['iterator'] && typeof Array.from === 'function'
);


export function makeMacro(argNames: string[], kwargNames, func): (...macroArgs) => any {
  return function macro(...macroArgs) {
    const argCount: number = numArgs(macroArgs);
    let args;
    const kwargs = getKeywordArgs(macroArgs);

    if (argCount > argNames.length) {
      args = macroArgs.slice(0, argNames.length);

      // Positional arguments that should be passed in as
      // keyword arguments (essentially default values)
      macroArgs.slice(args.length, argCount).forEach((val, i: number): void => {
        if (i < kwargNames.length) {
          kwargs[kwargNames[i]] = val;
        }
      });
      args.push(kwargs);
    } else if (argCount < argNames.length) {
      args = macroArgs.slice(0, argCount);

      for (let i = argCount; i < argNames.length; i++) {
        const arg: string = argNames[i];

        // Keyword arguments that should be passed as
        // positional arguments, i.e. the caller explicitly
        // used the name of a positional arg
        args.push(kwargs[arg]);
        delete kwargs[arg];
      }
      args.push(kwargs);
    } else {
      args = macroArgs;
    }

    return func.apply(this, args);
  };
}

export function makeKeywordArgs(obj) {
  obj.__keywords = true;
  return obj;
}


export function isKeywordArgs(obj): boolean {
  return obj && Object.prototype.hasOwnProperty.call(obj, '__keywords');
}


export function getKeywordArgs(args) {
  const len = args.length;
  if (len) {
    const lastArg = args[len - 1];
    if (isKeywordArgs(lastArg)) {
      return lastArg;
    }
  }
  return {};
}


export function numArgs(args): number {
  const len = args.length;
  if (len === 0) {
    return 0;
  }

  const lastArg = args[len - 1];
  if (isKeywordArgs(lastArg)) {
    return len - 1;
  } else {
    return len;
  }
}


export function copySafeness(dest, target) {
  if (dest instanceof SafeString) {
    return new SafeString(target);
  }
  return target.toString();
}

export function markSafe(val) {
  const type: "undefined" | "object" | "boolean" | "number" | "string" | "function" | "symbol" | "bigint" = typeof val;

  if (type === 'string') {
    return new SafeString(val);
  } else if (type !== 'function') {
    return val;
  } else {
    return function wrapSafe(args) {
      const ret = val.apply(this, arguments);

      if (typeof ret === 'string') {
        return new SafeString(ret);
      }

      return ret;
    };
  }
}

export function suppressValue(val, autoescape) {
  val = (val !== undefined && val !== null) ? val : '';

  if (autoescape && !(val instanceof SafeString)) {
    val = escape(val.toString());
  }

  return val;
}

export function ensureDefined(val, lineno, colno) {
  if (val === null || val === undefined) {
    throw new TemplateError(
      'attempted to output null or undefined value',
      lineno + 1,
      colno + 1
    );
  }
  return val;
}


export let memberLookup: (obj, val, autoescape?) => any  = function memberLookup(obj, val) {
  if (obj === undefined || obj === null) {
    return undefined;
  }

  if (typeof obj[val] === 'function') {
    return (...args) => obj[val].apply(obj, args);
  }

  return obj[val];
}


export function callWrap(obj, name, context, args) {
  if (!obj) {
    throw new Error('Unable to call `' + name + '`, which is undefined or falsey');
  } else if (typeof obj !== 'function') {
    throw new Error('Unable to call `' + name + '`, which is not a function');
  }

  return obj.apply(context, args);
}

export function contextOrFrameLookup(context: Context, frame: Frame, name: string) {
  const val = frame.lookup(name);
  return (val === undefined)
      ? context.lookup(name)
      : val
  ;
}

export function handleError(error, lineno, colno) {
  if (error.lineno) {
    return error;
  } else {
    return new TemplateError(error, lineno, colno);
  }
}

export function asyncEach(arr, dimen, iter, cb): void {
  if (isArray(arr)) {
    const len = arr.length;

    asyncIter(arr, function iterCallback(item, i, next): void {
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
  } else {
    asyncFor(arr, function iterCallback(key, val, i, len, next): void {
      iter(key, val, i, len, next);
    }, cb);
  }
}

export function asyncAll(arr, dimen, func, cb): void {
  let finished: number = 0;
  let len;
  let outputArr;

  function done(i, output): void {
    finished++;
    outputArr[i] = output;

    if (finished === len) {
      cb(null, outputArr.join(''));
    }
  }

  if (isArray(arr)) {
    len = arr.length;
    outputArr = new Array(len);

    if (len === 0) {
      cb(null, '');
    } else {
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
  } else {
    const keys = keys_(arr || {});
    len = keys.length;
    outputArr = new Array(len);

    if (len === 0) {
      cb(null, '');
    } else {
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        func(k, arr[k], i, len, done);
      }
    }
  }
}


export function fromIterator(arr) {
  if (typeof arr !== 'object' || arr === null || isArray(arr)) {
    return arr;
  } else if (supportsIterators && NunjucksSymbol['iterator'] in arr) {
    return Array.from(arr);
  } else {
    return arr;
  }
}
