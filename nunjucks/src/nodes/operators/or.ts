import { BinOp } from './binOp';
import { INunjucksNode } from '../INunjucksNode';



export class Or extends BinOp {
  get typename(): string {
    return 'Or';
  }


  constructor(lineno: number, colno: number, left: INunjucksNode, right: INunjucksNode) {
    super(lineno, colno, left, right);
  }
}
