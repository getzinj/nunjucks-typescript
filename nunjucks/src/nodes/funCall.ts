import { NunjucksNode } from './nunjucksNode';
import { NunjucksSymbol } from './nunjucksSymbol';
import { NunjucksNodeList } from './nunjucksNodeList';
import { INunjucksNode } from './INunjucksNode';



export class FunCall extends NunjucksNode {
  get typename(): string { return 'FunCall'; }

  public name: NunjucksSymbol;
  public args: NunjucksNodeList;


  constructor(lineno: number, colno: number, name: INunjucksNode, args: NunjucksNodeList, ...additional) {
    super(lineno, colno, name, args, ... additional);
  }


  get fields(): string[] {
    return [ 'name', 'args' ];
  }
}
