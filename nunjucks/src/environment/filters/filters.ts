declare var exports;


'use strict';

import * as he from 'he';
import * as lib from '../../lib';
import { isArray, _entries } from '../../lib';
import * as r from '../../runtime/runtime';
import { SafeString } from '../../runtime/SafeString';
import { TemplateError, TemplateError as TemplateError1 } from '../../templateError';
import { IKeyValuePair } from '../../interfaces/IKeyValuePair';


export function normalize<T, V>(value: T | null | undefined | false, defaultValue: V): T | V {
  if (value === null || value === undefined || value === false) {
    return defaultValue;
  }
  return value;
}


export const abs: (x: number) => number = Math.abs;


export function isNaN(num: number): boolean {
  return num !== num; // eslint-disable-line no-self-compare
}


export function batch<T>(arr: T[], linecount: number, fillWith: T): T[][] {
  let i: number;
  const res: T[][] = [];
  let tmp: T[] = [];

  for (i = 0; i < arr.length; i++) {
    if (i % linecount === 0 && tmp.length) {
      res.push(tmp);
      tmp = [];
    }

    tmp.push(arr[i]);
  }

  if (tmp.length) {
    if (fillWith) {
      for (i = tmp.length; i < linecount; i++) {
        tmp.push(fillWith);
      }
    }

    res.push(tmp);
  }

  return res;
}


export function capitalize(str: string | SafeString): string | SafeString {
  str = normalize(str, '');
  const ret: string = str.toLowerCase();
  return r.copySafeness(str, ret.charAt(0).toUpperCase() + ret.slice(1));
}


export function center(str: string | SafeString, width?: number): string | SafeString {
  str = normalize(str, '');
  width = width || 80;

  if (str.length >= width) {
    return str;
  }

  const spaces: number = width - str.length;
  const pre: string = lib.repeat(' ', (spaces / 2) - (spaces % 2));
  const post: string = lib.repeat(' ', spaces / 2);
  return r.copySafeness(str, pre + str + post);
}


export function default_<T>(val: T, def: T, bool?: boolean): T {
  if (bool) {
    return val || def;
  } else {
    return (val !== undefined) ? val : def;
  }
}


function getTupleSortIndex(by: 'key' | 'value' | undefined | null): 0 | 1 {
  if (by === undefined || by === 'key') {
    return 0;
  } else if (by === 'value') {
    return 1;
  } else {
    throw TemplateError('dictsort filter: You can only sort by either key or value');
  }
}


function sortTuples<K, V>(tuples: [K, V][], sortBy: 'key' | 'value', caseSensitive: boolean): void {
  const sortIndex: 0 | 1 = getTupleSortIndex(sortBy);
  tuples.sort(<T, V1 extends T[keyof T]>(t1: T, t2: T): number => {
    let a: V1 = t1[sortIndex];
    let b: V1 = t2[sortIndex];

    if (!caseSensitive) {
      if (lib.isString(a)) {
        a = a.toUpperCase() as any;
      }
      if (lib.isString(b)) {
        b = b.toUpperCase() as any;
      }
    }

    return (a > b) ? 1 : (a === b ? 0 : -1); // eslint-disable-line no-nested-ternary
  });
}


function dictToTuples<O, K extends keyof O, V extends O[K]>(val: O): [ K, V ][] {
  const tuples: [ K, V ][] = [ ];
  // deliberately include properties from the object's prototype
  for (const k in val) { // eslint-disable-line guard-for-in, no-restricted-syntax
    tuples.push([ k as unknown as K, val[k] as unknown as V ]);
  }
  return tuples;
}


export function dictsort<O, K extends keyof O, V extends O[K]>(val: O,
                                                               caseSensitive: boolean = false,
                                                               by: 'key' | 'value' = 'key'): [K, V][] {
  if (!lib.isObject(val)) {
    throw TemplateError1('dictsort filter: val must be an object');
  }

  const tuples: [ K, V ][] = dictToTuples(val);
  sortTuples(tuples, by, caseSensitive);

  return tuples;
}


export function dump(obj, spaces): string {
  return JSON.stringify(obj, null, spaces);
}


