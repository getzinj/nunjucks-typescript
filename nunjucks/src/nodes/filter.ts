import { FunCall } from './funCall';
import { NunjucksSymbol } from './nunjucksSymbol';
import { NunjucksNodeList } from './nunjucksNodeList';



export class Filter extends FunCall {
  get typename(): string { return 'Filter'; }


  constructor(lineno: number, colno: number, name: NunjucksSymbol, args: NunjucksNodeList, ... additional) {
    super(lineno, colno, name, args, ... additional);
  }
}
