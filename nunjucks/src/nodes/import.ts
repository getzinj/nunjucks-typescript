import { NunjucksNode } from './nunjucksNode';



export class Import extends NunjucksNode {
  get typename(): string { return 'Import'; }

  public template: NunjucksNode;
  public target: NunjucksNode;
  public withContext: boolean;


  constructor(lineno: number, colno: number, template: NunjucksNode, target: NunjucksNode, withContext: boolean) {
    super(lineno, colno, template, target, withContext);
  }


  get fields(): string[] {
    return ['template', 'target', 'withContext'];
  }
}
