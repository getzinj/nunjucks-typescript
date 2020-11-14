import { NunjucksNode, NunjucksNodeList } from './nunjucksNode';



export class FunCall extends NunjucksNode {
  get typename(): string { return 'FunCall'; }

  public name: NunjucksNode;
  public args: NunjucksNodeList;


  constructor(lineno: number, colno: number, name: NunjucksNode, args: NunjucksNodeList, ...additional) {
    super(lineno, colno, name, args, ... additional);
  }


  get fields(): string[] {
    return ['name', 'args'];
  }
}
