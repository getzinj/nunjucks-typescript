'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.inOperator = exports._assign = exports.extend = exports._values = exports._entries = exports.keys = exports.indexOf = exports.asyncFor = exports.asyncIter = exports.map = exports.each = exports.repeat = exports.without = exports.toArray = exports.groupBy = exports.getAttrGetter = exports._prepareAttributeParts = exports.isObject = exports.isString = exports.isArray = exports.isFunction = exports.escape = exports._prettifyError = exports.lookupEscape = exports.hasOwnProp = void 0;
const templateError_1 = require("./templateError");
const ArrayProto = Array.prototype;
const ObjProto = Object.prototype;
const escapeMap = {
    '&': '&amp;',
    '"': '&quot;',
    '\'': '&#39;',
    '<': '&lt;',
    '>': '&gt;'
};
const escapeRegex = /[&"'<>]/g;
function hasOwnProp(obj, k) {
    return ObjProto.hasOwnProperty.call(obj, k);
}
exports.hasOwnProp = hasOwnProp;
function lookupEscape(ch) {
    return escapeMap[ch];
}
exports.lookupEscape = lookupEscape;
function _prettifyError(path, withInternals, err) {
    if (!err.Update) {
        // not one of ours, cast it
        err = new templateError_1.TemplateError(err);
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
exports._prettifyError = _prettifyError;
// if (Object.setPrototypeOf) {
//   Object.setPrototypeOf(TemplateError.prototype, Error.prototype);
// } else {
//   TemplateError.prototype = Object.create(Error.prototype, {
//     constructor: {
//       value: TemplateError,
//     },
//   });
// }
function escape(val) {
    return val.replace(escapeRegex, lookupEscape);
}
exports.escape = escape;
function isFunction(obj) {
    return ObjProto.toString.call(obj) === '[object Function]';
}
exports.isFunction = isFunction;
function isArray(obj) {
    return ObjProto.toString.call(obj) === '[object Array]';
}
exports.isArray = isArray;
function isString(obj) {
    return ObjProto.toString.call(obj) === '[object String]';
}
exports.isString = isString;
function isObject(obj) {
    return ObjProto.toString.call(obj) === '[object Object]';
}
exports.isObject = isObject;
/**
 * @param {string|number} attr
 * @returns {(string|number)[]}
 * @private
 */
function _prepareAttributeParts(attr) {
    if (!attr) {
        return [];
    }
    if (typeof attr === 'string') {
        return attr.split('.');
    }
    return [attr];
}
exports._prepareAttributeParts = _prepareAttributeParts;
/**
 * @param {string}   attribute      Attribute value. Dots allowed.
 * @returns {function(Object): *}
 */
function getAttrGetter(attribute) {
    const parts = _prepareAttributeParts(attribute);
    return function attrGetter(item) {
        let _item = item;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            // If item is not an object, and we still got parts to handle, it means
            // that something goes wrong. Just roll out to undefined in that case.
            if (hasOwnProp(_item, part)) {
                _item = _item[part];
            }
            else {
                return undefined;
            }
        }
        return _item;
    };
}
exports.getAttrGetter = getAttrGetter;
function groupBy(obj, val, throwOnUndefined) {
    const result = {};
    const iterator = isFunction(val) ? val : getAttrGetter(val);
    for (let i = 0; i < obj.length; i++) {
        const value = obj[i];
        const key = iterator(value, i);
        if (key === undefined && throwOnUndefined === true) {
            throw new TypeError(`groupby: attribute "${val}" resolved to undefined`);
        }
        (result[key] || (result[key] = [])).push(value);
    }
    return result;
}
exports.groupBy = groupBy;
function toArray(obj) {
    return Array.prototype.slice.call(obj);
}
exports.toArray = toArray;
function without(array, unused) {
    const result = [];
    if (!array) {
        return result;
    }
    const length = array.length;
    const contains = toArray(arguments).slice(1);
    let index = -1;
    while (++index < length) {
        if (indexOf(contains, array[index]) === -1) {
            result.push(array[index]);
        }
    }
    return result;
}
exports.without = without;
function repeat(char_, n) {
    let str = '';
    for (let i = 0; i < n; i++) {
        str += char_;
    }
    return str;
}
exports.repeat = repeat;
function each(obj, func, context) {
    if (obj == null) {
        return;
    }
    if (ArrayProto.forEach && obj.forEach === ArrayProto.forEach) {
        obj.forEach(func, context);
    }
    else if (obj.length === +obj.length) {
        for (let i = 0, l = obj.length; i < l; i++) {
            func.call(context, obj[i], i, obj);
        }
    }
}
exports.each = each;
function map(obj, func) {
    const results = [];
    if (obj == null) {
        return results;
    }
    if (ArrayProto.map && map === ArrayProto.map) {
        return obj.map(func);
    }
    for (let i = 0; i < obj.length; i++) {
        results[results.length] = func(obj[i], i);
    }
    if (obj.length === +obj.length) {
        results.length = obj.length;
    }
    return results;
}
exports.map = map;
function asyncIter(arr, iter, cb) {
    let i = -1;
    function next() {
        i++;
        if (i < arr.length) {
            iter(arr[i], i, next, cb);
        }
        else {
            cb();
        }
    }
    next();
}
exports.asyncIter = asyncIter;
function asyncFor(obj, iter, cb) {
    const keys = keys_(obj || {});
    const len = keys.length;
    let i = -1;
    function next() {
        i++;
        const k = keys[i];
        if (i < len) {
            iter(k, obj[k], i, len, next);
        }
        else {
            cb();
        }
    }
    next();
}
exports.asyncFor = asyncFor;
function indexOf(arr, searchElement, fromIndex) {
    return Array.prototype.indexOf.call(arr || [], searchElement, fromIndex);
}
exports.indexOf = indexOf;
function keys_(obj) {
    /* eslint-disable no-restricted-syntax */
    const arr = [];
    for (let k in obj) {
        if (hasOwnProp(obj, k)) {
            arr.push(k);
        }
    }
    return arr;
}
exports.keys = keys_;
function _entries(obj) {
    return keys_(obj).map((k) => [k, obj[k]]);
}
exports._entries = _entries;
function _values(obj) {
    return keys_(obj).map((k) => obj[k]);
}
exports._values = _values;
function extend(obj1, obj2) {
    obj1 = obj1 || {};
    keys_(obj2).forEach(k => {
        obj1[k] = obj2[k];
    });
    return obj1;
}
exports.extend = extend;
exports._assign = exports.extend = extend;
function inOperator(key, val) {
    if (isArray(val) || isString(val)) {
        return val.indexOf(key) !== -1;
    }
    else if (isObject(val)) {
        return key in val;
    }
    throw new Error('Cannot use "in" operator to search for "'
        + key + '" in unexpected types.');
}
exports.inOperator = inOperator;
//# sourceMappingURL=lib.js.map