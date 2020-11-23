import { NunjucksNode } from '../nunjucksNode';



export class BinOp extends NunjucksNode {
  get typename(): string { return 'BinOp'; }


  constructor(lineno: number, colno: number, public left, public right) {
    super(lineno, colno, left, right);
  }


  get fields(): string[] {
    return ['left', 'right'];
  }
}
