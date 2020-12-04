import { BinOp } from './binOp';
import { INunjucksNode } from '../INunjucksNode';



export class In extends BinOp {
  get typename(): string {
    return 'In';
  }


  constructor(lineno: number, colno: number, left: INunjucksNode, right: INunjucksNode) {
    super(lineno, colno, left, right);
  }
}
