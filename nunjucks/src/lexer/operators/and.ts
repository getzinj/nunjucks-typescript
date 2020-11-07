import { BinOp } from './binOp';



export class And extends BinOp {
  get typename(): string { return 'And'; }


  constructor(lineno: number, colno: number, left, right) {
    super(lineno, colno, left, right);
  }
}
