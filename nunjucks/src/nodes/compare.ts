import { NunjucksNode } from './nunjucksNode';



export class Compare extends NunjucksNode {
  get typename(): string { return 'Compare'; }

  public expr: NunjucksNode;
  public ops: NunjucksNode[];


  constructor(lineno: number, colno: number, expr: NunjucksNode, ops: NunjucksNode[]) {
    super(lineno, colno, expr, ops);
  }


  get fields(): string[] {
    return ['expr', 'ops'];
  }
}
