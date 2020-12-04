import { BinOp } from './binOp';
import { INunjucksNode } from '../INunjucksNode';



export class Pow extends BinOp {
  get typename(): string {
    return 'Pow';
  }


  constructor(lineno: number, colno: number, left: INunjucksNode, right: INunjucksNode) {
    super(lineno, colno, left, right);
  }
}
