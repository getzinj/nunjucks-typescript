import { UnaryOp } from './unaryOp';



export class Pos extends UnaryOp {
  get typename(): string { return 'Pos'; }


  constructor(lineno: number, colno: number, target) {
    super(lineno, colno, target);
  }
}
