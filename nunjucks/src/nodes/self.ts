import { NunjucksNode } from './nunjucksNode';
import { NunjucksSymbol } from './nunjucksSymbol';



export class Self extends NunjucksNode {
  get typename(): string {
    return 'Self';
  }


  constructor(lineno: number, colno: number, public blockName: NunjucksSymbol, public symbol: NunjucksSymbol) {
    super(lineno, colno, blockName, symbol);
  }


  get fields(): string[] {
    return ['blockName', 'symbol'];
  }
}
