import { NunjucksNode } from 'nunjucks/src/nodes/nunjucksNode';
import { BinOp } from './binOp';



export class And extends BinOp {
  get typename(): string {
    return 'And';
  }


  constructor(lineno: number, colno: number, left: NunjucksNode, right: NunjucksNode) {
    super(lineno, colno, left, right);
  }
}
