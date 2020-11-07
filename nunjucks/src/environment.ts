'use strict';


import * as compiler from './compiler';
import * as expressApp from './express-app';
import * as tests from './tests';
import * as filters from './filters';
import * as lib from './lib';
import { extend, keys, indexOf } from './lib';
import waterfall from 'a-sync-waterfall';
import { Loader } from './loader';
import { WebLoader, PrecompiledLoader } from './web-loaders';
import { globals } from './globals';
import { noopTmplSrc } from './noopTmplSrc';
import { callbackAsap } from './callbackAsap';
import { EmitterObj } from './emitterObj';
import { FileSystemLoader } from './file-system-loader';
import { Obj } from './obj';
import { Frame } from './frame';
import * as globalRuntime from './runtime';


export class Context extends Obj {
  private env: Environment | undefined;
  private exported;
  private ctx: Record<string, any>;
  private blocks: Record<string, any>;


  init(ctx, blocks, env): void {
    // Has to be tied to an environment so we can tap into its globals.
    this.env = env || new Environment();

    // Make a duplicate of ctx
    this.ctx = extend({}, ctx);

    this.blocks = {};
    this.exported = [];

    keys(blocks).forEach((name): void => {
      this.addBlock(name, blocks[name]);
    });
  }


  lookup(name: string) {
    // This is one of the most called functions, so optimize for
    // the typical case where the name isn't in the globals
    if (name in this.env.globals && !(name in this.ctx)) {
      return this.env.globals[name];
    } else {
      return this.ctx[name];
    }
  }


  setVariable(name: string, val): void {
    this.ctx[name] = val;
  }


  getVariables(): Record<string, any> {
    return this.ctx;
  }


  addBlock(name: string, block): this {
    this.blocks[name] = this.blocks[name] || [];
    this.blocks[name].push(block);
    return this;
  }


  getBlock(name: string) {
    if (!this.blocks[name]) {
      throw new Error('unknown block "' + name + '"');
    }

    return this.blocks[name][0];
  }


  getSuper(env, name: string, block, frame, runtime, cb): void {
    const idx = indexOf(this.blocks[name] || [], block);
    const blk = this.blocks[name][idx + 1];
    const context: this = this;

    if (idx === -1 || !blk) {
      throw new Error('no super block available for "' + name + '"');
    }

    blk(env, context, frame, runtime, cb);
  }


  addExport(name: string): void {
    this.exported.push(name);
  }


  getExported(): {} {
    const exported: {} = {};
    this.exported.forEach((name): void => {
      exported[name] = this.ctx[name];
    });
    return exported;
  }
}

export class Template extends Obj {
  private compiled: boolean;
  private readonly path: string;
  private readonly env: Environment | undefined;
  private readonly tmplProps;
  private readonly tmplStr;
  private blocks;
  private rootRenderFunc;


  constructor(src, env, path, eagerCompile?: boolean) {
    super();
    this.env = env || new Environment();

    if (lib.isObject(src)) {
      switch (src.type) {
        case 'code':
          this.tmplProps = src.obj;
          break;
        case 'string':
          this.tmplStr = src.obj;
          break;
        default:
          throw new Error(
              `Unexpected template object type ${src.type}; expected 'code', or 'string'`);
      }
    } else if (lib.isString(src)) {
      this.tmplStr = src;
    } else {
      throw new Error('src must be a string or an object describing the source');
    }

    this.path = path;

    if (eagerCompile) {
      try {
        this._compile();
      } catch (err) {
        throw lib._prettifyError(this.path, this.env.opts.dev, err);
      }
    } else {
      this.compiled = false;
    }
  }

  render(ctx, parentFrame, cb?) {
    if (typeof ctx === 'function') {
      cb = ctx;
      ctx = {};
    } else if (typeof parentFrame === 'function') {
      cb = parentFrame;
      parentFrame = null;
    }

    // If there is a parent frame, we are being called from internal
    // code of another template, and the internal system
    // depends on the sync/async nature of the parent template
    // to be inherited, so force an async callback
    const forceAsync: boolean = !parentFrame;

    // Catch compile errors for async rendering
    try {
      this.compile();
    } catch (e) {
      const err = lib._prettifyError(this.path, this.env.opts.dev, e);
      if (cb) {
        return callbackAsap(cb, err);
      } else {
        throw err;
      }
    }

    const context: Context = new Context(ctx || {}, this.blocks, this.env);
    const frame = parentFrame ? parentFrame.push(true) : new Frame();
    frame.topLevel = true;
    let syncResult = null;
    let didError: boolean = false;

    this.rootRenderFunc(this.env, context, frame, globalRuntime, (err, res): void => {
      // TODO: this is actually a bug in the compiled template (because waterfall
      // tasks are both not passing errors up the chain of callbacks AND are not
      // causing a return from the top-most render function). But fixing that
      // will require a more substantial change to the compiler.
      if (didError && cb && typeof res !== 'undefined') {
        // prevent multiple calls to cb
        return;
      }

      if (err) {
        err = lib._prettifyError(this.path, this.env.opts.dev, err);
        didError = true;
      }

      if (cb) {
        if (forceAsync) {
          callbackAsap(cb, err, res);
        } else {
          cb(err, res);
        }
      } else {
        if (err) {
          throw err;
        }
        syncResult = res;
      }
    });

    return syncResult;
  }


