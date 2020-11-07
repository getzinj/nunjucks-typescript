import { BinOp } from './binOp';



export class Sub extends BinOp {
  get typename(): string { return 'Sub'; }


  constructor(lineno: number, colno: number, node1, node2) {
    super(lineno, colno, node1, node2);
  }
}
