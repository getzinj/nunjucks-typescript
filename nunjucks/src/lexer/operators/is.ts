import { BinOp } from './binOp';



export class Is extends BinOp {
  get typename(): string { return 'Is'; }


  constructor(lineno: number, colno: number, left, right) {
    super(lineno, colno, left, right);
  }
}
