import { BinOp } from './binOp';



export class Concat extends BinOp {
  get typename(): string { return 'Concat'; }


  constructor(lineno: number, colno: number, node1, node2) {
    super(lineno, colno, node1, node2);
  }
}
