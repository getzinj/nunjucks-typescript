import { Value } from './value';



export class Literal extends Value {
  get typename(): string { return 'Literal'; }


  constructor(lineno: number, colno: number, value) {
    super(lineno, colno, value);
  }
}
