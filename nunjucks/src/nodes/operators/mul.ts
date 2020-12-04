import { BinOp } from './binOp';
import { INunjucksNode } from '../INunjucksNode';



export class Mul extends BinOp {
  get typename(): string {
    return 'Mul';
  }


  constructor(lineno: number, colno: number, left: INunjucksNode, right: INunjucksNode) {
    super(lineno, colno, left, right);
  }
}
