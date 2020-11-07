import { FunCall } from './funCall';
import { NunjucksNodeList } from './nunjucksNode';
import { NunjucksSymbol } from './nunjucksSymbol';



export class Filter extends FunCall {
  get typename(): string { return 'Filter'; }


  constructor(lineno: number, colno: number, name: NunjucksSymbol, args: NunjucksNodeList, ... additional) {
    super(lineno, colno, name, args, ... additional);
  }
}
