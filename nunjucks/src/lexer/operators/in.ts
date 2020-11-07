import { BinOp } from './binOp';



export class In extends BinOp {
  get typename(): string { return 'In'; }


  constructor(lineno: number, colno: number, left, right) {
    super(lineno, colno, left, right);
  }
}
