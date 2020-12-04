import { NunjucksNode } from './nunjucksNode';
import { INunjucksNode } from './INunjucksNode';



export class CompareOperand extends NunjucksNode {
  get typename(): string { return 'CompareOperand'; }

  public expr: INunjucksNode;
  public type;

  constructor(lineno: number, colno: number, expr: INunjucksNode, type) {
    super(lineno, colno, expr, type);
  }


  get fields(): string[] {
    return [ 'expr', 'type' ];
  }
}
