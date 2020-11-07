import { UnaryOp } from './unaryOp';



export class Not extends UnaryOp {
  get typename(): string { return 'Not'; }


  constructor(lineno: number, colno: number, target) {
    super(lineno, colno, target);
  }
}
