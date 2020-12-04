import { BinOp } from './binOp';
import { INunjucksNode } from '../INunjucksNode';



export class Div extends BinOp {
  get typename(): string {
    return 'Div';
  }


  constructor(lineno: number, colno: number, left: INunjucksNode, right: INunjucksNode) {
    super(lineno, colno, left, right);
  }
}
