import { NunjucksNode } from 'nunjucks/src/nodes/nunjucksNode';
import { BinOp } from './binOp';



export class Is extends BinOp {
  get typename(): string {
    return 'Is';
  }


  constructor(lineno: number, colno: number, left: NunjucksNode, right: NunjucksNode) {
    super(lineno, colno, left, right);
  }
}
