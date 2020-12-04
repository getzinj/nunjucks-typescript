import { BinOp } from './binOp';
import { INunjucksNode } from '../INunjucksNode';



export class And extends BinOp {
  get typename(): string {
    return 'And';
  }


  constructor(lineno: number, colno: number, left: INunjucksNode, right: INunjucksNode) {
    super(lineno, colno, left, right);
  }
}
