import { BinOp } from './binOp';



export class Or extends BinOp {
  get typename(): string { return 'Or'; }


  constructor(lineno: number, colno: number, left, right) {
    super(lineno, colno, left, right);
  }
}
