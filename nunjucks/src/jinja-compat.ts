import { Parser } from './compiler/parser/parser';
import { _assign, _values, _entries, isObject } from './lib';
import { keys, isArray, Frame, contextOrFrameLookup, memberLookup } from './runtime/runtime';
import { Context } from './environment/environment';
import { Slice } from './nodes/jinja/slice';
import { ArrayNode } from './nodes/arrayNode';
import { Dict } from './nodes/dict';
import { Group } from './nodes/group';
import { TokenType } from './compiler/lexer/tokenType';
import { Token } from './compiler/lexer/token';
import { Tokenizer } from './compiler/lexer/tokenizer';
import { ISavedTokensState } from './compiler/lexer/ISavedTokensState';
import { CodeGenerator } from './compiler/codeGenerator';


function addCompileSliceToCodeGenerator(): void {
  CodeGenerator.prototype['compileSlice'] = function compileSlice(node, frame): void {
    this._emit('(');
    this._compileExpression(node.start, frame);
    this._emit('),(');
    this._compileExpression(node.stop, frame);
    this._emit('),(');
    this._compileExpression(node.step, frame);
    this._emit(')');
  };
}


function addContextOrFrameLookupToRuntime<T, V, IHasKeywords>(orig_contextOrFrameLookup: (context: Context, frame: Frame, name: string) => unknown, ...args): void {
  // @ts-ignore
  contextOrFrameLookup = function contextOrFrameLookup(context: Context, frame: Frame, key: string): boolean | null {
    const val = orig_contextOrFrameLookup.apply(this, [ context, frame, key ]);
    if (val !== undefined) {
      return val;
    }
    switch (key) {
      case 'True':
        return true;
      case 'False':
        return false;
      case 'None':
        return null;
      default:
        return undefined;
    }
  };
}