export function escape(str): SafeString {
  if (str instanceof SafeString) {
    return str;
  }
  str = (str === null || str === undefined) ? '' : str;
  return r.markSafe(lib.escape(str.toString()));
}


export function safe(str): SafeString {
  if (str instanceof SafeString) {
    return str;
  }
  str = (str === null || str === undefined) ? '' : str;
  return r.markSafe(str.toString());
}


export function first<T>(arr: T[]): T {
  return arr[0];
}


export function forceescape(str: string | SafeString): SafeString {
  str = (str === null || str === undefined) ? '' : str;
  return r.markSafe(lib.escape(str.toString()));
}


export function groupby(arr, attr) {
  return lib.groupBy(arr, attr, this.env.opts.throwOnUndefined);
}


export function indent(str, width: number = 4, indentfirst?: boolean): string | SafeString {
  str = normalize(str, '');

  if (str === '') {
    return '';
  }

  // let res = '';
  const lines: string[] = str.split('\n');
  const sp: string = lib.repeat(' ', width);

  const res: string = lines
      .map( (l: string, i: number): string => ((i === 0) && !indentfirst) ? l : `${sp}${l}` )
      .join('\n');

  return r.copySafeness(str, res);
}


export function join(arr, del: string = '', attr?: string | number | symbol) {
  if (attr) {
    arr = lib.map(arr, (v) => v[attr]);
  }

  return arr.join(del);
}


export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}


export function length<T>(val: T): number {
  const value: any = normalize(val, '');

  if (value === undefined) {
    return 0;
  } else if (
      (typeof Map === 'function' && value instanceof Map) ||
      (typeof Set === 'function' && value instanceof Set)
  ) {
    // ECMAScript 2015 Maps and Sets
    return value.size;
  } else if (value instanceof SafeString) {
    return value.length;
  } else if (lib.isObject(value) && !(value instanceof SafeString)) {
    // Objects (besides SafeStrings), non-primitive Arrays
    return lib.keys(value).length;
  } else {
    return value.length;
  }
}


export function list(val: string): string[];
export function list<T>(val: T[]): T[];
export function list<T>(val: Record<string | number | symbol, T>): IKeyValuePair<T>[];
export function list<T>(val: T[] | Record<string | number | symbol, T> | string): T[] | IKeyValuePair<T>[] | string[] {
  if (lib.isString(val)) {
    return val.split('');
  } else if (lib.isObject(val)) {
    const tuples: [string | number | symbol, T][] = lib._entries(val || {});
    return tuples.map<IKeyValuePair<T>>( (tuple: [string | number | symbol, T]): IKeyValuePair<T> => ({
      key: tuple[0],
      value: tuple[1]
    }));
  } else if (lib.isArray(val)) {
    return val;
  } else {
    throw TemplateError1('list filter: type not iterable');
  }
}


export function lower(str): string {
  str = normalize(str, '');
  return str.toLowerCase();
}


export function nl2br(str: string | SafeString): string | SafeString {
  if (str === null || str === undefined) {
    return '';
  }
  return r.copySafeness(str, str.replace(/\r\n|\n/g, '<br />\n'));
}


export function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}


/**
 * Construct select or reject filter
 *
 * @param {boolean} expectedTestResult
 * @returns {function(array, string, *): array}
 */
export function getSelectOrReject<T>(expectedTestResult): (arr: T[], testName: string, secondArg) => T[] {
  function filter(arr: T[], testName: string = 'truthy', secondArg): T[] {
    const context = this;
    const test: Function = context.env.getTest(testName);

    return lib.toArray(arr).filter(function examineTestResult(item: T): boolean {
      return test.call(context, item, secondArg) === expectedTestResult;
    });
  }

  return filter;
}


export const reject: (arr, testName: string, secondArg) => any = getSelectOrReject(false);


export function rejectattr<T, K extends keyof T>(arr: T[], attr: K): T[] {
  return arr.filter((item: T): boolean => !item[attr]);
}


export const select: (arr, testName: string, secondArg) => any = getSelectOrReject(true);


export function selectattr<T, K extends keyof T>(arr: T[], attr: K): T[] {
  return arr.filter((item: T): boolean => !!item[attr]);
}


