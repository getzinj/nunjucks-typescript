import { NunjucksNode } from 'nunjucks/src/nodes/nunjucksNode';
import { BinOp } from './binOp';



export class Mul extends BinOp {
  get typename(): string {
    return 'Mul';
  }


  constructor(lineno: number, colno: number, left: NunjucksNode, right: NunjucksNode) {
    super(lineno, colno, left, right);
  }
}
