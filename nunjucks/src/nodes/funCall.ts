import { NunjucksNode, NunjucksNodeList } from './nunjucksNode';



export class FunCall extends NunjucksNode {
  get typename(): string { return 'FunCall'; }

  public name;
  public args;


  constructor(lineno: number, colno: number, name, args, ... additional) {
    super(lineno, colno, name, args, ... additional);
  }


  get fields(): string[] {
    return ['name', 'args'];
  }
}
