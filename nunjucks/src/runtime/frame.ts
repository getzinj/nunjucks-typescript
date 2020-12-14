import { IVariables } from '../interfaces/IVariables';
import { IFrame } from '../interfaces/IFrame';



// Frames keep track of scoping both at compile-time and run-time so
// we know how to access variables. Block tags can introduce special
// variables, for example.
export class Frame implements IFrame {
  public topLevel: boolean = false;
  private readonly variables: IVariables = { };


  /**
   * @param parent
   * @param isolateWrites if this is true, writes (set) should never propagate upwards past
   *     this frame to its parent (though reads may).
   */
  constructor(public readonly parent?: IFrame | undefined, public readonly isolateWrites?: boolean) { }


  public set(name: string, val: string, resolveUp?: boolean): void {
    // Allow variables with dots by automatically creating the
    // nested structure
    const parts: string[] = name.split('.');
    let obj: IVariables = this.variables;
    let frame: IFrame = this;

    if (resolveUp) {
      if ((frame = this.resolve(parts[0], true))) {
        frame.set(name, val);
        return;
      }
    }

    for (let i: number = 0; i < parts.length - 1; i++) {
      const id: string = parts[i];

      if (!obj[id]) {
        obj[id] = { };
      }
      obj = obj[id];
    }

    const lastPart: string = parts[parts.length - 1];
    obj[lastPart] = val;
  }


  public get<T>(name: string): T {
    const val: T | undefined | null = this.variables[name];
    return val ?? null;
  }


  public lookup<T>(name: string): T {
    const p: IFrame = this.parent;
    const val: T = this.variables[name];

    return (val === undefined)
        ? p?.lookup?.(name)
        : val;
  }


  public resolve(name: string, forWrite?: boolean): IFrame | undefined {
    const p: IFrame = (forWrite && this.isolateWrites) ? undefined : this.parent;

    if (this.variables[name] === undefined) {
      return p?.resolve(name);
    } else {
      return this;
    }
  }


  public push(isolateWrites?: boolean): IFrame {
    return new Frame(this, isolateWrites);
  }


  public pop(): IFrame | undefined {
    return this.parent;
  }
}
