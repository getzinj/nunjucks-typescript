import { BinOp } from './binOp';



export class Pow extends BinOp {
  get typename(): string { return 'Pow'; }


  constructor(lineno: number, colno: number, left, right) {
    super(lineno, colno, left, right);
  }
}
