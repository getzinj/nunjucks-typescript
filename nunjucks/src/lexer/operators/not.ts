import { NunjucksNode } from 'nunjucks/src/nodes/nunjucksNode';
import { UnaryOp } from './unaryOp';



export class Not extends UnaryOp {
  get typename(): string {
    return 'Not';
  }


  constructor(lineno: number, colno: number, target: NunjucksNode) {
    super(lineno, colno, target);
  }
}
