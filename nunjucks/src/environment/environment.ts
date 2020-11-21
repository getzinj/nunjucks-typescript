'use strict';


import * as expressApp from './express-app';
import * as tests from './tests';
import * as filters from './filters/filters';
import * as lib from '../lib';
import waterfall from 'a-sync-waterfall';
import { Loader } from '../loaders/loader';
import { WebLoader, PrecompiledLoader } from '../loaders/web-loaders';
import { globals } from './globals';
import { noopTmplSrc } from './noopTmplSrc';
import { callbackAsap } from './callbackAsap';
import { EmitterObj } from '../object/emitterObj';
import { FileSystemLoader } from '../loaders/file-system-loader';
import { IExtension } from '../compiler/parser/IExtension';
import { IEnvironmentOptions } from './IEnvironmentOptions';
import { IFilterFunction } from './IFilterFunction';
import { ILoader } from './ILoader';
import { IEnvironment } from './IEnvironment';
import { Template } from './template';



export class Environment extends EmitterObj implements IEnvironment {
  opts: IEnvironmentOptions;
  loaders: ILoader[ ];
  private readonly extensions;
  extensionsList: IExtension[];
  asyncFilters: string[];
  private readonly tests: Record<string, any>;
  private readonly filters: Record<string, IFilterFunction>;
  globals;


  constructor(loaders?: ILoader | ILoader[], opts?: IEnvironmentOptions) {
    super();

    // The dev flag determines the trace that'll be shown on errors.
    // If set to true, returns the full trace from the error point,
    // otherwise will return trace starting from Template.render
    // (the full trace from within nunjucks may confuse developers using
    //  the library)
    // defaults to false
    opts = this.opts = opts || { };
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

    this.loaders = [ ];

    if (!loaders) {
      // The filesystem loader is only available server-side
      if (FileSystemLoader) {
        this.loaders = [ new FileSystemLoader('views') ];
      } else if (WebLoader) {
        this.loaders = [ new WebLoader('/views') ];
      }
    } else {
      this.loaders = lib.isArray(loaders) ? loaders : [ loaders ];
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
    this.filters = { };
    this.tests = { };
    this.asyncFilters = [ ];
    this.extensions = { };
    this.extensionsList = [ ];

    lib._entries(filters).forEach(([name, filter]): Environment => this.addFilter(name, filter));
    lib._entries(tests).forEach(([name, test]): Environment => this.addTest(name, test));
  }


  _initLoaders(): void {
    this.loaders.forEach((loader: Loader): void => {
      // Caching and cache busting
      loader.cache = { };
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
    this.loaders.forEach((loader: Loader): void => {
      loader.cache = { };
    });
  }


  addExtension(name, extension: IExtension): Environment {
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


  addFilter(name: string, func: IFilterFunction, async?: boolean): Environment {
    const wrapped: IFilterFunction = func;

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


  getTemplate(name,
              eagerCompile?: boolean | ((param1, param2?) => void),
              parentName?: (param1, param2?) => void,
              ignoreMissing?: boolean,
              cb?: (param1, param2?) => void) {
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
        const loader: ILoader = this.loaders[i];
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

    const createTemplate: (err, info) => void = (err, info): void => {
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

    lib.asyncIter(this.loaders, (loader: Loader, i: number, next, done: (err?, src?) => void): void => {
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

      if (loader['async']) {
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


  render(name: string, ctx, cb?): string {
    if (lib.isFunction(ctx)) {
      cb = ctx;
      ctx = null;
    }

    // We support a synchronous API to make it easier to migrate
    // existing code to async. This works because if you don't do
    // anything async work, the whole thing is actually run
    // synchronously.
    let syncResult: string = null;

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


  renderString(src, ctx, opts, cb?): string {
    if (lib.isFunction(opts)) {
      cb = opts;
      opts = { };
    }
    opts = opts || { };

    const tmpl: Template = new Template(src, this, opts.path);
    return tmpl.render(ctx, undefined, cb);
  }


  waterfall(tasks, callback, forceAsync) {
    return waterfall(tasks, callback, forceAsync);
  }
}
