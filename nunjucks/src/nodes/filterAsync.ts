import { Filter } from './filter';
import { NunjucksSymbol } from './nunjucksSymbol';
import { NunjucksNodeList } from './nunjucksNodeList';



export class FilterAsync extends Filter {
  get typename(): string { return 'FilterAsync'; }

  public symbol: NunjucksSymbol;


  constructor(lineno: number, colno: number, name: NunjucksSymbol, args: NunjucksNodeList, symbol: NunjucksSymbol) {
    super(lineno, colno, name, args, symbol);
  }


  get fields(): string[] {
    return [ 'name', 'args', 'symbol' ];
  }
}
