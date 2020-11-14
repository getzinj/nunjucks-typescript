import { Value } from './value';



export class Literal extends Value<string | number> {
  get typename(): string { return 'Literal'; }


  constructor(lineno: number, colno: number, value: string | number) {
    super(lineno, colno, value);
  }
}
