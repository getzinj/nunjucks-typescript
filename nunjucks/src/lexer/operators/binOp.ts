import { NunjucksNode } from '../../nodes/nunjucksNode';



export class BinOp extends NunjucksNode {
  get typename(): string { return 'BinOp'; }

  public left;
  public right;


  constructor(lineno: number, colno: number, left, right) {
    super(lineno, colno, left, right);
  }


  get fields(): string[] {
    return ['left', 'right'];
  }
}
