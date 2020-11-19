import { NunjucksNode } from './nunjucksNode';
import { NunjucksSymbol } from './nunjucksSymbol';



export class Block extends NunjucksNode {
  get typename(): string { return 'Block'; }

  public name: NunjucksSymbol;
  public body;


  constructor(lineno: number, colno: number, name?, body?) {
    super(lineno, colno, name, body);
  }


  get fields(): string[] {
    return ['name', 'body'];
  }
}
