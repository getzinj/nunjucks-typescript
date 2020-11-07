import { BinOp } from './binOp';



export class Mod extends BinOp {
  get typename(): string { return 'Mod'; }


  constructor(lineno: number, colno: number, left, right) {
    super(lineno, colno, left, right);
  }
}
