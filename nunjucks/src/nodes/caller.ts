import { Macro } from './macro';
import { NunjucksNodeList } from './nunjucksNode';
import { NunjucksSymbol } from './nunjucksSymbol';



export class Caller extends Macro {
  get typename(): string {
    return 'Caller';
  }


  constructor(lineno: number, colno: number, name: NunjucksSymbol, args: NunjucksNodeList, body: NunjucksNodeList) {
    super(lineno, colno, name, args, body);
  }
}
