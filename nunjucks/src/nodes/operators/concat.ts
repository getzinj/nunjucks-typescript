import { BinOp } from './binOp';
import { INunjucksNode } from '../INunjucksNode';



export class Concat extends BinOp {
  get typename(): string {
    return 'Concat';
  }


  constructor(lineno: number, colno: number, node1: INunjucksNode, node2: INunjucksNode) {
    super(lineno, colno, node1, node2);
  }
}
