import { NunjucksNode } from './nunjucksNode';



export class Super extends NunjucksNode {
  get typename(): string { return 'Super'; }

  public blockName;
  public symbol;


  constructor(lineno: number, colno: number, blockName, symbol) {
    super(lineno, colno, blockName, symbol);
  }


  get fields(): string[] {
    return ['blockName', 'symbol'];
  }
}
