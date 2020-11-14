import { NunjucksNode } from './nunjucksNode';
import { NunjucksSymbol } from './nunjucksSymbol';



export class Super extends NunjucksNode {
  get typename(): string {
    return 'Super';
  }


  constructor(lineno: number, colno: number, public blockName: NunjucksNode, public symbol: NunjucksSymbol) {
    super(lineno, colno, blockName, symbol);
  }


  get fields(): string[] {
    return ['blockName', 'symbol'];
  }
}