  getExported(ctx, parentFrame, cb) { // eslint-disable-line consistent-return
    if (typeof ctx === 'function') {
      cb = ctx;
      ctx = {};
    }

    if (typeof parentFrame === 'function') {
      cb = parentFrame;
      parentFrame = null;
    }

    // Catch compile errors for async rendering
    try {
      this.compile();
    } catch (e) {
      if (cb) {
        return cb(e);
      } else {
        throw e;
      }
    }

    const frame = parentFrame ? parentFrame.push() : new Frame();
    frame.topLevel = true;

    // Run the rootRenderFunc to populate the context with exported vars
    const context: Context = new Context(ctx || {}, this.blocks, this.env);
    this.rootRenderFunc(this.env, context, frame, globalRuntime, (err): void => {
      if (err) {
        cb(err, null);
      } else {
        cb(null, context.getExported());
      }
    });
  }

  compile(): void {
    if (!this.compiled) {
      this._compile();
    }
  }

  _compile(): void {
    var props;

    if (this.tmplProps) {
      props = this.tmplProps;
    } else {
      const source: string = compiler.compile(this.tmplStr,
          this.env.asyncFilters,
          this.env.extensionsList,
          this.path,
          this.env.opts);

      const func: Function = new Function(source); // eslint-disable-line no-new-func
      props = func();
    }

    this.blocks = this._getBlocks(props);
    this.rootRenderFunc = props.root;
    this.compiled = true;
  }

  _getBlocks(props): {} {
    var blocks: {} = {};

    lib.keys(props).forEach((k): void => {
      if (k.slice(0, 2) === 'b_') {
        blocks[k.slice(2)] = props[k];
      }
    });

    return blocks;
  }
}

export class Environment extends EmitterObj {
  opts: any;
  private loaders: Loader[];
  private extensions: Record<string, any>;
  extensionsList: any[];
  asyncFilters: any[];
  private tests: Record<string, any>;
  private filters: Record<string, any>;
  globals: any;


  init(loaders, opts): void {
    // The dev flag determines the trace that'll be shown on errors.
    // If set to true, returns the full trace from the error point,
    // otherwise will return trace starting from Template.render
    // (the full trace from within nunjucks may confuse developers using
    //  the library)
    // defaults to false
    opts = this.opts = opts || {};
    this.opts.dev = !!opts.dev;

    // The autoescape flag sets global autoescaping. If true,
    // every string variable will be escaped by default.
    // If false, strings can be manually escaped using the `escape` filter.
    // defaults to true
    this.opts.autoescape = opts.autoescape != null ? opts.autoescape : true;

    // If true, this will make the system throw errors if trying
    // to output a null or undefined value
    this.opts.throwOnUndefined = !!opts.throwOnUndefined;
    this.opts.trimBlocks = !!opts.trimBlocks;
    this.opts.lstripBlocks = !!opts.lstripBlocks;

    this.loaders = [];

    if (!loaders) {
      // The filesystem loader is only available server-side
      if (FileSystemLoader) {
        this.loaders = [new FileSystemLoader('views')];
      } else if (WebLoader) {
        this.loaders = [new WebLoader('/views')];
      }
    } else {
      this.loaders = lib.isArray(loaders) ? loaders : [loaders];
    }

    // It's easy to use precompiled templates: just include them
    // before you configure nunjucks and this will automatically
    // pick it up and use it
    if (typeof window !== 'undefined' && window['nunjucksPrecompiled']) {
      this.loaders.unshift(
          new PrecompiledLoader(window['nunjucksPrecompiled'])
      );
    }

    this._initLoaders();

    this.globals = globals();
    this.filters = {};
    this.tests = {};
    this.asyncFilters = [];
    this.extensions = {};
    this.extensionsList = [];

    lib._entries(filters).forEach(([name, filter]) => this.addFilter(name, filter));
    lib._entries(tests).forEach(([name, test]) => this.addTest(name, test));
  }


  _initLoaders(): void {
    this.loaders.forEach((loader) => {
      // Caching and cache busting
      loader.cache = {};
      if (typeof loader.on === 'function') {
        loader.on('update', (name, fullname) => {
          loader.cache[name] = null;
          this.emit('update', name, fullname, loader);
        });
        loader.on('load', (name, source) => {
          this.emit('load', name, source, loader);
        });
      }
    });
  }


  invalidateCache(): void {
    this.loaders.forEach((loader) => {
      loader.cache = {};
    });
  }


  addExtension(name, extension): Environment {
    extension.__name = name;
    this.extensions[name] = extension;
    this.extensionsList.push(extension);
    return this;
  }


