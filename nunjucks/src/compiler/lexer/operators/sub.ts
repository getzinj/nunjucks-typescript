import { NunjucksNode } from 'nunjucks/src/nodes/nunjucksNode';
import { BinOp } from './binOp';



export class Sub extends BinOp {
  get typename(): string {
    return 'Sub';
  }


  constructor(lineno: number, colno: number, node1: NunjucksNode, node2: NunjucksNode) {
    super(lineno, colno, node1, node2);
  }
}
