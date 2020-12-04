import { NunjucksNode } from './nunjucksNode';
import { NunjucksNodeList } from './nunjucksNodeList';
import { INunjucksNode } from './INunjucksNode';



export class FromImport extends NunjucksNode {
  get typename(): string { return 'FromImport'; }

  public template: NunjucksNode;
  public names: NunjucksNodeList;
  public withContext: boolean;


  constructor(lineno: number, colno: number, template: INunjucksNode, names: NunjucksNodeList, withContext: boolean) {
    super(lineno, colno, template, names || new NunjucksNodeList(lineno, colno, undefined), withContext);
  }


  get fields(): string[] {
    return [ 'template', 'names', 'withContext' ];
  }
}
