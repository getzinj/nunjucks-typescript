'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapping = exports.iterable = exports.upper = exports.undefined = exports.undefinedTest = exports.truthy = exports.string = exports.odd = exports.number = exports.nullTest = exports.ne = exports.lower = exports.lt = exports.lessthan = exports.le = exports.gt = exports.greaterthan = exports.ge = exports.falsy = exports.even = exports.sameas = exports.eq = exports.equalto = exports.escaped = exports.divisibleby = exports.defined = exports.callable = void 0;
const SafeString_1 = require("./SafeString");
/**
 * Returns `true` if the object is a function, otherwise `false`.
 */
function callable(value) {
    return typeof value === 'function';
}
exports.callable = callable;
/**
 * Returns `true` if the object is strictly not `undefined`.
 */
function defined(value) {
    return value !== undefined;
}
exports.defined = defined;
/**
 * Returns `true` if the operand (one) is divisible by the test's argument
 * (two).
 */
function divisibleby(one, two) {
    return (one % two) === 0;
}
exports.divisibleby = divisibleby;
/**
 * Returns true if the string has been escaped (i.e., is a SafeString).
 */
function escaped(value) {
    return value instanceof SafeString_1.SafeString;
}
exports.escaped = escaped;
/**
 * Returns `true` if the arguments are strictly equal.
 */
function equalto(one, two) {
    return one === two;
}
exports.equalto = equalto;
// Aliases
exports.eq = equalto;
exports.sameas = equalto;
/**
 * Returns `true` if the value is evenly divisible by 2.
 */
function even(value) {
    return value % 2 === 0;
}
exports.even = even;
/**
 * Returns `true` if the value is falsy - if I recall correctly, '', 0, false,
 * undefined, NaN or null. I don't know if we should stick to the default JS
 * behavior or attempt to replicate what Python believes should be falsy (i.e.,
 * empty arrays, empty dicts, not 0...).
 */
function falsy(value) {
    return !value;
}
exports.falsy = falsy;
/**
 * Returns `true` if the operand (one) is greater or equal to the test's
 * argument (two).
 */
function ge(one, two) {
    return one >= two;
}
exports.ge = ge;
/**
 * Returns `true` if the operand (one) is greater than the test's argument
 * (two).
 */
function greaterthan(one, two) {
    return one > two;
}
exports.greaterthan = greaterthan;
// alias
exports.gt = greaterthan;
/**
 * Returns `true` if the operand (one) is less than or equal to the test's
 * argument (two).
 */
function le(one, two) {
    return one <= two;
}
exports.le = le;
/**
 * Returns `true` if the operand (one) is less than the test's passed argument
 * (two).
 */
function lessthan(one, two) {
    return one < two;
}
exports.lessthan = lessthan;
// alias
exports.lt = lessthan;
/**
 * Returns `true` if the string is lowercased.
 */
function lower(value) {
    return value.toLowerCase() === value;
}
exports.lower = lower;
/**
 * Returns `true` if the operand (one) is less than or equal to the test's
 * argument (two).
 */
function ne(one, two) {
    return one !== two;
}
exports.ne = ne;
/**
 * Returns true if the value is strictly equal to `null`.
 */
function nullTest(value) {
    return value === null;
}
exports.nullTest = nullTest;
/**
 * Returns true if value is a number.
 */
function number(value) {
    return typeof value === 'number';
}
exports.number = number;
/**
 * Returns `true` if the value is *not* evenly divisible by 2.
 */
function odd(value) {
    return value % 2 === 1;
}
exports.odd = odd;
/**
 * Returns `true` if the value is a string, `false` if not.
 */
function string(value) {
    return typeof value === 'string';
}
exports.string = string;
/**
 * Returns `true` if the value is not in the list of things considered falsy:
 * '', null, undefined, 0, NaN and false.
 */
function truthy(value) {
    return !!value;
}
exports.truthy = truthy;
/**
 * Returns `true` if the value is undefined.
 */
function undefinedTest(value) {
    return value === undefined;
}
exports.undefinedTest = undefinedTest;
function undefined(value) {
    return value === undefined;
}
exports.undefined = undefined;
/**
 * Returns `true` if the string is uppercased.
 */
function upper(value) {
    return value.toUpperCase() === value;
}
exports.upper = upper;
/**
 * If ES6 features are available, returns `true` if the value implements the
 * `Symbol.iterator` method. If not, it's a string or Array.
 *
 * Could potentially cause issues if a browser exists that has Set and Map but
 * not Symbol.
 */
function iterable(value) {
    if (typeof Symbol !== 'undefined') {
        return !!value[Symbol.iterator];
    }
    else {
        return Array.isArray(value) || typeof value === 'string';
    }
}
exports.iterable = iterable;
/**
 * If ES6 features are available, returns `true` if the value is an object hash
 * or an ES6 Map. Otherwise just return if it's an object hash.
 */
function mapping(value) {
    // only maps and object hashes
    const bool = value !== null
        && value !== undefined
        && typeof value === 'object'
        && !Array.isArray(value);
    if (Set) {
        return bool && !(value instanceof Set);
    }
    else {
        return bool;
    }
}
exports.mapping = mapping;
module.exports = Object.assign(Object.assign({}, module.exports), { 'null': nullTest });
//# sourceMappingURL=tests.js.map