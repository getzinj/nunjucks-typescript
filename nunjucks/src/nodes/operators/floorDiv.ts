import { NunjucksNode } from 'nunjucks/src/nodes/nunjucksNode';
import { BinOp } from './binOp';



export class FloorDiv extends BinOp {
  get typename(): string {
    return 'FloorDiv';
  }


  constructor(lineno: number, colno: number, left: NunjucksNode, right: NunjucksNode) {
    super(lineno, colno, left, right);
  }
}
