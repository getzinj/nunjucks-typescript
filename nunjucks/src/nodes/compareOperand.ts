import { NunjucksNode } from './nunjucksNode';



export class CompareOperand extends NunjucksNode {
  get typename(): string { return 'CompareOperand'; }

  public expr: NunjucksNode;
  public type;

  constructor(lineno: number, colno: number, expr: NunjucksNode, type) {
    super(lineno, colno, expr, type);
  }


  get fields(): string[] {
    return [ 'expr', 'type' ];
  }
}
