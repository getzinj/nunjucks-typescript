import { ITemplateClass } from './ITemplateClass';
import { IEnvironment } from './IEnvironment';
import { IBlockFunction } from './IBlockFunction';
import { Frame } from '../runtime/frame';
import * as globalRuntime from '../runtime/runtime';
import * as lib from '../lib';
import { callbackAsap } from './callbackAsap';
import { Compiler } from '../compiler/compiler';
import { IContext } from './IContext';
import { Environment } from './environment';
import { Context } from './context';



export class Template implements ITemplateClass {
  private compiled: boolean;
  private readonly path: string;
  private readonly env: IEnvironment;
  private readonly tmplProps;
  private readonly tmplStr: string;
  private blocks: Record<string, IBlockFunction[]>;
  private rootRenderFunc: (env: IEnvironment,
                           context: IContext,
                           frame: Frame,
                           runtime: typeof globalRuntime,
                           callback:
                               (err: any, info?: any) => void
  ) => void;


  constructor(src, env?: IEnvironment | undefined | null, path?: string, eagerCompile?: boolean) {
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


  render(ctx?: IContext, cb?);
  render(ctx?: IContext, parentFrame?: undefined, cb?);
  render(ctx?: IContext, parentFrame?: Frame, cb?) {
    if (typeof ctx === 'function') {
      cb = ctx;
      ctx = {} as IContext;
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

    const context: IContext = new Context(ctx ?? {}, this.blocks, this.env);
    const frame: Frame = parentFrame ? parentFrame.push(true) : new Frame();
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

    const frame: Frame = parentFrame ? parentFrame.push() : new Frame();
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
    let props;

    if (this.tmplProps) {
      props = this.tmplProps;
    } else {
      const source: string = new Compiler(this.path).compile(this.tmplStr, this.env.asyncFilters, this.env.extensionsList, this.path, this.env.opts);

      try {
        const func: Function = new Function(source); // eslint-disable-line no-new-func
        props = func();
      } catch (e) {
        console.error(`Error compiling source: \n${source}\n`, e);
        throw e;
      }
    }

    this.blocks = this._getBlocks(props);
    this.rootRenderFunc = props.root;
    this.compiled = true;
  }


  _getBlocks(props: { [x: string]: IBlockFunction[]; }): Record<string, IBlockFunction[]> {
    const blocks: Record<string, IBlockFunction[]> = {};

    lib.keys(props).forEach((k: string): void => {
      if (k.slice(0, 2) === 'b_') {
        blocks[k.slice(2)] = props[k];
      }
    });

    return blocks;
  }
}