  removeExtension(name): void {
    const extension = this.getExtension(name);
    if (!extension) {
      return;
    }

    this.extensionsList = lib.without(this.extensionsList, extension);
    delete this.extensions[name];
  }


  getExtension(name) {
    return this.extensions[name];
  }


  hasExtension(name): boolean {
    return !!this.extensions[name];
  }


  addGlobal(name, value): Environment {
    this.globals[name] = value;
    return this;
  }


  getGlobal(name) {
    if (typeof this.globals[name] === 'undefined') {
      throw new Error('global not found: ' + name);
    }
    return this.globals[name];
  }


  addFilter(name, func, async?: boolean): Environment {
    const wrapped = func;

    if (async) {
      this.asyncFilters.push(name);
    }
    this.filters[name] = wrapped;
    return this;
  }


  getFilter(name) {
    if (!this.filters[name]) {
      throw new Error('filter not found: ' + name);
    }
    return this.filters[name];
  }


  addTest(name: string, func: Function): Environment {
    this.tests[name] = func;
    return this;
  }


  getTest(name: string): Function {
    if (!this.tests[name]) {
      throw new Error('test not found: ' + name);
    }
    return this.tests[name];
  }


  resolveTemplate(loader, parentName, filename) {
    const isRelative: boolean = (loader.isRelative && parentName) ? loader.isRelative(filename) : false;
    return (isRelative && loader.resolve) ? loader.resolve(parentName, filename) : filename;
  }


  getTemplate(name, eagerCompile?: boolean | ((param1, param2?) => void), parentName?, ignoreMissing?, cb?: (param1, param2?) => void) {
    const that: Environment = this;
    let tmpl = null;
    if (name && name.raw) {
      // this fixes autoescape for templates referenced in symbols
      name = name.raw;
    }

    if (lib.isFunction(parentName)) {
      cb = parentName;
      parentName = null;
      eagerCompile = eagerCompile ?? false;
    }

    if (lib.isFunction(eagerCompile)) {
      cb = eagerCompile as ((param1, param2?) => boolean);
      eagerCompile = false;
    }

    if (name instanceof Template) {
      tmpl = name;
    } else if (typeof name !== 'string') {
      throw new Error('template names must be a string: ' + name);
    } else {
      for (let i = 0; i < this.loaders.length; i++) {
        const loader: Loader = this.loaders[i];
        tmpl = loader.cache[this.resolveTemplate(loader, parentName, name)];
        if (tmpl) {
          break;
        }
      }
    }

    if (tmpl) {
      if (eagerCompile) {
        tmpl.compile();
      }

      if (cb) {
        cb(null, tmpl);
        return undefined;
      } else {
        return tmpl;
      }
    }
    let syncResult: Template;

    const createTemplate: (err, info) => void = (err, info) => {
      if (!info && !err && !ignoreMissing) {
        err = new Error('template not found: ' + name);
      }

      if (err) {
        if (cb) {
          cb(err);
          return;
        } else {
          throw err;
        }
      }
      let newTmpl: Template;
      if (!info) {
        newTmpl = new Template(noopTmplSrc, this, '', eagerCompile as boolean);
      } else {
        newTmpl = new Template(info.src, this, info.path, eagerCompile as boolean);
        if (!info.noCache) {
          info.loader.cache[name] = newTmpl;
        }
      }
      if (cb) {
        cb(null, newTmpl);
      } else {
        syncResult = newTmpl;
      }
    };

    lib.asyncIter(this.loaders, (loader, i, next, done) => {
      function handle(err, src): void {
        if (err) {
          done(err);
        } else if (src) {
          src.loader = loader;
          done(null, src);
        } else {
          next();
        }
      }

      // Resolve name relative to parentName
      name = that.resolveTemplate(loader, parentName, name);

      if (loader.async) {
        loader.getSource(name, handle);
      } else {
        handle(null, loader.getSource(name));
      }
    }, createTemplate);

    return syncResult;
  }


  express(app) {
    return expressApp.express(this, app);
  }


  render(name, ctx, cb) {
    if (lib.isFunction(ctx)) {
      cb = ctx;
      ctx = null;
    }

    // We support a synchronous API to make it easier to migrate
    // existing code to async. This works because if you don't do
    // anything async work, the whole thing is actually run
    // synchronously.
    let syncResult = null;

    this.getTemplate(name, (err, tmpl: Template): void => {
      if (err && cb) {
        callbackAsap(cb, err);
      } else if (err) {
        throw err;
      } else {
        syncResult = tmpl.render(ctx, cb);
      }
    });

    return syncResult;
  }


  renderString(src, ctx, opts, cb) {
    if (lib.isFunction(opts)) {
      cb = opts;
      opts = {};
    }
    opts = opts || {};

    const tmpl: Template = new Template(src, this, opts.path);
    return tmpl.render(ctx, undefined, cb);
  }


  waterfall(tasks, callback, forceAsync) {
    return waterfall(tasks, callback, forceAsync);
  }
}
