import { Value } from './value';



export class NunjucksSymbol extends Value {
  get typename(): string { return 'NunjucksSymbol'; }


  constructor(lineno: number, colno: number, value) {
    super(lineno, colno, value);
  }
}
