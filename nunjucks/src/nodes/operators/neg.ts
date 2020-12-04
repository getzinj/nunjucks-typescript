import { UnaryOp } from './unaryOp';
import { INunjucksNode } from '../INunjucksNode';


export class Neg extends UnaryOp {
  get typename(): string {
    return 'Neg';
  }


  constructor(lineno: number, colno: number, target: INunjucksNode) {
    super(lineno, colno, target);
  }
}
