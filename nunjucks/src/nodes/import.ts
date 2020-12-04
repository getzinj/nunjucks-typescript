import { NunjucksNode } from './nunjucksNode';
import { INunjucksNode } from './INunjucksNode';



export class Import extends NunjucksNode {
  get typename(): string { return 'Import'; }

  public template: INunjucksNode;
  public target: INunjucksNode;
  public withContext: boolean;


  constructor(lineno: number, colno: number, template: INunjucksNode, target: INunjucksNode, withContext: boolean) {
    super(lineno, colno, template, target, withContext);
  }


  get fields(): string[] {
    return [ 'template', 'target', 'withContext' ];
  }
}
