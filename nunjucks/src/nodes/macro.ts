import { NunjucksNode, NunjucksNodeList } from './nunjucksNode';



export class Macro extends NunjucksNode {
  get typename(): string {
    return 'Macro';
  }

  public name: NunjucksNode;
  public args: NunjucksNodeList;
  public body;


  constructor(lineno: number, colno: number, name: NunjucksNode, args: NunjucksNodeList, body?) {
    super(lineno, colno, name, args, body);
  }


  get fields(): string[] {
    return ['name', 'args', 'body'];
  }
}
