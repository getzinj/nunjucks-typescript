import { UnaryOp } from './unaryOp';
import { INunjucksNode } from '../INunjucksNode';



export class Not extends UnaryOp {
  get typename(): string {
    return 'Not';
  }


  constructor(lineno: number, colno: number, target: INunjucksNode) {
    super(lineno, colno, target);
  }
}