export function replace(str: string, old: string | RegExp, new_: string, maxCount?: number): string | SafeString {
  const originalStr: string = str;

  if (old instanceof RegExp) {
    return str.replace(old, new_);
  }

  if (typeof maxCount === 'undefined') {
    maxCount = -1;
  }

  let res: string = ''; // Output

  // Cast Numbers in the search term to string
  if (typeof old === 'number') {
    old = '' + old;
  } else if (typeof old !== 'string') {
    // If it is something other than number or string,
    // return the original string
    return str;
  }

  // Cast numbers in the replacement to string
  if (typeof str === 'number') {
    str = '' + str;
  }

  // If by now, we don't have a string, throw it back
  if (typeof str !== 'string' && !(str as any instanceof SafeString)) {
    return str;
  }

  // ShortCircuits
  if (old === '') {
    // Mimic the python behaviour: empty string is replaced
    // by replacement e.g. "abc"|replace("", ".") -> .a.b.c.
    res = new_ + str.split('').join(new_) + new_;
    return r.copySafeness(str, res);
  }

  let nextIndex: number = str.indexOf(old);
  // if # of replacements to perform is 0, or the string to does
  // not contain the old value, return the string
  if (maxCount === 0 || nextIndex === -1) {
    return str;
  }

  let pos: number = 0;
  let count: number = 0; // # of replacements made

  while (nextIndex > -1 && (maxCount === -1 || count < maxCount)) {
    // Grab the next chunk of src string and add it with the
    // replacement, to the result
    res += str.substring(pos, nextIndex) + new_;
    // Increment our pointer in the src string
    pos = nextIndex + old.length;
    count++;
    // See if there are any more replacements to be made
    nextIndex = str.indexOf(old, pos);
  }

  // We've either reached the end, or done the max # of
  // replacements, tack on any remaining string
  if (pos < str.length) {
    res += str.substring(pos);
  }

  return r.copySafeness(originalStr, res);
}


export function reverse(val) {
  let arr;
  if (lib.isString(val)) {
    arr = list(val);
  } else {
    // Copy it
    arr = [ ... val ];
  }

  arr.reverse();

  if (lib.isString(val)) {
    return r.copySafeness(val, arr.join(''));
  }
  return arr;
}


function getRoundFunction(method: 'ceil' | 'floor' | 'round' = 'round'): (num: number) => number {
  switch (method) {
    case 'ceil':
      return Math.ceil;
    case 'floor':
      return Math.floor;
    case 'round':
    default:
      return Math.round;
  }
}


export function round(val: number, precision: number = 0, method: 'ceil' | 'floor' | 'round' = 'round'): number {
  const factor: number = Math.pow(10, precision);

  const rounder: (num: number) => number = getRoundFunction(method);

  return rounder(val * factor) / factor;
}


export function slice<T>(arr: T[], slices: number, fillWith: T): T[][] {
  const sliceLength: number = Math.floor(arr.length / slices);
  const extra: number = arr.length % slices;
  const res: T[][] = [];
  let offset: number = 0;

  for (let i: number = 0; i < slices; i++) {
    const start: number = offset + (i * sliceLength);
    if (i < extra) {
      offset++;
    }
    const end: number = offset + ((i + 1) * sliceLength);

    const currSlice: T[] = arr.slice(start, end);
    if (fillWith && i >= extra) {
      currSlice.push(fillWith);
    }
    res.push(currSlice);
  }

  return res;
}


export function sum(arr, attr, start: number = 0) {
  if (attr) {
    arr = lib.map(arr, (v) => v[attr]);
  }

  return start + arr.reduce((a, b) => a + b, 0);
}


function sortFilter(arr, reversed: boolean, caseSens: boolean, attr: string) {
  // Copy it
  const copiedArray = [ ... arr ];
  const attributeGetter = lib.getAttrGetter(attr);

  copiedArray.sort( <V>(a: V, b: V): number => {
    let x: V = (attr) ? attributeGetter(a) : a;
    let y: V = (attr) ? attributeGetter(b) : b;

    if (
        this.env.opts.throwOnUndefined &&
        attr && (x === undefined || y === undefined)
    ) {
      throw new TypeError(`sort: attribute "${attr}" resolved to undefined`);
    }

    if (!caseSens && lib.isString(x) && lib.isString(y)) {
      // @ts-ignore
      x = x.toLowerCase();
      // @ts-ignore
      y = y.toLowerCase();
    }

    if (x < y) {
      return reversed ? 1 : -1;
    } else if (x > y) {
      return reversed ? -1 : 1;
    } else {
      return 0;
    }
  } );

  return copiedArray;
}


