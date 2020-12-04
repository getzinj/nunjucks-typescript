import { BinOp } from './binOp';
import { INunjucksNode } from '../INunjucksNode';



export class Sub extends BinOp {
  get typename(): string {
    return 'Sub';
  }


  constructor(lineno: number, colno: number, node1: INunjucksNode, node2: INunjucksNode) {
    super(lineno, colno, node1, node2);
  }
}
