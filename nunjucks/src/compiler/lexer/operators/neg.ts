import { NunjucksNode } from 'nunjucks/src/nodes/nunjucksNode';
import { UnaryOp } from './unaryOp';


export class Neg extends UnaryOp {
  get typename(): string {
    return 'Neg';
  }


  constructor(lineno: number, colno: number, target: NunjucksNode) {
    super(lineno, colno, target);
  }
}
