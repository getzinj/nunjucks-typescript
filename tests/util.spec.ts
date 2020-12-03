import { Environment } from '../nunjucks/src/environment/environment';
import { Template } from '../nunjucks/src/environment/template';
import { Context } from '../nunjucks/src/environment/context';
import { ILoader } from '../nunjucks/src/interfaces/ILoader';
import { IEnvironment } from '../nunjucks/src/interfaces/IEnvironment';
import { IContext } from '../nunjucks/src/interfaces/IContext';
import { IExtensionOption } from '../nunjucks/src/interfaces/IExtensionOption';



((() => {
  /* eslint-disable vars-on-top */
  let isSlim = false;

  let nunjucksFull = require('../nunjucks');
  let nunjucks = nunjucksFull;
  let Loader = nunjucks.FileSystemLoader;
  let templatesPath = 'tests/templates';
  let expect = require('expect.js');
  let precompileString = nunjucksFull.precompileString;

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


  function configureEnvironmentAux(ctx, cb, opts, env: IEnvironment): { ctx, cb, opts, env: IEnvironment | null } {
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
    return {
      ctx,
      cb,
      opts,
      env
    };
  }


  function configureEnvironment(ctx: IContext, cb, opts, env: IEnvironment | null):
      {
        ctx: IContext,
        cb,
        opts,
        loader: ILoader,
        e: IEnvironment
      } {
    const __ret: { ctx; cb; opts; env: IEnvironment } = configureEnvironmentAux(ctx, cb, opts, env);
    ctx = __ret.ctx;
    cb = __ret.cb;
    opts = __ret.opts;
    env = __ret.env;

    opts = opts || {};
    opts.dev = true;

    let loader: ILoader;
    let e: IEnvironment;

    if (isSlim) {
      e = env || new Environment([], opts);
      loader = e.loaders[0];
    } else {
      loader = new Loader(templatesPath);
      e = env || new Environment(loader, opts);
    }
    return {
      ctx: ctx,
      cb: cb,
      opts: opts,
      loader: loader,
      e: e
    };
  }


  function loadFilters(opts, e: IEnvironment): void {
    if (opts.filters) {
      let name: string | number;
      for (name in opts.filters) {
        if (Object.prototype.hasOwnProperty.call(opts.filters, name)) {
          e.addFilter(name, opts.filters[name]);
        }
      }
    }
  }


  function loadAsyncFilters(opts, e: IEnvironment): void {
    if (opts.asyncFilters) {
      let name: string | number;
      for (name in opts.asyncFilters) {
        if (Object.prototype.hasOwnProperty.call(opts.asyncFilters, name)) {
          e.addFilter(name, opts.asyncFilters[name], true);
        }
      }
    }
  }


  function loadExtensions(opts: IExtensionOption, e: IEnvironment): void {
    if (opts.extensions) {
      let name: string | number;
      for (name in opts.extensions) {
        if (Object.prototype.hasOwnProperty.call(opts.extensions, name)) {
          e.addExtension(name, opts.extensions[name]);
        }
      }
    }
  }


  function loadTemplate(str: string, e: IEnvironment, ctx: Record<string, any>, loader: ILoader): { t: ITemplate; ctx: IContext } {
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

    let t: ITemplate;

    if (isSlim) {
      const tmplSource = loader.getSource(tmplName);
      t = new Template(tmplSource.src, e, tmplSource.path);
    } else {
      t = new Template(str, e);
    }
    return { ctx, t };
  }


  function doRender(cb, t: ITemplate, ctx: IContext, opts): string | undefined {
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
  function render(str: string, ctx: IContext, opts, env, cb?) {
    const environmentConfig: { ctx; cb; opts; loader: ILoader; e: IEnvironment } = configureEnvironment(ctx, cb, opts, env);
    ctx = environmentConfig.ctx;

    loadFilters(environmentConfig.opts, environmentConfig.e);
    loadAsyncFilters(environmentConfig.opts, environmentConfig.e);
    loadExtensions(environmentConfig.opts, environmentConfig.e);

    const __ret: { t: ITemplate; ctx: IContext } = loadTemplate(str, environmentConfig.e, ctx, environmentConfig.loader);
    ctx = __ret.ctx;

    return doRender(environmentConfig.cb, __ret.t, ctx, environmentConfig.opts);
  }


    module.exports.render = render;
    module.exports.equal = equal;
    module.exports.jinjaEqual = jinjaEqual;
    module.exports.finish = finish;
    module.exports.normEOL = normEOL;
    module.exports.isSlim = isSlim;
    module.exports.Loader = Loader;
})());
