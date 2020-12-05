import { IContext } from '../interfaces/IContext';
import { IEnvironment } from '../interfaces/IEnvironment';
import { IBlocks } from '../interfaces/IBlocks';
import { keys, indexOf, extend } from '../lib';
import { IBlockFunction } from '../interfaces/IBlockFunction';
import { Frame } from '../runtime/frame';
import { Environment } from './environment';



export class Context implements IContext {
  private env?: IEnvironment;
  private exported?: string[];
  private readonly ctx?: IContext;
  private readonly blocks: IBlocks;


  constructor(ctx: IContext, blocks: IBlocks, env: IEnvironment) {
    // Has to be tied to an environment so we can tap into its globals.
    this.env = env ?? new Environment();

    // Make a duplicate of ctx
    this.ctx = extend({}, ctx);

    this.blocks = {};
    this.exported = [];

    keys(blocks).forEach((name: string): void => {
      this.addBlock(name, blocks[name]);
    });
  }


  lookup<T>(name: string): T {
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


  addBlock(name: string, block: IBlockFunction): this {
    this.blocks[name] = this.blocks[name] ?? [];
    this.blocks[name].push(block);
    return this;
  }


  getBlock(name: string): IBlockFunction {
    if (!this.blocks[name]) {
      throw new Error('unknown block "' + name + '"');
    }

    return this.blocks[name][0];
  }


  public getSuper(env: Environment, name: string, block: IBlockFunction, frame: Frame, runtime, cb): void {
    const idx: number = indexOf(this.blocks[name] ?? [], block);
    const blk: IBlockFunction = this.blocks[name][idx + 1];
    const context: Context = this;

    if (idx === -1 || !blk) {
      throw new Error('no super block available for "' + name + '"');
    }

    blk(env, context, frame, runtime, cb);
  }


  public getSelf(env: Environment,
                 name: string,
                 block: IBlockFunction,
                 frame: Frame,
                 runtime,
                 cb: (...args: any[]) => void): void {
    const idx: number = indexOf(this.blocks[name] ?? [], block);
    const blk: IBlockFunction = this.blocks[name][idx];
    const context: Context = this;

    if (!blk) {
      throw new Error('no self block available for "' + name + '"');
    }

    blk(env, context, frame, runtime, cb);
  }


  addExport(name: string): void {
    this.exported.push(name);
  }


  getExported(): {} {
    const exported: {} = {};
    this.exported.forEach((name: string): void => {
      exported[name] = this.ctx[name];
    });
    return exported;
  }
}
