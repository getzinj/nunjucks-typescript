import { Macro } from './macro';
import { NunjucksSymbol } from './nunjucksSymbol';
import { NunjucksNodeList } from './nunjucksNodeList';



export class Caller extends Macro {
  get typename(): string {
    return 'Caller';
  }


  constructor(lineno: number, colno: number, name: NunjucksSymbol, args: NunjucksNodeList, body: NunjucksNodeList) {
    super(lineno, colno, name, args, body);
  }
}
