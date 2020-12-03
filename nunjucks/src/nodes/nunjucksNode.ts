import { INunjucksNode } from './INunjucksNode';



export abstract class NunjucksNode implements INunjucksNode {
  public children: INunjucksNode[] | undefined;
  readonly lineno: number;
  readonly colno: number;

  get typename(): string { return 'NunjucksNode'; }
  get fields(): string[] { return [ ]; }


  protected constructor(lineno: number, colno: number, ...args: any[]) {
    this.lineno = lineno;
    this.colno = colno;
    this.assignValuesToFields(args);
  }


  protected traverseAndCheck(obj: NunjucksNode, type, results): void {
    if (obj instanceof type) {
      results.push(obj);
    }

    if (obj instanceof NunjucksNode) {
      obj.findAll(type, results);
    }
  }


  private assignValuesToFields(args: any[]): void {
    this.fields.forEach((fieldName: string, i: number): void => {
      // Fields should never be undefined, but null. It makes
      // testing easier to normalize values.
      this[fieldName] = args?.[i] ?? null;
    });
  }


  findAll<T>(type, results?: T[]): T[] {
    results = results ?? [];

    this.fields.forEach( (field: string): void => this.traverseAndCheck(this[field], type, results) );

    return results;
  }


  iterFields(func): void {
    this.fields.forEach((field: string): void => {
      func(this[field], field);
    });
  }
}
