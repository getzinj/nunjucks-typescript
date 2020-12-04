import { BinOp } from './binOp';
import { INunjucksNode } from '../INunjucksNode';



export class FloorDiv extends BinOp {
  get typename(): string {
    return 'FloorDiv';
  }


  constructor(lineno: number, colno: number, left: INunjucksNode, right: INunjucksNode) {
    super(lineno, colno, left, right);
  }
}
