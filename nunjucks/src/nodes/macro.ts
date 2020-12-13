import { NunjucksNode } from './nunjucksNode';
import { NunjucksSymbol } from './nunjucksSymbol';
import { NunjucksNodeList } from './nunjucksNodeList';



export class Macro extends NunjucksNode {
  get typename(): string {
    return 'Macro';
  }

  public name: NunjucksSymbol;
  public args: NunjucksNodeList;
  public body;


  constructor(lineno: number, colno: number, name: NunjucksSymbol, args: NunjucksNodeList, body?) {
    super(lineno, colno, name, args, body);
  }


  get fields(): string[] {
    return [ 'name', 'args', 'body' ];
  }
}
