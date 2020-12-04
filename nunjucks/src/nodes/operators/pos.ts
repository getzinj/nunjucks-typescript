import { UnaryOp } from './unaryOp';
import { INunjucksNode } from '../INunjucksNode';



export class Pos extends UnaryOp {
  get typename(): string {
    return 'Pos';
  }


  constructor(lineno: number, colno: number, target: INunjucksNode) {
    super(lineno, colno, target);
  }
}
