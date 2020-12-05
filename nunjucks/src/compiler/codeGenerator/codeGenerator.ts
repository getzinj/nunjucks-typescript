import { repeat } from '../../lib';
import { Frame } from '../../runtime/frame';
import { Literal } from '../../nodes/literal';
import { NunjucksSymbol } from '../../nodes/nunjucksSymbol';
import { Group } from '../../nodes/group';
import { Dict } from '../../nodes/dict';
import { FunCall } from '../../nodes/funCall';
import { Caller } from '../../nodes/caller';
import { Filter } from '../../nodes/filter';
import { LookupVal } from '../../nodes/lookupVal';
import { Compare } from '../../nodes/compare';
import { InlineIf } from '../../nodes/inlineIf';
import { In } from '../../nodes/operators/in';
import { Is } from '../../nodes/operators/is';
import { And } from '../../nodes/operators/and';
import { Or } from '../../nodes/operators/or';
import { Not } from '../../nodes/operators/not';
import { Add } from '../../nodes/operators/add';
import { Concat } from '../../nodes/operators/concat';
import { Sub } from '../../nodes/operators/sub';
import { Mul } from '../../nodes/operators/mul';
import { Div } from '../../nodes/operators/div';
import { FloorDiv } from '../../nodes/operators/floorDiv';
import { Mod } from '../../nodes/operators/mod';
import { Pow } from '../../nodes/operators/pow';
import { Neg } from '../../nodes/operators/neg';
import { Pos } from '../../nodes/operators/pos';
import { TemplateData } from '../../nodes/templateData';
import { BinOp } from '../../nodes/operators/binOp';
import { compareOps } from './compareOps';
import { FilterAsync } from '../../nodes/filterAsync';
import { ArrayNode } from '../../nodes/arrayNode';
import { Pair } from '../../nodes/pair';
import { Block } from '../../nodes/block';
import { Super } from '../../nodes/super';
import { Self } from '../../nodes/self';
import { Extends } from '../../nodes/extends';
import { Include } from '../../nodes/include';
import { Output } from '../../nodes/output';
import { TemplateError } from '../../templateError';
import { Capture } from '../../nodes/capture';
import { Macro } from '../../nodes/macro';
import { AsyncAll } from '../../nodes/asyncAll';
import { AsyncEach } from '../../nodes/asyncEach';
import { IfAsync } from '../../nodes/ifAsync';
import { If } from '../../nodes/if';
import { Switch } from '../../nodes/switch';
import { Case } from '../../nodes/case';
import { KeywordArgs } from '../../nodes/keywordArgs';
import { CallExtensionAsync } from '../../nodes/callExtensionAsync';
import { CallExtension } from '../../nodes/callExtension';
import { NunjucksNodeList } from '../../nodes/nunjucksNodeList';
import { INunjucksNodeList } from '../../nodes/INunjucksNodeList';
import { INunjucksNode } from '../../nodes/INunjucksNode';



export class CodeGenerator {
  private inBlock: boolean = false;
  private _scopeClosers: string = '';
  private lastId: number = 0;
  private buffer: string = null;
  private bufferStack: string[] = [];
  private codebuf: string[] = [];
  private currentIndentLevel: number = 0;
  private readonly spacesPerIndentLevel: number = 2;


  constructor(private readonly templateName: string, private readonly throwOnUndefined: boolean) { }


  private _pushBuffer(): string {
    const id: string = this._tmpid();
    this.bufferStack.push(this.buffer);
    this.buffer = id;
    this._emit(`var ${this.buffer} = "";`);
    return id;
  }


  private _popBuffer(): void {
    this.buffer = this.bufferStack.pop();
  }


  private _emit(code: string): void {
    this.codebuf.push(code);
  }


  private _emitLine(code: string): void {
    this._emit(repeat(repeat(' ', this.spacesPerIndentLevel), this.currentIndentLevel));
    this._emit(code + '\n');
  }


  private _emitLines(...lines: string[]): void {
    lines.forEach((line: string): void => this._emitLine(line));
  }


  private _emitFuncBegin(node: INunjucksNode, name: string): void {
    this.buffer = 'output';
    this._scopeClosers = '';
    this._emitLine(`function ${name}(env, context, frame, runtime, cb) {`);
    this.currentIndentLevel++;
    this._emitLine(`var lineno = ${node.lineno};`);
    this._emitLine(`var colno = ${node.colno};`);
    this._emitLine(`var ${this.buffer} = "";`);
    this._emitLine('try {');
    this.currentIndentLevel++;
  }


  private _emitFuncEnd(noReturn?: boolean): void {
    if (!noReturn) {
      this._emitLine('cb(null, ' + this.buffer + ');');
    }

    this._closeScopeLevels();
    this.currentIndentLevel--;
    this._emitLine('} catch (e) {');
    {
      this.currentIndentLevel++;
      this._emitLine('cb(runtime.handleError(e, lineno, colno));');
      this.currentIndentLevel--;
    }
    this._emitLine('}');
    this.currentIndentLevel--;
    this._emitLine('}');
    this.buffer = null;
  }


  private _addScopeLevel(): void {
    this._scopeClosers += '})';
  }


  private _closeScopeLevels(): void {
    this._emitLine(this._scopeClosers + ';');
    this._scopeClosers = '';
  }


  private _withScopedSyntax(func): void {
    const _scopeClosers: string = this._scopeClosers;
    this._scopeClosers = '';

    func.call(this);

    this._closeScopeLevels();
    this._scopeClosers = _scopeClosers;
  }


