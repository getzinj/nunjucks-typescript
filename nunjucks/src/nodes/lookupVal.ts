import { NunjucksNode } from './nunjucksNode';
import { INunjucksNode } from './INunjucksNode';



export class LookupVal extends NunjucksNode {
  get typename(): string { return 'LookupVal'; }

  public target: INunjucksNode;
  public val: INunjucksNode;


  constructor(lineno: number, colno: number, target: INunjucksNode, val: INunjucksNode) {
    super(lineno, colno, target, val);
  }


  get fields(): string[] {
    return [ 'target', 'val' ];
  }
}
