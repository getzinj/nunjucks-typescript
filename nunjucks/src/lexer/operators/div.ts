import { BinOp } from './binOp';



export class Div extends BinOp {
  get typename(): string { return 'Div'; }


  constructor(lineno: number, colno: number, left, right) {
    super(lineno, colno, left, right);
  }
}
