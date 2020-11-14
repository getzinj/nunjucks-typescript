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


  findAll(type, results?) {
    results = results ?? [];

    this.fields.forEach( (field: string): void => traverseAndCheck(this[field], type, results) );

    return results;
  }


  iterFields(func) {
    this.fields.forEach((field: string) => {
      func(this[field], field);
    });
  }
}

export class NunjucksNodeList extends NunjucksNode {
  get typename(): string {
    return 'NunjucksNodeList';
  }


  constructor(lineno: number, colno: number, nodes?) {
    super(lineno, colno, nodes ?? []);
  }


  addChild(node: NunjucksNode): void {
    this.children.push(node);
  }


  get fields(): string[] {
    return ['children'];
  }


  findAll(type, results?) {
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
  public args;
  public contentArgs;
  public autoescape;


  constructor(ext, prop, args, contentArgs) {
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


// This is hacky, but this is just a debugging function anyway
export function print(str, indent?, inline?): void {
  var lines = str.split('\n');

  lines.forEach((line, i) => {
    if (line && ((inline && i > 0) || !inline)) {
      process.stdout.write((' ').repeat(indent));
    }
    const nl = (i === lines.length - 1) ? '' : '\n';
    process.stdout.write(`${line}${nl}`);
  });
}


// Print the AST in a nicely formatted tree format for debugging
export function printNodes(node: NunjucksNode, indent): void {
  indent = indent || 0;

  print(node.typename + ': ', indent);

  if (node instanceof NunjucksNodeList) {
    print('\n');
    node.children.forEach((n: NunjucksNode): void => {
      printNodes(n, indent + 2);
    });
  } else if (node instanceof CallExtension) {
    print(`${node.extName}.${node.prop}\n`);

    if (node.args) {
      printNodes(node.args, indent + 2);
    }

    if (node.contentArgs) {
      node.contentArgs.forEach((n: NunjucksNode): void => {
        printNodes(n, indent + 2);
      });
    }
  } else {
    const nodes: [string | number, any][] = [];
    let props: Record<string | number, any> = null;

    node.iterFields((val, fieldName: string | number): void => {
      if (val instanceof NunjucksNode) {
        nodes.push([fieldName, val]);
      } else {
        props = props ?? { };
        props[fieldName] = val;
      }
    });

    if (props) {
      print(JSON.stringify(props, null, 2) + '\n', null, true);
    } else {
      print('\n');
    }

    nodes.forEach( ([fieldName, n]): void => {
      print(`[${fieldName}] =>`, indent + 2);
      printNodes(n, indent + 4);
    } );
  }
}


