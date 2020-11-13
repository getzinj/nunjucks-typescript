import { Loader } from 'nunjucks/src/loader';
import { Environment, Template } from '../nunjucks';
import { IExtension } from './compiler.spec';

export interface IExtensionOption {
  extensions: IExtension[];
}


((() => {
  /* eslint-disable vars-on-top */

  'use strict';

  let nunjucks,
      nunjucksFull,
      isSlim = false,
      Environment,
      Loader,
      precompileString,
      templatesPath,
      expect;

  if (typeof window === 'undefined') {
    nunjucks = nunjucksFull = require('../nunjucks');
    Loader = nunjucks.FileSystemLoader;
    templatesPath = 'tests/templates';
    expect = require('expect.js');
  } else {
    nunjucks = window['nunjucks'];
    if (window['nunjucksFull']) {
      isSlim = true;
      nunjucksFull = window['nunjucksFull'];
      // These must be the same for instanceof checks to succeed
      nunjucksFull.runtime.SafeString.prototype = nunjucks.runtime.SafeString.prototype;
    } else {
      nunjucksFull = window['nunjucksFull'] = nunjucks;
    }
    Loader = nunjucksFull.WebLoader;
    templatesPath = '../templates';
    expect = window['expect'];
  }
  precompileString = nunjucksFull.precompileString;
  Environment = nunjucks.Environment;

  let numAsyncs: number;
  let doneHandler: (arg?) => void;


  beforeEach(() => {
    numAsyncs = 0;
    doneHandler = null;
  });


  function equal(str, ctx, opts, str2, env?): void {
    if (typeof ctx === 'string') {
      env = opts;
      str2 = ctx;
      ctx = null;
      opts = {};
    }
    if (typeof opts === 'string') {
      env = str2;
      str2 = opts;
      opts = {};
    }
    opts = opts || {};
    const res = render(str, ctx, opts, env);
    expect(res).to.be(str2);
  }


  function jinjaEqual(str, ctx, str2, env): void {
    const jinjaUninstalls = [ nunjucks.installJinjaCompat() ];
    if (nunjucksFull !== nunjucks) {
      jinjaUninstalls.push(nunjucksFull.installJinjaCompat());
    }
    try {
      return equal(str, ctx, str2, env);
    } finally {
      for (let i = 0; i < jinjaUninstalls.length; i++) {
        jinjaUninstalls[i]();
      }
    }
  }


  function finish(done): void {
    if (numAsyncs > 0) {
      doneHandler = done;
    } else {
      done();
    }
  }


  function normEOL(str: string): string {
    if (!str) {
      return str;
    }
    return str.replace(/\r\n|\r/g, '\n');
  }


  function randomTemplateName(): string {
    const rand: string = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    return rand + '.njk';
  }


  function configureEnvironment_aux(ctx, cb, opts, env: Environment): { ctx, cb, opts, env: Environment | null } {
    if (typeof ctx === 'function') {
      cb = ctx;
      ctx = null;
      opts = null;
      env = null;
    } else if (typeof opts === 'function') {
      cb = opts;
      opts = null;
      env = null;
    } else if (typeof env === 'function') {
      cb = env;
      env = null;
    }
    return {ctx, cb, opts, env};
  }


  function configureEnvironment(ctx, cb, opts, env: Environment | null): { ctx, cb, opts, loader: Loader, e: Environment } {
    const __ret: { ctx; cb; opts; env: Environment } = configureEnvironment_aux(ctx, cb, opts, env);
    ctx = __ret.ctx;
    cb = __ret.cb;
    opts = __ret.opts;
    env = __ret.env;

    opts = opts || {};
    opts.dev = true;

    let loader: Loader;
    let e: Environment;

    if (isSlim) {
      e = env || new Environment([], opts);
      loader = e.loaders[0];
    } else {
      loader = new Loader(templatesPath);
      e = env || new Environment(loader, opts);
    }
    return {ctx, cb, opts, loader, e};
  }


  function loadFilters(opts, e: Environment): void {
    if (opts.filters) {
      let name: string | number;
      for (name in opts.filters) {
        if (Object.prototype.hasOwnProperty.call(opts.filters, name)) {
          e.addFilter(name, opts.filters[name]);
        }
      }
    }
  }


  function loadAsyncFilters(opts, e: Environment): void {
    if (opts.asyncFilters) {
      let name: string | number;
      for (name in opts.asyncFilters) {
        if (Object.prototype.hasOwnProperty.call(opts.asyncFilters, name)) {
          e.addFilter(name, opts.asyncFilters[name], true);
        }
      }
    }
  }


  function loadExtensions(opts: IExtensionOption, e: Environment): void {
    if (opts.extensions) {
      let name: string | number;
      for (name in opts.extensions) {
        if (Object.prototype.hasOwnProperty.call(opts.extensions, name)) {
          e.addExtension(name, opts.extensions[name]);
        }
      }
    }
  }


  function loadTemplate(str: string, e: Environment, ctx: Record<string, any>, loader: Loader): { t: Template; ctx: any } {
    let tmplName: string;
    if (isSlim) {
      tmplName = randomTemplateName();
      const precompileJs = precompileString(str, {
        name: tmplName,
        asFunction: true,
        env: e
      });
      eval(precompileJs); // eslint-disable-line no-eval
    }

    ctx = ctx || {};

    let t: Template;

    if (isSlim) {
      const tmplSource = loader.getSource(tmplName);
      t = new Template(tmplSource.src, e, tmplSource.path);
    } else {
      t = new Template(str, e);
    }
    return { ctx, t };
  }


  function doRender(cb, t, ctx, opts) {
    if (cb) {
      numAsyncs++;
      t.render(ctx, function(err, res): void {
        if (err && !opts.noThrow) {
          throw err;
        }

        try {
          cb(err, normEOL(res));
        } catch (exc) {
          if (doneHandler) {
            doneHandler(exc);
            numAsyncs = 0;
            doneHandler = null;
          } else {
            throw exc;
          }
        }

        numAsyncs--;

        if (numAsyncs === 0 && doneHandler) {
          doneHandler();
        }
      });
    } else {
      return t.render(ctx);
    }
  }


// eslint-disable-next-line consistent-return
  function render(str, ctx, opts, env, cb?) {
    const environmentConfig: { ctx; cb; opts; loader: Loader; e: Environment } = configureEnvironment(ctx, cb, opts, env);
    ctx = environmentConfig.ctx;

    loadFilters(environmentConfig.opts, environmentConfig.e);
    loadAsyncFilters(environmentConfig.opts, environmentConfig.e);
    loadExtensions(environmentConfig.opts, environmentConfig.e);

    const __ret: { t: Template; ctx: Record<string, any> } = loadTemplate(str, environmentConfig.e, ctx, environmentConfig.loader);
    ctx = __ret.ctx;

    return doRender(environmentConfig.cb, __ret.t, ctx, environmentConfig.opts);
  }


  if (typeof window === 'undefined') {
    module.exports.render = render;
    module.exports.equal = equal;
    module.exports.jinjaEqual = jinjaEqual;
    module.exports.finish = finish;
    module.exports.normEOL = normEOL;
    module.exports.isSlim = isSlim;
    module.exports.Loader = Loader;
  } else {
    window['util'] = {
      render: render,
      equal: equal,
      jinjaEqual: jinjaEqual,
      finish: finish,
      normEOL: normEOL,
      isSlim: isSlim,
      Loader: Loader,
    };
  }
})());
