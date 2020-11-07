import { NunjucksNode, NunjucksNodeList } from './nunjucksNode';



export class FromImport extends NunjucksNode {
  get typename(): string { return 'FromImport'; }

  public template;
  public names;
  public withContext;


  constructor(lineno: number, colno: number, template, names, withContext) {
    super(lineno, colno, template, names || new NunjucksNodeList(lineno, colno, undefined), withContext);
  }


  get fields(): string[] {
    return ['template', 'names', 'withContext'];
  }
}