export const sort: (...macroArgs) => any = r.makeMacro([ 'value', 'reverse', 'case_sensitive', 'attribute' ], [], sortFilter);


export function string(obj): string | SafeString {
  return r.copySafeness(obj, obj);
}


export function striptags(input, preserveLinebreaks): string | SafeString {
  input = normalize(input, '');
  const tags: RegExp = /<\/?([a-z][a-z0-9]*)\b[^>]*>|<!--[\s\S]*?-->/gi;
  const trimmedInput: string | SafeString = trim(input.replace(tags, ''));
  let res: string = '';
  if (preserveLinebreaks) {
    res = trimmedInput
      .replace(/^ +| +$/gm, '') // remove leading and trailing spaces
      .replace(/ +/g, ' ') // squash adjacent spaces
      .replace(/(\r\n)/g, '\n') // normalize linebreaks (CRLF -> LF)
      .replace(/\n\n\n+/g, '\n\n'); // squash abnormal adjacent linebreaks
  } else {
    res = trimmedInput.replace(/\s+/gi, ' ');
  }
  return r.copySafeness(input, res);
}


export function title(str: string | SafeString): string | SafeString {
  str = normalize(str, '');
  const words: (string | SafeString)[] = str.split(' ').map(capitalize);
  return r.copySafeness(str, words.join(' '));
}


export function trim(str: string | SafeString): string | SafeString {
  return r.copySafeness(str, str.replace(/^\s*|\s*$/g, ''));
}


export function truncate(input: string | SafeString, toLength: number = 255, killWords?: boolean, end?: number): string | SafeString {
  const orig: string | SafeString = input;
  input = normalize(input, '');

  if (input.length <= toLength) {
    return input;
  }

  if (killWords) {
    input = input.substring(0, toLength);
  } else {
    let idx: number = input.lastIndexOf(' ', toLength);
    if (idx === -1) {
      idx = toLength;
    }

    input = input.substring(0, idx);
  }

  input += (end !== undefined && end !== null) ? end : '...'; // TODO: Maybe use Closure library for this sort of thing?
  return r.copySafeness(orig, input);
}


export function upper(str): string {
  str = normalize(str, '');
  return str.toUpperCase();
}


export function urlencode(obj: string | SimplestTuple[] | SimplestObject): string {
  const enc: (uriComponent: (string | number | boolean)) => string = encodeURIComponent;
  if (lib.isString(obj)) {
    return enc(obj);
  } else {
    const keyVals: SimplestTuple[] = (lib.isArray(obj)) ? obj : lib._entries(obj);
    return keyVals
        .map( ([ k, v ]: [string | number, string | number]): string => `${ enc(k) }=${ enc(v) }` )
        .join('&');
  }
}



type KeyType = string | symbol | number;
type Simple = KeyType | boolean;
type SimpleTuple = [ Simple, Simple ];
type SimplestTuple = [ string | number, string | number | boolean ];
type SimpleObject = Record<KeyType, Simple>;
type SimplestObject = Record<string | number, string | number>;


function isSimple(val): val is Simple {
  return (typeof val === 'string')
      || (typeof val === 'symbol')
      || (typeof val === 'number')
      || (typeof val === 'boolean');
}


function isSimpleTuple(val): val is SimpleTuple {
  return (isArray(val) && val.length === 2 && isSimple(val[0]) && isSimple(val[1]));
}


