// Frames keep track of scoping both at compile-time and run-time so
// we know how to access variables. Block tags can introduce special
// variables, for example.
export class Frame {
  public topLevel: boolean = false;
  private readonly variables: Record<string, any> = { };


  /**
   * @param parent
   * @param isolateWrites if this is true, writes (set) should never propagate upwards past
   *     this frame to its parent (though reads may).
   */
  constructor(public readonly parent?: Frame | undefined, public readonly isolateWrites?: boolean) { }


  set(name: string, val, resolveUp?: boolean): void {
    // Allow variables with dots by automatically creating the
    // nested structure
    if (!name) {
      debugger;
    }
    const parts: string[] = name.split('.');
    let obj = this.variables;
    let frame: Frame = this;

    if (resolveUp) {
      if ((frame = this.resolve(parts[0], true))) {
        frame.set(name, val);
        return;
      }
    }

    for (let i = 0; i < parts.length - 1; i++) {
      const id: string = parts[i];

      if (!obj[id]) {
        obj[id] = { };
      }
      obj = obj[id];
    }

    const lastPart: string = parts[parts.length - 1];
    obj[lastPart] = val;
  }


  get<T>(name: string): T {
    const val: T | undefined = this.variables[name];
    if (val !== undefined) {
      return val;
    }
    return null;
  }


  lookup<T>(name: string): T {
    const p: Frame = this.parent;
    const val = this.variables[name];

    return (val === undefined)
        ? p?.lookup?.(name)
        : val;
  }


  resolve(name: string, forWrite?: boolean): Frame | undefined {
    const p: Frame = (forWrite && this.isolateWrites) ? undefined : this.parent;

    if (this.variables[name] === undefined) {
      return p?.resolve(name);
    } else {
      return this;
    }
  }


  push(isolateWrites?: boolean): Frame {
    return new Frame(this, isolateWrites);
  }


  pop(): Frame | undefined {
    return this.parent;
  }
}
