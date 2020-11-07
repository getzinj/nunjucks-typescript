import { NunjucksNode } from './nunjucksNode';



export class CompareOperand extends NunjucksNode {
  get typename(): string { return 'CompareOperand'; }

  public expr;
  public type;

  constructor(lineno: number, colno: number, expr, type) {
    super(lineno, colno, expr, type);
  }


  get fields(): string[] {
    return ['expr', 'type'];
  }
}
