'use strict';

import { SafeString } from './SafeString';


/**
 * Returns `true` if the object is a function, otherwise `false`.
 */
export function callable(value: any): boolean {
  return typeof value === 'function';
}


/**
 * Returns `true` if the object is strictly not `undefined`.
 */
export function defined(value: any): boolean {
  return value !== undefined;
}


/**
 * Returns `true` if the operand (one) is divisible by the test's argument
 * (two).
 */
export function divisibleby(one: number, two: number): boolean {
  return (one % two) === 0;
}


/**
 * Returns true if the string has been escaped (i.e., is a SafeString).
 */
export function escaped(value: any): boolean {
  return value instanceof SafeString;
}


/**
 * Returns `true` if the arguments are strictly equal.
 */
export function equalto(one: any, two: any) {
  return one === two;
}


// Aliases
export const eq: (one: any, two: any) => boolean = equalto;
export const sameas: (one: any, two: any) => boolean = equalto;

/**
 * Returns `true` if the value is evenly divisible by 2.
 */
export function even(value: number): boolean {
  return value % 2 === 0;
}


/**
 * Returns `true` if the value is falsy - if I recall correctly, '', 0, false,
 * undefined, NaN or null. I don't know if we should stick to the default JS
 * behavior or attempt to replicate what Python believes should be falsy (i.e.,
 * empty arrays, empty dicts, not 0...).
 */
export function falsy(value: any): boolean {
  return !value;
}


/**
 * Returns `true` if the operand (one) is greater or equal to the test's
 * argument (two).
 */
export function ge(one: number, two: number): boolean {
  return one >= two;
}


/**
 * Returns `true` if the operand (one) is greater than the test's argument
 * (two).
 */
export function greaterthan(one: number, two: number): boolean {
  return one > two;
}


// alias
export const gt: (one: number, two: number) => boolean = greaterthan;

/**
 * Returns `true` if the operand (one) is less than or equal to the test's
 * argument (two).
 */
export function le(one: number, two: number): boolean {
  return one <= two;
}


/**
 * Returns `true` if the operand (one) is less than the test's passed argument
 * (two).
 */
export function lessthan(one: number, two: number): boolean {
  return one < two;
}


// alias
export const lt: (one: number, two: number) => boolean = lessthan;

/**
 * Returns `true` if the string is lowercased.
 */
export function lower(value: string): boolean {
  return value.toLowerCase() === value;
}


/**
 * Returns `true` if the operand (one) is less than or equal to the test's
 * argument (two).
 */
export function ne(one: number, two: number): boolean {
  return one !== two;
}

/**
 * Returns true if the value is strictly equal to `null`.
 */
export function nullTest(value: any): boolean {
  return value === null;
}


/**
 * Returns true if value is a number.
 */
export function number(value: any): boolean {
  return typeof value === 'number';
}

/**
 * Returns `true` if the value is *not* evenly divisible by 2.
 */
export function odd(value: number): boolean {
  return value % 2 === 1;
}


/**
 * Returns `true` if the value is a string, `false` if not.
 */
export function string(value: any): boolean {
  return typeof value === 'string';
}


/**
 * Returns `true` if the value is not in the list of things considered falsy:
 * '', null, undefined, 0, NaN and false.
 */
export function truthy(value: any): boolean {
  return !!value;
}


/**
 * Returns `true` if the value is undefined.
 */
export function undefinedTest(value: any): boolean {
  return value === undefined;
}

export function undefined(value: any): boolean {
  return value === undefined;
}


/**
 * Returns `true` if the string is uppercased.
 */
export function upper(value: string): boolean {
  return value.toUpperCase() === value;
}


/**
 * If ES6 features are available, returns `true` if the value implements the
 * `Symbol.iterator` method. If not, it's a string or Array.
 *
 * Could potentially cause issues if a browser exists that has Set and Map but
 * not Symbol.
 */
export function iterable(value: any): boolean {
  if (typeof Symbol !== 'undefined') {
    return !!value[Symbol.iterator];
  } else {
    return Array.isArray(value) || typeof value === 'string';
  }
}


/**
 * If ES6 features are available, returns `true` if the value is an object hash
 * or an ES6 Map. Otherwise just return if it's an object hash.
 */
export function mapping(value: any): boolean {
  // only maps and object hashes
  const bool = value !== null
      && value !== undefined
      && typeof value === 'object'
      && !Array.isArray(value);
  if (Set) {
    return bool && !(value instanceof Set);
  } else {
    return bool;
  }
}


module.exports = {
  ... module.exports,
  'null': nullTest
};
