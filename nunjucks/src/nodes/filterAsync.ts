import { Filter } from './filter';
import { NunjucksNodeList } from './nunjucksNode';
import { NunjucksSymbol } from './nunjucksSymbol';



export class FilterAsync extends Filter {
  get typename(): string { return 'FilterAsync'; }

  public symbol;


  constructor(lineno: number, colno: number, name: NunjucksSymbol, args: NunjucksNodeList, symbol: NunjucksSymbol) {
    super(lineno, colno, name, args, symbol);
  }


  get fields(): string[] {
    return ['name', 'args', 'symbol'];
  }
}
