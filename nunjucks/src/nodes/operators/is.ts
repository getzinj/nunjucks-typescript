import { BinOp } from './binOp';
import { INunjucksNode } from '../INunjucksNode';



export class Is extends BinOp {
  get typename(): string {
    return 'Is';
  }


  constructor(lineno: number, colno: number, left: INunjucksNode, right: INunjucksNode) {
    super(lineno, colno, left, right);
  }
}
