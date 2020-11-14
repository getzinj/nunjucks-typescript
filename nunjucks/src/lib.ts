'use strict';

import { TemplateError } from './templateError';

const ArrayProto = Array.prototype;
const ObjProto = Object.prototype;

const escapeMap: Record<string, string> = {
  '&': '&amp;',
  '"': '&quot;',
  '\'': '&#39;',
  '<': '&lt;',
  '>': '&gt;'
};

export const escapeRegex: RegExp = /[&"'<>]/g;


export function hasOwnProp(obj, k): boolean {
  return ObjProto.hasOwnProperty.call(obj, k);
}


export function lookupEscape(ch): string | undefined {
  return escapeMap[ch];
}


export function _prettifyError(path, withInternals, err): TemplateError {
  if (!err.Update) {
    // not one of ours, cast it
    err = new TemplateError(err);
  }
  err.Update(path);

  // Unless they marked the dev flag, show them a trace from here
  if (!withInternals) {
    const old = err;
    err = new Error(old.message);
    err.name = old.name;
  }

  return err;
}



// if (Object.setPrototypeOf) {
//   Object.setPrototypeOf(TemplateError.prototype, Error.prototype);
// } else {
//   TemplateError.prototype = Object.create(Error.prototype, {
//     constructor: {
//       value: TemplateError,
//     },
//   });
// }

export function escape(val: string): string {
  return val.replace(escapeRegex, lookupEscape);
}


export function isFunction(obj): obj is Function {
  return ObjProto.toString.call(obj) === '[object Function]';
}

export type ArrayLike<T> = T[] | Record<number, T>;

export function isArray<T>(obj): obj is Array<T> {
  return ObjProto.toString.call(obj) === '[object Array]';
}


export function isString(obj): obj is string {
  return ObjProto.toString.call(obj) === '[object String]';
}


export function isObject(obj): boolean {
  return ObjProto.toString.call(obj) === '[object Object]';
}

/**
 * @private
 */
function _prepareAttributeParts(attr: string | number): (string | number)[] {
  if (!attr) {
    return [];
  }

  if (typeof attr === 'string') {
    return attr.split('.');
  }

  return [ attr ];
}


/**
 * @param   attribute      Attribute value. Dots allowed.
 */
export function getAttrGetter(attribute: string): (obj: Record<string | number, any>) => any {
  const parts: (string | number)[] = _prepareAttributeParts(attribute);

  return function attrGetter(item: Record<string | number, any>): Record<string | number, any> | undefined {
    let _item: Record<string | number, any> = item;

    for (let i = 0; i < parts.length; i++) {
      const part: string | number = parts[i];

      // If item is not an object, and we still got parts to handle, it means
      // that something goes wrong. Just roll out to undefined in that case.
      if (hasOwnProp(_item, part)) {
        _item = _item[part];
      } else {
        return undefined;
      }
    }

    return _item;
  };
}


export function groupBy<A>(obj: A[], val, throwOnUndefined: boolean) {
  const result = { };
  const iterator = isFunction(val) ? val : getAttrGetter(val);
  for (let i = 0; i < obj.length; i++) {
    const value = obj[i];
    const key = iterator(value, i);
    if (key === undefined && throwOnUndefined === true) {
      throw new TypeError(`groupby: attribute "${ val }" resolved to undefined`);
    }
    (result[key] || (result[key] = [])).push(value);
  }
  return result;
}


export function toArray<T>(obj: T[]): T[] {
  return Array.prototype.slice.call(obj);
}


export function without<T>(array: T[], ...elements: any[]): T[] {
  const result: T[] = [];
  if (array) {
    const length: number = array.length;
    const contains: any[] = elements;
    let index: number = -1;

    while (++index < length) {
      if (indexOf(contains, array[index]) === -1) {
        result.push(array[index]);
      }
    }
    return result;
  } else {
    return result;
  }
}


export function repeat(char_: string, n: number): string {
  let str: string = '';
  for (let i = 0; i < n; i++) {
    str += char_;
  }
  return str;
}


export function each(obj, func: Function, context): void {
  if (obj == null) {
    return;
  }

  if (ArrayProto.forEach && obj.forEach === ArrayProto.forEach) {
    obj.forEach(func, context);
  } else if (obj.length === +obj.length) {
    for (let i = 0, l = obj.length; i < l; i++) {
      func.call(context, obj[i], i, obj);
    }
  }
}


export function map<T, V>(obj: T[], func: (src: T, index?: number, arr?: T[], thisArg?: any) => V): V[] {
  return (obj ?? [ ]).map(func);
  // const results: V[] = [];
  // if (obj == null) {
  //   return results;
  // }
  //
  // if (ArrayProto.map && map === ArrayProto.map) {
  //   return obj.map(func);
  // }
  //
  // for (let i = 0; i < obj.length; i++) {
  //   results[results.length] = func(obj[i], i);
  // }
  //
  // if (obj.length === +obj.length) {
  //   results.length = obj.length;
  // }
  //
  // return results;
}


export function asyncIter<T>(arr: T[],
                             iter: (val: T,
                                    index: number,
                                    nextFn: any,
                                    cb: (err?, info?) => void) => void,
                             cb: (err?, info?) => void): void {
  let i: number = -1;

  function next(): void {
    i++;

    if (i < arr.length) {
      iter(arr[i], i, next, cb);
    } else {
      cb();
    }
  }

  next();
}


export function asyncFor(obj, iter, cb: (err?, info?) => void): void {
  const keys = keys_(obj ?? { });
  const len: number = keys.length;
  let i: number = -1;

  function next(): void {
    i++;
    const k = keys[i];

    if (i < len) {
      iter(k, obj[k], i, len, next);
    } else {
      cb();
    }
  }

  next();
}


export function indexOf<T>(arr: T[], searchElement: T, fromIndex?: number): number {
  return (arr ?? [ ]).indexOf(searchElement, fromIndex);
  //  return Array.prototype.indexOf.call(arr || [], searchElement, fromIndex);
}


function keys_<T, K extends keyof T>(obj: T): K[] {
  /* eslint-disable no-restricted-syntax */
  const arr: K[] = [];
  for (let k in obj) {
    if (hasOwnProp(obj, k)) {
      arr.push(k as unknown as K);
    }
  }
  return arr;
}

export { keys_ as keys }


export function _entries<T, K extends keyof T, V extends T[K]>(obj: T): [K, V][] {
  return keys_(obj).map((k: K): [ K, any ] => [ k, obj[k] ]);
}


export function _values(obj): any[] {
  return keys_(obj).map((k: string | number): any => obj[k]);
}


export function extend(obj1, obj2) {
  obj1 = obj1 ?? { };
  keys_(obj2).forEach(k => {
    obj1[k] = obj2[k];
  });
  return obj1;
}


export const _assign = exports.extend = extend;


export function inOperator(key, val): boolean {
  if (isArray(val) || isString(val)) {
    return val.indexOf(key) !== -1;
  } else if (isObject(val)) {
    return key in val;
  }
  throw new Error(`Cannot use "in" operator to search for "${ key }" in unexpected types.`);
}
