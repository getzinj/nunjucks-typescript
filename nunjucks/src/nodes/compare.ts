import { NunjucksNode } from './nunjucksNode';
import { INunjucksNode } from './INunjucksNode';



export class Compare extends NunjucksNode {
  get typename(): string { return 'Compare'; }

  public expr: NunjucksNode;
  public ops: NunjucksNode[];


  constructor(lineno: number, colno: number, expr: INunjucksNode, ops: INunjucksNode[]) {
    super(lineno, colno, expr, ops);
  }


  get fields(): string[] {
    return [ 'expr', 'ops' ];
  }
}
