import { NunjucksNode } from '../nunjucksNode';



export class BinOp extends NunjucksNode {
  get typename(): string { return 'BinOp'; }

  public left;
  public right;


  constructor(lineno: number, colno: number, left: NunjucksNode, right: NunjucksNode) {
    super(lineno, colno, left, right);
  }


  get fields(): string[] {
    return ['left', 'right'];
  }
}