  private _makeCallback(res?: string): string {
    const err: string = this._tmpid();

    return 'function(' + err + (res ? ',' + res : '') + ') {\n' +
        'if(' + err + ') { cb(' + err + '); return; }';
  }


  private _tmpid(): string {
    this.lastId++;
    return 't_' + this.lastId;
  }


  private _templateName(): string {
    return (this.templateName == null) ? 'undefined' : JSON.stringify(this.templateName);
  }


  private _compileChildren(node: INunjucksNode, frame: Frame): void {
    node?.children?.forEach?.((child: INunjucksNode): void => {
      this.compile(child, frame);
    });
  }


  private _compileAggregate(node: INunjucksNode, frame: Frame, startChar?: string, endChar?: string): void {
    if (startChar) {
      this._emit(startChar);
    }

    node.children.forEach((child: INunjucksNode, i: number): void => {
      if (i > 0) {
        this._emit(',');
      }

      this.compile(child, frame);
    });

    if (endChar) {
      this._emit(endChar);
    }
  }


  private _compileExpression(node: INunjucksNode, frame: Frame): void {
    // TODO: I'm not really sure if this type check is worth it or  not.
    this.assertType(
        node,
        Literal,
        NunjucksSymbol,
        Group,
        Array,
        Dict,
        FunCall,
        Caller,
        Filter,
        LookupVal,
        Compare,
        InlineIf,
        In,
        Is,
        And,
        Or,
        Not,
        Add,
        Concat,
        Sub,
        Mul,
        Div,
        FloorDiv,
        Mod,
        Pow,
        Neg,
        Pos,
        Compare,
        NunjucksNodeList
    );
    this.compile(node, frame);
  }


  public assertType(node, ...types): void {
    if (!types.some((t): boolean => node instanceof t)) {
      this.fail(`assertType: invalid type: ${node.typename}`, node.lineno, node.colno);
    }
  }


  private compileCallExtension(node: CallExtension, frame: Frame, async?: boolean): void {
    const args: INunjucksNodeList = node.args;
    const contentArgs: INunjucksNode[] = node.contentArgs;
    const autoescape: boolean = typeof node.autoescape === 'boolean' ? node.autoescape : true;

    if (!async) {
      this._emit(`${this.buffer} += runtime.suppressValue(`);
    }

    this._emit(`env.getExtension("${node.extName}")["${node.prop}"](`);
    this._emit('context');

    if (args || contentArgs) {
      this._emit(',');
    }

    if (args) {
      if (!(args instanceof NunjucksNodeList)) {
        this.fail('compileCallExtension: arguments must be a NunjucksNodeList, ' +
            'use `parser.parseSignature`');
      }

      args.children.forEach((arg: INunjucksNode, i: number): void => {
        // Tag arguments are passed normally to the call. Note
        // that keyword arguments are turned into a single js
        // object as the last argument, if they exist.
        this._compileExpression(arg, frame);

        if (i !== args.children.length - 1 || contentArgs.length) {
          this._emit(',');
        }
      });
    }

    if (contentArgs.length) {
      contentArgs.forEach((arg: INunjucksNode, i: number): void => {
        if (i > 0) {
          this._emit(',');
        }

        if (arg) {
          this._emitLine('function(cb) {');
          this.currentIndentLevel++;
          this._emitLine('if(!cb) { cb = function(err) { if(err) { throw err; }}}');
          const id: string = this._pushBuffer();

          this._withScopedSyntax((): void => {
            this.compile(arg, frame);
            this._emitLine(`cb(null, ${id});`);
          });

          this._popBuffer();
          this._emitLine(`return ${id};`);
          this.currentIndentLevel--;
          this._emitLine('}');
        } else {
          this._emit('null');
        }
      });
    }

    if (async) {
      const res: string = this._tmpid();
      this._emitLine(', ' + this._makeCallback(res));
      this._emitLine(
          `${this.buffer} += runtime.suppressValue(${res}, ${autoescape} && env.opts.autoescape);`);
      this._addScopeLevel();
    } else {
      this._emit(')');
      this._emit(`, ${autoescape} && env.opts.autoescape);\n`);
    }
  }


  private compileCallExtensionAsync(node: CallExtensionAsync, frame: Frame): void {
    this.compileCallExtension(node, frame, true);
  }


  private compileNodeList(node: NunjucksNodeList, frame: Frame): void {
    this._compileChildren(node, frame);
  }


  public readonly compileNunjucksNodeList: (node: NunjucksNodeList, frame: Frame) => void = this.compileNodeList;


