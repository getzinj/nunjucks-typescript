import { BinOp } from './binOp';
import { INunjucksNode } from '../INunjucksNode';



export class Mod extends BinOp {
  get typename(): string {
    return 'Mod';
  }


  constructor(lineno: number, colno: number, left: INunjucksNode, right: INunjucksNode) {
    super(lineno, colno, left, right);
  }
}