export function installCompat() {
  'use strict';

  /* eslint-disable camelcase */

  // This must be called like `nunjucks.installCompat` so that `this`
  // references the nunjucks instance
  // Handle slim case where these 'modules' are excluded from the built source

  const nunjucks = this;
  const orig_contextOrFrameLookup = contextOrFrameLookup;
  const orig_memberLookup = memberLookup;
  let orig_CodeGenerator_assertType: { (node: any, ...types: any[]): void; (node: any, ...types: any[]): void; apply?: any; };
  let orig_Parser_parseAggregate: { (): Group | ArrayNode | Dict; (): Group | ArrayNode | Dict; };
  if (CodeGenerator) {
    orig_CodeGenerator_assertType = CodeGenerator.prototype.assertType;
  }
  if (Parser) {
    orig_Parser_parseAggregate = Parser.prototype.parseAggregate;
  }


  function uninstall() {
    // @ts-ignore
    contextOrFrameLookup = orig_contextOrFrameLookup;
    // @ts-ignore
    memberLookup = orig_memberLookup;
    if (CodeGenerator) {
      CodeGenerator.prototype.assertType = orig_CodeGenerator_assertType;
    }
    if (Parser) {
      Parser.prototype.parseAggregate = orig_Parser_parseAggregate;
    }
  }

  addContextOrFrameLookupToRuntime(orig_contextOrFrameLookup, arguments);

  function getTokensState(tokens: Tokenizer): ISavedTokensState {
    return {
      index: tokens.index,
      lineno: tokens.lineno,
      colno: tokens.colno,
      currentLine_: tokens.currentLine_
    };
  }


  function restoreTokenizerState(errState: ISavedTokensState): void {
    _assign(this.tokens, errState);
  }


  if (process.env.BUILD_TYPE !== 'SLIM' && CodeGenerator && Parser) { // i.e., not slim mode
    CodeGenerator.prototype.assertType = function assertType(node): void {
      if (node instanceof Slice) {
        return;
      }
      orig_CodeGenerator_assertType.apply(this, arguments);
    };
    addCompileSliceToCodeGenerator();

    Parser.prototype.parseAggregate = jinjaParseAggregate;
  }


  function jinjaParseAggregate(this: Parser): ArrayNode {
    const origState: ISavedTokensState = getTokensState(this.tokens);

    // Set back one accounting for opening bracket/parens
    origState.colno--;
    origState.index--;
    try {
      return orig_Parser_parseAggregate.apply(this);
    } catch (e) {
      const errState: ISavedTokensState = getTokensState(this.tokens);
      const rethrow: <T>() => T = <T>(): any => {
        restoreTokenizerState.call(this, errState);
        return e;
      };

      // Reset to state before original parseAggregate called
      restoreTokenizerState.call(this, origState);

      this.parserTokenStream.peeked = null; // TODO: was false;

      const tok: Token<any> = this.parserTokenStream.peekToken();
      if (tok.type !== TokenType.TOKEN_LEFT_BRACKET) {
        throw rethrow();
      } else {
        this.parserTokenStream.nextToken();
      }

      const node: Slice = new Slice(tok.lineno, tok.colno);

      // If we don't encounter a colon while parsing, this is not a slice,
      // so re-raise the original exception.
      let isSlice: boolean = false;

      for (let i: number = 0; i <= node.fields.length; i++) {
        if (this.skip(TokenType.TOKEN_RIGHT_BRACKET)) {
          break;
        }
        if (i === node.fields.length) {
          if (isSlice) {
            this.fail('parseSlice: too many slice components', tok.lineno, tok.colno);
          } else {
            break;
          }
        }
        if (this.skip(TokenType.TOKEN_COLON)) {
          isSlice = true;
        } else {
          const field: string = node.fields[i];

          node[field] = this.parseExpression();

          isSlice = this.skip(TokenType.TOKEN_COLON) || isSlice;
        }
      }
      if (!isSlice) {
        throw rethrow();
      }
      return new ArrayNode(tok.lineno, tok.colno, [ node ]);
    }
  }


  function sliceLookup(obj: string | string[], start: number, stop: number, step: number) {
    obj = obj || [];
    if (start === null) {
      start = (step < 0) ? (obj.length - 1) : 0;
    }
    if (stop === null) {
      stop = (step < 0) ? -1 : obj.length;
    } else if (stop < 0) {
      stop += obj.length;
    }

    if (start < 0) {
      start += obj.length;
    }

    const results = [];

    for (let i = start; ; i += step) {
      if (i < 0 || i > obj.length) {
        break;
      }
      if (step > 0 && i >= stop) {
        break;
      }
      if (step < 0 && i <= stop) {
        break;
      }
      results.push(memberLookup(obj, i));
    }
    return results;
  }

  function hasOwnProp(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }


  const ARRAY_MEMBERS = {
    pop(index) {
      if (index === undefined) {
        return this.pop();
      }
      if (index >= this.length || index < 0) {
        throw new Error('KeyError');
      }
      return this.splice(index, 1);
    },
    append(element) {
      return this.push(element);
    },
    remove(element) {
      for (let i = 0; i < this.length; i++) {
        if (this[i] === element) {
          return this.splice(i, 1);
        }
      }
      throw new Error('ValueError');
    },
    count(element) {
      let count = 0;
      for (let i = 0; i < this.length; i++) {
        if (this[i] === element) {
          count++;
        }
      }
      return count;
    },
    index(element) {
      let i;
      if ((i = this.indexOf(element)) === -1) {
        throw new Error('ValueError');
      }
      return i;
    },
    find(element) {
      return this.indexOf(element);
    },
    insert(index, elem) {
      return this.splice(index, 0, elem);
    }
  };
  const OBJECT_MEMBERS = {
    iteritems: undefined,

    itervalues: undefined,

    iterkeys: undefined,


    items() {
      return _entries(this);
    },
    values() {
      return _values(this);
    },
    keys() {
      return keys(this);
    },
    get(key, def) {
      let output = this[key];
      if (output === undefined) {
        output = def;
      }
      return output;
    },
    has_key(key) {
      return hasOwnProp(this, key);
    },
    pop(key, def) {
      let output = this[key];
      if (output === undefined && def !== undefined) {
        output = def;
      } else if (output === undefined) {
        throw new Error('KeyError');
      } else {
        delete this[key];
      }
      return output;
    },
    popitem() {
      const keys1 = keys(this);
      if (!keys1.length) {
        throw new Error('KeyError');
      }
      const k = keys1[0];
      const val = this[k];
      delete this[k];
      return [k, val];
    },
    setdefault(key, def = null) {
      if (!(key in this)) {
        this[key] = def;
      }
      return this[key];
    },
    update(kwargs) {
      _assign(this, kwargs);
      return null; // Always returns None
    }
  };
  OBJECT_MEMBERS.iteritems = OBJECT_MEMBERS.items;
  OBJECT_MEMBERS.itervalues = OBJECT_MEMBERS.values;
  OBJECT_MEMBERS.iterkeys = OBJECT_MEMBERS.keys;

  // @ts-ignore
  memberLookup = function memberLookup(obj, val, autoescape) {
    if (arguments.length === 4) {
      return sliceLookup.apply(this, arguments);
    }
    obj = obj || {};

    // If the object is an object, return any of the methods that Python would
    // otherwise provide.
    if (isArray(obj) && hasOwnProp(ARRAY_MEMBERS, val)) {
      return ARRAY_MEMBERS[val].bind(obj);
    }
    if (isObject(obj) && hasOwnProp(OBJECT_MEMBERS, val)) {
      return OBJECT_MEMBERS[val].bind(obj);
    }

    return orig_memberLookup.apply(this, arguments);
  };

  return uninstall;
}