export function entities(obj: SafeString): SafeString;
export function entities(obj: Simple): SafeString;
export function entities(obj: SimpleObject): SafeString;
export function entities(obj: SimpleTuple): SafeString;
export function entities(obj: (SimpleTuple | SimpleObject)[]): SafeString;
export function entities(obj: Simple | SafeString | SimpleTuple | SimpleObject | (SimpleObject | SimpleTuple)[]): SafeString {
  const encoder: (str: string) => string = (str: string): string => he.encode(str, { useNamedReferences: true });
  const safer: (str: string) => SafeString = (str: string): SafeString => r.markSafe(str);

  if (obj instanceof SafeString) {
    return safer(encoder(obj.val));
  } else if (lib.isString(obj)) {
    return safer(encoder(obj));
  } else if (isSimple(obj)) {
    return safer(String(obj));
  } else if (isSimpleTuple(obj)) {
    return safer(`${ entities(obj[0]).val }=${ entities(obj[1]).val }`);
  } else if (isArray(obj)) {
    const simpleThingArray: (SimpleObject | SimpleTuple)[] = obj;

    return safer(simpleThingArray
        .map((simpleThing: SimpleObject | SimpleTuple): string => isSimpleTuple(simpleThing)
            ? entities(simpleThing).val
            : entities(simpleThing).val)
        .join(','));
  } else if (typeof obj === 'object') {
    return entities(_entries(obj));
  } else {
    return safer(String(obj));
  }
}


// For the jinja regexp, see
// https://github.com/mitsuhiko/jinja2/blob/f15b814dcba6aa12bc74d1f7d0c881d55f7126be/jinja2/utils.py#L20-L23
const puncRe: RegExp = /^(?:\(|<|&lt;)?(.*?)(?:\.|,|\)|\n|&gt;)?$/;
// from http://blog.gerv.net/2011/05/html5_email_address_regexp/
const emailRe: RegExp = /^[\w.!#$%&'*+\-\/=?\^`{|}~]+@[a-z\d\-]+(\.[a-z\d\-]+)+$/i;
const httpHttpsRe: RegExp = /^https?:\/\/.*$/;
const wwwRe: RegExp = /^www\./;
const tldRe: RegExp = /\.(?:org|net|com)(?:\:|\/|$)/;


export function urlize(str, maxLength: number = Infinity, nofollow?: boolean): string {
  if (isNaN(maxLength)) {
    maxLength = Infinity;
  }

  const noFollowAttr: string = (nofollow === true ? ' rel="nofollow"' : '');

  const words: string[] = str.split(/(\s+)/)
      .filter( (word: string): boolean => {
        // If the word has no length, bail. This can happen for str with
        // trailing whitespace.
        return !!(word?.length);
      } )
      .map((word: string): string => {
        const matches: RegExpMatchArray = word.match(puncRe);
        const possibleUrl: string = (matches) ? matches[1] : word;
        const shortUrl: string = possibleUrl.substr(0, maxLength);

        // url that starts with http or https
        if (httpHttpsRe.test(possibleUrl)) {
          return `<a href="${possibleUrl}"${noFollowAttr}>${shortUrl}</a>`;
        }

        // url that starts with www.
        if (wwwRe.test(possibleUrl)) {
          return `<a href="http://${possibleUrl}"${noFollowAttr}>${shortUrl}</a>`;
        }

        // an email address of the form username@domain.tld
        if (emailRe.test(possibleUrl)) {
          return `<a href="mailto:${ possibleUrl }">${ possibleUrl }</a>`;
        }

        // url that ends in .com, .org or .net that is not an email address
        if (tldRe.test(possibleUrl)) {
          return `<a href="http://${ possibleUrl }"${ noFollowAttr }>${ shortUrl }</a>`;
        }

        return word;
      });

  return words.join('');
}


export function wordcount(str: string | SafeString): number | null {
  str = normalize(str, '');
  const words: RegExpMatchArray | null = (str) ? str.match(/\w+/g) : null;
  return (words) ? words.length : null;
}


export function float(val: string, def?: number): number | undefined {
  const result: number = parseFloat(val);
  return isNaN(result) ? def : result;
}


export const intFilter: (...macroArgs) => any = r.makeMacro(
  [ 'value', 'default', 'base' ],
  [ ],
  function doInt(value: string, defaultValue: number | undefined = undefined, base: number = 10): number | undefined {
    const res: number = parseInt(value, base);
    return isNaN(res) ? defaultValue : res;
  }
);


module.exports['int'] = intFilter;
module.exports['e'] = escape;
module.exports['d'] = default_;


exports['int'] = intFilter;
exports['e'] = escape;
exports['d'] = default_;
