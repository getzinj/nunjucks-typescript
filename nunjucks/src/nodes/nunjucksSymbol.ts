import { Value } from './value';



export class NunjucksSymbol extends Value<string> {
  get typename(): string { return 'NunjucksSymbol'; }


  constructor(lineno: number, colno: number, value: string) {
    super(lineno, colno, value);
  }
}
