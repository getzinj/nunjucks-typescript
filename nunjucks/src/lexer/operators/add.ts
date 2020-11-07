import { BinOp } from './binOp';



export class Add extends BinOp {
  get typename(): string { return 'Add'; }


  constructor(lineno: number, colno: number, left, right) {
    super(lineno, colno, left, right);
  }
}
