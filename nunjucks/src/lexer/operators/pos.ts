import { NunjucksNode } from 'nunjucks/src/nodes/nunjucksNode';
import { UnaryOp } from './unaryOp';



export class Pos extends UnaryOp {
  get typename(): string {
    return 'Pos';
  }


  constructor(lineno: number, colno: number, target: NunjucksNode) {
    super(lineno, colno, target);
  }
}
