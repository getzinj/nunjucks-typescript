import { NunjucksNode } from './nunjucksNode';
import { NunjucksNodeList } from './nunjucksNodeList';
import { INunjucksNode } from './INunjucksNode';



export class Case extends NunjucksNode {
  get typename(): string {
    return 'Case';
  }

  public cond: NunjucksNode;
  public body: NunjucksNodeList;


  constructor(lineno: number, colno: number, cond: INunjucksNode, body: NunjucksNodeList) {
    super(lineno, colno, cond, body);
  }


  get fields(): string[] {
    return [ 'cond', 'body' ];
  }
}
