import { NunjucksNode } from './nunjucksNode';



export class Compare extends NunjucksNode {
  get typename(): string { return 'Compare'; }

  public expr;
  public ops;


  constructor(lineno: number, colno: number, expr, ops) {
    super(lineno, colno, expr, ops);
  }


  get fields(): string[] {
    return ['expr', 'ops'];
  }
}