  private compileLiteral(node: Literal, frame?: Frame): void {
    if (typeof node.value === 'string') {
      let val: string = node.value.replace(/\\/g, '\\\\');
      val = val.replace(/"/g, '\\"');
      val = val.replace(/\n/g, '\\n');
      val = val.replace(/\r/g, '\\r');
      val = val.replace(/\t/g, '\\t');
      val = val.replace(/\u2028/g, '\\u2028');
      this._emit(`"${val}"`);
    } else if (node.value === null) {
      this._emit('null');
    } else {
      this._emit(node.value.toString());
    }
  }


  private compileSymbol(node: NunjucksSymbol, frame: Frame): void {
    const name: string = node.value;
    const v: string = frame.lookup(name);

    if (v) {
      this._emit(v);
    } else {
      this._emit(`runtime.contextOrFrameLookup(context, frame, "${name}")`);
    }
  }


  // Alias for TypeScript project renaming of Symbol -> NunjucksSymbol
  public readonly compileNunjucksSymbol: (node: NunjucksSymbol, frame: Frame) => void = this.compileSymbol;

  // Alias for TypeScript project renaming of Array -> ArrayNode
  public readonly compileArrayNode: (node: ArrayNode, frame: Frame) => void = this.compileArray;


  private compileGroup(node: Group, frame: Frame): void {
    this._compileAggregate(node, frame, '(', ')');
  }


  private compileArray(node: ArrayNode, frame: Frame): void {
    this._compileAggregate(node, frame, '[', ']');
  }


  private compileDict(node: Dict, frame: Frame): void {
    this._compileAggregate(node, frame, '{', '}');
  }


  private compilePair(node: Pair, frame: Frame): void {
    let key: INunjucksNode = node.key;
    const val: INunjucksNode = node.value;

    if (key instanceof NunjucksSymbol) {
      key = new Literal(key.lineno, key.colno, key.value);
    } else if (!(key instanceof Literal && typeof key.value === 'string')) {
      this.fail('compilePair: Dict keys must be strings or names', key.lineno, key.colno);
    }

    this.compile(key, frame);
    this._emit(': ');
    this._compileExpression(val, frame);
  }


  private compileInlineIf(node: InlineIf, frame: Frame): void {
    this._emit('(');
    this.compile(node.cond, frame);
    this._emit('?');
    this.compile(node.body, frame);
    this._emit(':');
    if (node.else_ !== null) {
      this.compile(node.else_, frame);
    } else {
      this._emit('""');
    }
    this._emit(')');
  }


  private compileIn(node: In, frame: Frame): void {
    this._emit('runtime.inOperator(');
    this.compile(node.left, frame);
    this._emit(',');
    this.compile(node.right, frame);
    this._emit(')');
  }


  private compileIs(node: Is, frame: Frame): void {
    // first, we need to try to get the name of the test function, if it's a
    // callable (i.e., has args) and not a symbol.
    const right = node.right.name
        ? node.right.name.value
        // otherwise go with the symbol value
        : node.right.value;
    this._emit('env.getTest("' + right + '").call(context, ');
    this.compile(node.left, frame);
    // compile the arguments for the callable if they exist
    if (node.right.args) {
      this._emit(',');
      this.compile(node.right.args, frame);
    }
    this._emit(') === true');
  }


  private _binOpEmitter(node: BinOp, frame: Frame, str: string): void {
    this.compile(node.left, frame);
    this._emit(str);
    this.compile(node.right, frame);
  }


  // ensure concatenation instead of addition
  // by adding empty string in between
  private compileOr(node: Or, frame: Frame): void {
    return this._binOpEmitter(node, frame, ' || ');
  }


  private compileAnd(node: And, frame: Frame): void {
    return this._binOpEmitter(node, frame, ' && ');
  }


  private compileAdd(node: Add, frame: Frame): void {
    return this._binOpEmitter(node, frame, ' + ');
  }


  private compileConcat(node: Concat, frame: Frame): void {
    return this._binOpEmitter(node, frame, ' + "" + ');
  }


  private compileSub(node: Sub, frame: Frame): void {
    return this._binOpEmitter(node, frame, ' - ');
  }


  private compileMul(node: Mul, frame: Frame): void {
    return this._binOpEmitter(node, frame, ' * ');
  }


  private compileDiv(node: Div, frame: Frame): void {
    return this._binOpEmitter(node, frame, ' / ');
  }


  private compileMod(node: BinOp, frame: Frame): void {
    return this._binOpEmitter(node, frame, ' % ');
  }


  private compileNot(node: Not, frame: Frame): void {
    this._emit('!');
    this.compile(node.target, frame);
  }


  private compileFloorDiv(node: FloorDiv, frame: Frame): void {
    this._emit('Math.floor(');
    this.compile(node.left, frame);
    this._emit(' / ');
    this.compile(node.right, frame);
    this._emit(')');
  }


  private compilePow(node: Pow, frame: Frame): void {
    this._emit('Math.pow(');
    this.compile(node.left, frame);
    this._emit(', ');
    this.compile(node.right, frame);
    this._emit(')');
  }


  private compileNeg(node: Neg, frame: Frame): void {
    this._emit('-');
    this.compile(node.target, frame);
  }


  private compilePos(node: Pos, frame: Frame): void {
    this._emit('+');
    this.compile(node.target, frame);
  }


  private compileCompare(node, frame: Frame): void {
    this.compile(node.expr, frame);

    node.ops.forEach((op): void => {
      this._emit(` ${compareOps[op.type]} `);
      this.compile(op.expr, frame);
    });
  }


  private compileLookupVal(node: LookupVal, frame: Frame): void {
    this._emit('runtime.memberLookup((');
    this._compileExpression(node.target, frame);
    this._emit('),');
    this._compileExpression(node.val, frame);
    this._emit(')');
  }


  private _getNodeName(node): string {
    switch (node.typename) {
      case 'Symbol':
      case 'NunjucksSymbol':
        return node.value;
      case 'FunCall':
        return 'the return value of (' + this._getNodeName(node.name) + ')';
      case 'LookupVal':
        return this._getNodeName(node.target) + '["' +
            this._getNodeName(node.val) + '"]';
      case 'Literal':
        return node.value.toString();
      default:
        return '--expression--';
    }
  }


  private compileFunCall(node: FunCall, frame: Frame): void {
    // Keep track of line/col info at runtime by settings
    // variables within an expression. An expression in javascript
    // like (x, y, z) returns the last value, and x and y can be
    // anything
    this._emit(`(lineno = ${node.lineno}, colno = ${node.colno}, `);

    this._emit('runtime.callWrap(');
    // Compile it as normal.
    this._compileExpression(node.name, frame);

    // Output the name of what we're calling so we can get friendly errors
    // if the lookup fails.
    this._emit(', "' + this._getNodeName(node.name).replace(/"/g, '\\"') + '", context, ');

    this._compileAggregate(node.args, frame, '[', '])');

    this._emit(')');
  }


  private compileFilter(node: Filter, frame: Frame): void {
    const name: NunjucksSymbol = node.name;
    this.assertType(name, NunjucksSymbol);

    // Handle special case of "default" filter, which is an invalid export.
    // @ts-ignore
    const filterName: string = (name.value === 'default') ? 'default_' : name.value;

    this._emit('env.getFilter("' + filterName + '").call(context, ');
    this._compileAggregate(node.args, frame);
    this._emit(')');
  }


  private compileFilterAsync(node: FilterAsync, frame: Frame): void {
    const name: NunjucksSymbol = node.name;
    const symbol: string = node.symbol.value;

    this.assertType(name, NunjucksSymbol);

    frame.set(symbol, symbol);

    // @ts-ignore
    this._emit(`env.getFilter("${name.value}").call(context, `);
    this._compileAggregate(node.args, frame);
    this._emitLine(', ' + this._makeCallback(symbol));

    this._addScopeLevel();
  }


  private compileKeywordArgs(node: KeywordArgs, frame: Frame): void {
    this._emit('runtime.makeKeywordArgs(');
    {
      this.compileDict(node, frame);
    }
    this._emit(')');
  }


  private compileSet(node, frame: Frame): void {
    const ids: string[] = [];

    // Lookup the variable names for each identifier and create
    // new ones if necessary
    node.targets.forEach((target: NunjucksSymbol): void => {
      let id: string = frame.lookup(target.value);

      if (id === null || id === undefined) {
        id = this._tmpid();

        // Note: This relies on js allowing scope across
        // blocks, in case this is created inside an `if`
        this._emitLine(`var ${id};`);
      }

      ids.push(id);
    });

    if (node.value) {
      this._emit(ids.join(' = ') + ' = ');
      this._compileExpression(node.value, frame);
      this._emitLine(';');
    } else {
      this._emit(ids.join(' = ') + ' = ');
      this.compile(node.body, frame);
      this._emitLine(';');
    }

    node.targets.forEach((target: NunjucksSymbol, i: number): void => {
      const id: string = ids[i];
      const name: string = target.value;

      // We are running this for every var, but it's very
      // uncommon to assign to multiple vars anyway
      this._emitLine(`frame.set("${name}", ${id}, true);`);

      this._emitLine('if(frame.topLevel) {');
      this.currentIndentLevel++;
      this._emitLine(`  context.setVariable("${name}", ${id});`);
      this.currentIndentLevel--;
      this._emitLine('}');

      if (name.charAt(0) !== '_') {
        this._emitLine('if(frame.topLevel) {');
        this.currentIndentLevel++;
        this._emitLine(`context.addExport("${name}", ${id});`);
        this.currentIndentLevel--;
        this._emitLine('}');
      }
    });
  }


  private compileSwitch(node: Switch, frame: Frame): void {
    this._emit('switch (');
    this.compile(node.expr, frame);
    this._emit(') {');
    this.currentIndentLevel++;
    node.cases.forEach((c: Case, i: number): void => {
      this._emit('case ');
      this.compile(c.cond, frame);
      this._emit(': ');
      this.compile(c.body, frame);
      // preserve fall-throughs
      if (c.body.children.length) {
        this._emitLine('break;');
      }
    });
    if (node.default) {
      this._emit('default:');
      this.compile(node.default, frame);
    }
    this.currentIndentLevel--;
    this._emit('}');
  }


  private compileIf(node: If, frame, async): void {
    this._emit('if(');
    this._compileExpression(node.cond, frame);
    this._emitLine(') {');
    this.currentIndentLevel++;

    this._withScopedSyntax((): void => {
      this.compile(node.body, frame);

      if (async) {
        this._emit('cb()');
      }
    });

    if (node.else_) {
      this._emitLine('}\nelse {');
      this.currentIndentLevel++;

      this._withScopedSyntax((): void => {
        this.compile(node.else_, frame);

        if (async) {
          this._emit('cb()');
        }
      });
    } else if (async) {
      this._emitLine('}\nelse {');
      this.currentIndentLevel++;
      this._emit('cb()');
    }

    this.currentIndentLevel--;
    this._emitLine('}');
  }


  private compileIfAsync(node: IfAsync, frame: Frame): void {
    this._emit('(function(cb) {');
    this.currentIndentLevel++;
    this.compileIf(node, frame, true);
    this._emit('})(' + this._makeCallback());
    this._addScopeLevel();
  }


  private _emitLoopBindings(node, arr: string, i: string, len: string): void {
    const bindings: ({ val; name: string })[] = [
      { name: 'index', val: `${i} + 1` },
      { name: 'index0', val: i },
      { name: 'revindex', val: `${len} - ${i}` },
      { name: 'revindex0', val: `${len} - ${i} - 1` },
      { name: 'first', val: `${i} === 0` },
      { name: 'last', val: `${i} === ${len} - 1` },
      { name: 'length', val: len },
    ];

    bindings.forEach((b: { val; name: string }): void => {
      this._emitLine(`frame.set("loop.${b.name}", ${b.val});`);
    });
  }


  private compileFor(node, frame: Frame): void {
    // Some of this code is ugly, but it keeps the generated code
    // as fast as possible. ForAsync also shares some of this, but
    // not much.

    const i: string = this._tmpid();
    const len: string = this._tmpid();
    const arr: string = this._tmpid();
    frame = frame.push();

    this._emitLine('frame = frame.push();');

    this._emit(`var ${arr} = `);
    this._compileExpression(node.arr, frame);
    this._emitLine(';');

    this._emit(`if(${arr}) {`);
    this._emitLine(arr + ' = runtime.fromIterator(' + arr + ');');

    // If multiple names are passed, we need to bind them
    // appropriately
    if (node.name instanceof ArrayNode) {
      this._emitLine(`var ${i};`);

      // The object could be an array or object. Note that the
      // body of the loop is duplicated for each condition, but
      // we are optimizing for speed over size.
      this._emitLine(`if(runtime.isArray(${arr})) {`);
      this._emitLine(`var ${len} = ${arr}.length;`);
      this._emitLine(`for(${i}=0; ${i} < ${arr}.length; ${i}++) {`);

      // Bind each declared var
      node.name.children.forEach((child: INunjucksNode, u: string | number): void => {
        const tid: string = this._tmpid();
        this._emitLine(`var ${tid} = ${arr}[${i}][${u}];`);
        this._emitLine(`frame.set("${child}", ${arr}[${i}][${u}]);`);
        frame.set(node.name.children[u].value, tid);
      });

      this._emitLoopBindings(node, arr, i, len);
      this._withScopedSyntax((): void => {
        this.compile(node.body, frame);
      });
      this.currentIndentLevel--;
      this._emitLine('}');

      this._emitLine('} else {');
      {
        this.currentIndentLevel++;
        // Iterate over the key/values of an object
        const [ key, val ] = node.name.children;
        const k: string = this._tmpid();
        const v: string = this._tmpid();
        frame.set(key.value, k);
        frame.set(val.value, v);

        this._emitLine(`${i} = -1;`);
        this._emitLine(`var ${len} = runtime.keys(${arr}).length;`);
        this._emitLine(`for(var ${k} in ${arr}) {`);
        this._emitLine(`${i}++;`);
        this._emitLine(`var ${v} = ${arr}[${k}];`);
        this._emitLine(`frame.set("${key.value}", ${k});`);
        this._emitLine(`frame.set("${val.value}", ${v});`);

        this._emitLoopBindings(node, arr, i, len);
        this._withScopedSyntax((): void => {
          this.compile(node.body, frame);
        });
        this.currentIndentLevel--;
      }
      this._emitLine('}');

      this.currentIndentLevel--;
      this._emitLine('}');
    } else {
      // Generate a typical array iteration
      const v: string = this._tmpid();
      frame.set(node.name.value, v);

      this._emitLine(`var ${len} = ${arr}.length;`);
      this._emitLine(`for(var ${i}=0; ${i} < ${arr}.length; ${i}++) {`);
      this._emitLine(`var ${v} = ${arr}[${i}];`);
      this._emitLine(`frame.set("${node.name.value}", ${v});`);

      this._emitLoopBindings(node, arr, i, len);

      this._withScopedSyntax((): void => {
        this.compile(node.body, frame);
      });

      this.currentIndentLevel--;
      this._emitLine('}');
    }

    this.currentIndentLevel--;
    this._emitLine('}');
    if (node.else_) {
      this._emitLine('if (!' + len + ') {');
      this.currentIndentLevel++;
      this.compile(node.else_, frame);
      this.currentIndentLevel--;
      this._emitLine('}');
    }

    this._emitLine('frame = frame.pop();');
  }


  private _compileAsyncLoop(node, frame, parallel?): void {
    // This shares some code with the For tag, but not enough to
    // worry about. This iterates across an object asynchronously,
    // but not in parallel.

    const i: string = this._tmpid();
    const len: string = this._tmpid();
    const arr: string = this._tmpid();
    const asyncMethod: 'asyncAll' | 'asyncEach' = parallel ? 'asyncAll' : 'asyncEach';
    frame = frame.push();

    this._emitLine('frame = frame.push();');

    this._emit('var ' + arr + ' = runtime.fromIterator(');
    this._compileExpression(node.arr, frame);
    this._emitLine(');');

    if (node.name instanceof ArrayNode) {
      const arrayLen: number = node.name.children.length;
      this._emit(`runtime.${ asyncMethod }(${ arr }, ${ arrayLen }, function(`);

      node.name.children.forEach((name): void => {
        this._emit(`${name.value},`);
      });

      this._emit(i + ',' + len + ',next) {');
      this.currentIndentLevel++;

      node.name.children.forEach((name): void => {
        const id = name.value;
        frame.set(id, id);
        this._emitLine(`frame.set("${id}", ${id});`);
      });
    } else {
      const id = node.name.value;
      this._emitLine(`runtime.${asyncMethod}(${arr}, 1, function(${id}, ${i}, ${len},next) {`);
      this._emitLine('frame.set("' + id + '", ' + id + ');');
      frame.set(id, id);
    }

    this._emitLoopBindings(node, arr, i, len);

    this._withScopedSyntax((): void => {
      let buf: string;
      if (parallel) {
        buf = this._pushBuffer();
      }

      this.compile(node.body, frame);
      this._emitLine('next(' + i + (buf ? ',' + buf : '') + ');');

      if (parallel) {
        this._popBuffer();
      }
    });

    const output: string = this._tmpid();
    this._emitLine('}, ' + this._makeCallback(output));
    this._addScopeLevel();

    if (parallel) {
      this._emitLine(this.buffer + ' += ' + output + ';');
    }

    if (node.else_) {
      this._emitLine('if (!' + arr + '.length) {');
      this.currentIndentLevel++;
      this.compile(node.else_, frame);
      this.currentIndentLevel--;
      this._emitLine('}');
    }

    this._emitLine('frame = frame.pop();');
  }


  private compileAsyncEach(node: AsyncEach, frame: Frame): void {
    this._compileAsyncLoop(node, frame);
  }


  private compileAsyncAll(node: AsyncAll, frame: Frame): void {
    this._compileAsyncLoop(node, frame, true);
  }


  private _compileMacro(node: Macro, frame?: Frame): string {
    const args = [];
    let kwargs = null;
    const funcId: string = 'macro_' + this._tmpid();
    const keepFrame: boolean = (frame !== undefined);

    // Type check the definition of the args
    node.args.children.forEach((arg: Dict | NunjucksSymbol, i: number): void => {
      if (i === node.args.children.length - 1 && arg instanceof Dict) {
        kwargs = arg;
      } else {
        this.assertType(arg, NunjucksSymbol);
        args.push(arg);
      }
    });

    const realNames: string[] = [ ...args.map((n): string => `l_${n.value}`), 'kwargs' ];

    // Quoted argument names
    const argNames: string[] = args.map((n): string => `"${n.value}"`);
    const kwargNames: string[] = ((kwargs && kwargs.children) || []).map((n): string => `"${n.key.value}"`);

    // We pass a function to makeMacro which destructures the
    // arguments so support setting positional args with keywords
    // args and passing keyword args as positional args
    // (essentially default values). See runtime.js.
    let currFrame: Frame = keepFrame ? frame.push(true) : new Frame();
    this._emitLines(
        `var ${funcId} = runtime.makeMacro(`,
        `[${argNames.join(', ')}], `,
        `[${kwargNames.join(', ')}], `,
        `function (${realNames.join(', ')}) {`,
        'var callerFrame = frame;',
        'frame = ' + ((keepFrame) ? 'frame.push(true);' : 'new runtime.Frame();'),
        'kwargs = kwargs || { };',
        'if (Object.prototype.hasOwnProperty.call(kwargs, "caller")) {',
        'frame.set("caller", kwargs.caller); }');

    // Expose the arguments to the template. Don't need to use
    // random names because the function
    // will create a new run-time scope for us
    args.forEach((arg): void => {
      this._emitLine(`frame.set("${arg.value}", l_${arg.value});`);
      currFrame.set(arg.value, `l_${arg.value}`);
    });

    // Expose the keyword arguments
    if (kwargs) {
      kwargs.children.forEach((pair): void => {
        const name: string = pair.key.value;
        this._emit(`frame.set("${name}", `);
        this._emit(`Object.prototype.hasOwnProperty.call(kwargs, "${name}")`);
        this._emit(` ? kwargs["${name}"] : `);
        this._compileExpression(pair.value, currFrame);
        this._emit(');');
      });
    }

    const bufferId: string = this._pushBuffer();

    this._withScopedSyntax((): void => {
      this.compile(node.body, currFrame);
    });

    this._emitLine('frame = ' + ((keepFrame) ? 'frame.pop();' : 'callerFrame;'));
    this._emitLine(`return new runtime.SafeString(${bufferId});`);
    this._emitLine('});');
    this._popBuffer();

    return funcId;
  }


  private compileMacro(node: Macro, frame: Frame): void {
    const funcId: string = this._compileMacro(node);

    // Expose the macro to the templates
    const name = node.name.value;
    frame.set(name, funcId);

    if (frame.parent) {
      this._emitLine(`frame.set("${name}", ${funcId});`);
    } else {
      if (node.name.value.charAt(0) !== '_') {
        this._emitLine(`context.addExport("${name}");`);
      }
      this._emitLine(`context.setVariable("${name}", ${funcId});`);
    }
  }


  private compileCaller(node: Caller, frame: Frame): void {
    // basically an anonymous "macro expression"
    this._emit('(function (){');
    const funcId: string = this._compileMacro(node, frame);
    this._emit(`return ${funcId};})()`);
  }


  private _compileGetTemplate(node, frame, eagerCompile, ignoreMissing): string {
    const parentTemplateId: string = this._tmpid();
    const parentName: string = this._templateName();
    const cb: string = this._makeCallback(parentTemplateId);
    const eagerCompileArg: string = (eagerCompile) ? 'true' : 'false';
    const ignoreMissingArg: string = (ignoreMissing) ? 'true' : 'false';
    this._emit('env.getTemplate(');
    this._compileExpression(node.template, frame);
    this._emitLine(`, ${eagerCompileArg}, ${parentName}, ${ignoreMissingArg}, ${cb}`);
    return parentTemplateId;
  }


  private compileImport(node, frame: Frame): void {
    const target = node.target.value;
    const id: string = this._compileGetTemplate(node, frame, false, false);
    this._addScopeLevel();

    this._emitLine(id + '.getExported(' +
        (node.withContext ? 'context.getVariables(), frame, ' : '') +
        this._makeCallback(id));
    this._addScopeLevel();

    frame.set(target, id);

    if (frame.parent) {
      this._emitLine(`frame.set("${target}", ${id});`);
    } else {
      this._emitLine(`context.setVariable("${target}", ${id});`);
    }
  }


  private compileFromImport(node, frame: Frame): void {
    const importedId: string = this._compileGetTemplate(node, frame, false, false);
    this._addScopeLevel();

    this._emitLine(importedId + '.getExported(' +
        (node.withContext ? 'context.getVariables(), frame, ' : '') +
        this._makeCallback(importedId));
    this._addScopeLevel();

    node.names.children.forEach((nameNode): void => {
      let name: string;
      let alias: string;
      const id: string = this._tmpid();

      if (nameNode instanceof Pair) {
        // @ts-ignore
        name = nameNode.key.value;
        // @ts-ignore
        alias = nameNode.value.value;
      } else {
        name = nameNode.value;
        alias = name;
      }

      this._emitLine(`if(Object.prototype.hasOwnProperty.call(${importedId}, "${name}")) {`);
      {
        this.currentIndentLevel++;
        this._emitLine(`var ${id} = ${importedId}.${name};`);
        this.currentIndentLevel--;
      }
      this._emitLine('} else {');
      {
        this.currentIndentLevel++;
        this._emitLine(`cb(new Error("cannot import '${name}'")); return;`);
        this.currentIndentLevel--;
      }
      this._emitLine('}');

      frame.set(alias, id);

      if (frame.parent) {
        this._emitLine(`frame.set("${alias}", ${id});`);
      } else {
        this._emitLine(`context.setVariable("${alias}", ${id});`);
      }
    });
  }


  private compileBlock(node: Block): void {
    const id: string = this._tmpid();

    // If we are executing outside a block (creating a top-level
    // block), we really don't want to execute its code because it
    // will execute twice: once when the child template runs and
    // again when the parent template runs. Note that blocks
    // within blocks will *always* execute immediately *and*
    // wherever else they are invoked (like used in a parent
    // template). This may have behavioral differences from jinja
    // because blocks can have side effects, but it seems like a
    // waste of performance to always execute huge top-level
    // blocks twice
    if (!this.inBlock) {
      this._emit('(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : ');
    }
    this._emit(`context.getBlock("${node.name.value}")`);
    if (!this.inBlock) {
      this._emit(')');
    }
    this._emitLine('(env, context, frame, runtime, ' + this._makeCallback(id));
    this._emitLine(`${this.buffer} += ${id};`);
    this._addScopeLevel();
  }


  private compileSuper(node: Super, frame: Frame): void {
    // @ts-ignore
    const name: string = node.blockName.value;
    const id: string = node.symbol.value;

    const cb: string = this._makeCallback(id);
    this._emitLine(`context.getSuper(env, "${name}", b_${name}, frame, runtime, ${cb}`);
    this._emitLine(`${id} = runtime.markSafe(${id});`);
    this._addScopeLevel();
    frame.set(id, id);
  }


  private compileSelf(node: Self, frame: Frame): void {
    const name: string = node.blockName.value;
    const id: string = node.symbol.value;

    const cb: string = this._makeCallback(id);
    this._emitLine(`context.getSelf(env, "${name}", b_${name}, frame, runtime, ${cb}`);
    this._addScopeLevel();
    frame.set(id, id);
  }


  private compileExtends(node: Extends, frame: Frame): void {
    const k: string = this._tmpid();

    const parentTemplateId: string = this._compileGetTemplate(node, frame, true, false);

    // extends is a dynamic tag and can occur within a block like
    // `if`, so if this happens we need to capture the parent
    // template in the top-level scope
    this._emitLine(`parentTemplate = ${parentTemplateId}`);

    this._emitLine(`for(var ${k} in parentTemplate.blocks) {`);
    {
      this.currentIndentLevel++;
      this._emitLine(`context.addBlock(${k}, parentTemplate.blocks[${k}]);`);
      this.currentIndentLevel--;
    }
    this._emitLine('}');

    this._addScopeLevel();
  }


  private compileInclude(node: Include, frame: Frame): void {
    this._emitLine('var tasks = [];');
    this._emitLine('tasks.push(');
    this._emitLine('function(callback) {');
    {
      this.currentIndentLevel++;
      const id: string = this._compileGetTemplate(node, frame, false, node.ignoreMissing);
      this._emitLine(`callback(null,${id});});`);
      this.currentIndentLevel--;
    }
    this._emitLine('});');

    const id2: string = this._tmpid();
    this._emitLine('tasks.push(');
    this._emitLine('function(template, callback){');
    {
      this.currentIndentLevel++;
      this._emitLine('template.render(context.getVariables(), frame, ' + this._makeCallback(id2));
      this._emitLine('callback(null,' + id2 + ');});');
      this.currentIndentLevel--;
    }
    this._emitLine('});');

    this._emitLine('tasks.push(');
    this._emitLine('function(result, callback){');
    {
      this.currentIndentLevel++;
      this._emitLine(`${this.buffer} += result;`);
      this._emitLine('callback(null);');
    }
    this._emitLine('});');
    this._emitLine('env.waterfall(tasks, function(){');
    this.currentIndentLevel++;
    this._addScopeLevel();
  }


  private compileTemplateData(node: TemplateData, frame: Frame): void {
    this.compileLiteral(node, frame);
  }


  private compileCapture(node: Capture, frame: Frame): void {
    // we need to temporarily override the current buffer id as 'output'
    // so the set block writes to the capture output instead of the buffer
    const buffer: string = this.buffer;
    this.buffer = 'output';
    this._emitLine('(function() {');
    {
      this.currentIndentLevel++;
      this._emitLine('var output = "";');
      this._withScopedSyntax((): void => {
        this.compile(node.body, frame);
      });
      this._emitLine('return output;');
      this.currentIndentLevel--;
    }
    this._emitLine('})()');
    // and of course, revert back to the old buffer id
    this.buffer = buffer;
  }


  private compileOutput(node: Output, frame: Frame): void {
    const children: INunjucksNode[] = node.children;
    children.forEach((child: INunjucksNode): void => {
      // TemplateData is a special case because it is never
      // autoescaped, so simply output it for optimization
      if (child instanceof TemplateData) {
        if (child.value) {
          this._emit(`${this.buffer} += `);
          this.compileLiteral(child, frame);
          this._emitLine(';');
        }
      } else {
        this._emit(`${this.buffer} += runtime.suppressValue(`);
        if (this.throwOnUndefined) {
          this._emit('runtime.ensureDefined(');
        }
        this.compile(child, frame);
        if (this.throwOnUndefined) {
          this._emit(`,${node.lineno},${node.colno})`);
        }
        this._emit(', env.opts.autoescape);\n');
      }
    });
  }


  private compileRoot(node: INunjucksNode, frame: Frame | null | undefined): void {
    if (frame) {
      this.fail('compileRoot: root node can\'t have frame');
    }

    frame = new Frame();

    this._emitFuncBegin(node, 'root');
    this._emitLine('var parentTemplate = null;');
    this._compileChildren(node, frame);
    this._emitLine('if(parentTemplate) {');
    {
      this.currentIndentLevel++;
      this._emitLine('parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);');
      this.currentIndentLevel--;
    }
    this._emitLine('} else {');
    {
      this.currentIndentLevel++;
      this._emitLine(`cb(null, ${this.buffer});`);
      this.currentIndentLevel--;
    }
    this._emitLine('}');
    this._emitFuncEnd(true);

    this.inBlock = true;

    const blockNames: string[] = [];

    const blocks: Block[] = node.findAll(Block);

    blocks.forEach((block: Block, i: number): void => {
      const name: string = block.name.value;

      if (blockNames.indexOf(name) !== -1) {
        throw new Error(`Block "${name}" defined more than once.`);
      }
      blockNames.push(name);

      this._emitFuncBegin(block, `b_${name}`);

      const tmpFrame: Frame = new Frame();
      this._emitLine('var frame = frame.push(true);');
      this.compile(block.body, tmpFrame);
      this._emitFuncEnd();
    });

    this._emitLine('return {');
    {
      this.currentIndentLevel++;
      {
        blocks.forEach((block: Block, i: number): void => {
          const blockName: string = `b_${block.name.value}`;
          this._emitLine(`${blockName}: ${blockName},`);
        });
        this._emit('root: root\n');
        this.currentIndentLevel--;
      }
      this._emitLine('};');
    }
  }


  public compile(node: INunjucksNode, frame?: Frame): CodeGenerator {
    const _compile: (node, frame: Frame) => void = this.lookupTable[node.typename];
    if (_compile) {
      _compile.call(this, node, frame);
    } else {
      this.fail(`compile: Cannot compile node: ${node.typename}`, node.lineno, node.colno);
    }
    return this;
  }


  public getCode(): string {
    return this.codebuf.join('');
  }


  private fail(msg, lineno?: number, colno?: number): void {
    console.error(`msg = "${ msg }".`);
    console.error(`Type of msg = ${ typeof msg }.`);
    if (lineno !== undefined) {
      lineno += 1;
    }
    if (colno !== undefined) {
      colno += 1;
    }

    throw TemplateError(msg, lineno, colno);
  }


  public generateCode(transformedCode: INunjucksNode): string {
    this.compile(transformedCode);
    return this.getCode();
  }


  private readonly lookupTable: Readonly<Record< string, (node, frame: Frame, async?: boolean) => void>> = {
    Add: this.compileAdd,
    And: this.compileAnd,
    ArrayNode: this.compileArrayNode,
    AsyncAll: this.compileAsyncAll,
    AsyncEach: this.compileAsyncEach,
    Block: this.compileBlock,
    Caller: this.compileCaller,
    CallExtension: this.compileCallExtension,
    CallExtensionAsync: this.compileCallExtensionAsync,
    Capture: this.compileCapture,
    Compare: this.compileCompare,
    Concat: this.compileConcat,
    Dict: this.compileDict,
    Div: this.compileDiv,
    Extends: this.compileExtends,
    Filter: this.compileFilter,
    FilterAsync: this.compileFilterAsync,
    FloorDiv: this.compileFloorDiv,
    For: this.compileFor,
    FromImport: this.compileFromImport,
    FunCall: this.compileFunCall,
    Group: this.compileGroup,
    If: this.compileIf,
    IfAsync: this.compileIfAsync,
    Import: this.compileImport,
    In: this.compileIn,
    InlineIf: this.compileInlineIf,
    Include: this.compileInclude,
    Is: this.compileIs,
    KeywordArgs: this.compileKeywordArgs,
    Literal: this.compileLiteral,
    LookupVal: this.compileLookupVal,
    Macro: this.compileMacro,
    Mod: this.compileMod,
    Mul: this.compileMul,
    Neg: this.compileNeg,
    Not: this.compileNot,
    Or: this.compileOr,
    Output: this.compileOutput,
    Pair: this.compilePair,
    Pos: this.compilePos,
    Pow: this.compilePow,
    NunjucksNodeList: this.compileNodeList,
    NunjucksSymbol: this.compileNunjucksSymbol,
    Root: this.compileRoot,
    Self: this.compileSelf,
    Set: this.compileSet,
    Slice: CodeGenerator.prototype['compileSlice'] ?? undefined,
    Switch: this.compileSwitch,
    Sub: this.compileSub,
    Super: this.compileSuper,
    TemplateData: this.compileTemplateData
  };
}
