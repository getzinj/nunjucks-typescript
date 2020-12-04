import { BinOp } from './binOp';
import { INunjucksNode } from '../INunjucksNode';



export class Add extends BinOp {
  get typename(): string {
    return 'Add';
  }


  constructor(lineno: number, colno: number, left: INunjucksNode, right: INunjucksNode) {
    super(lineno, colno, left, right);
  }
}
