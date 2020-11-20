export class NunjucksNode {
  public children: NunjucksNode[] | undefined;
  readonly lineno: number;
  readonly colno: number;

  get typename(): string { return 'NunjucksNode'; }
  get fields(): string[] { return [ ]; }


  constructor(lineno: number, colno: number,  ...args: any[]) {
    this.lineno = lineno;
    this.colno = colno;
    this.assignValuesToFields(args);
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

    this.fields.forEach( (field: string): void => traverseAndCheck(this[field], type, results) );

    return results;
  }


  iterFields(func): void {
    this.fields.forEach((field: string): void => {
      func(this[field], field);
    });
  }
}



export class NunjucksNodeList extends NunjucksNode {
  get typename(): string {
    return 'NunjucksNodeList';
  }


  constructor(lineno: number, colno: number, nodes?: NunjucksNode[]) {
    super(lineno, colno, nodes ?? []);
  }


  addChild(node: NunjucksNode): void {
    this.children.push(node);
  }


  get fields(): string[] {
    return ['children'];
  }


  findAll<T>(type, results?: T[]): T[] {
    results = results || [];

    this.children.forEach((child: NunjucksNode) => traverseAndCheck(child, type, results));

    return results;
  }
}


export class CallExtension extends NunjucksNode {
  get typename(): string {
    return 'CallExtension';
  }

  public extName;
  public prop;
  public args: NunjucksNodeList;
  public contentArgs;
  public autoescape;


  constructor(ext, prop: string, args: NunjucksNodeList, contentArgs) {
    super(undefined, undefined);

    this.extName = ext.__name || ext;
    this.prop = prop;
    this.args = args ?? new NunjucksNodeList(undefined, undefined, undefined);
    this.contentArgs = contentArgs || [];
    this.autoescape = ext.autoescape;
  }


  get fields(): string[] {
    return ['extName', 'prop', 'args', 'contentArgs'];
  }
}


export function traverseAndCheck(obj, type, results): void {
  if (obj instanceof type) {
    results.push(obj);
  }

  if (obj instanceof NunjucksNode) {
    obj.findAll(type, results);
  }
}
