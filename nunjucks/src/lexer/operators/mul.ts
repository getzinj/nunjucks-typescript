import { BinOp } from './binOp';



export class Mul extends BinOp {
  get typename(): string { return 'Mul'; }


  constructor(lineno: number, colno: number, left, right) {
    super(lineno, colno, left, right);
  }
}
