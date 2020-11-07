import { UnaryOp } from './unaryOp';


export class Neg extends UnaryOp {
  get typename(): string { return 'Neg'; }


  constructor(lineno: number, colno: number, target) {
    super(lineno, colno, target);
  }
}
