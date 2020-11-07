import { NunjucksNode } from './nunjucksNode';



export class Import extends NunjucksNode {
  get typename(): string { return 'Import'; }

  public template;
  public target;
  public withContext;


  constructor(lineno: number, colno: number, template, target, withContext) {
    super(lineno, colno, template, target, withContext);
  }


  get fields(): string[] {
    return ['template', 'target', 'withContext'];
  }
}
