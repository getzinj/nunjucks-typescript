import { NunjucksNode, NunjucksNodeList } from './nunjucksNode';



export class Case extends NunjucksNode {
  get typename(): string {
    return 'Case';
  }

  public cond: NunjucksNode;
  public body: NunjucksNodeList;


  constructor(lineno: number, colno: number, cond: NunjucksNode, body: NunjucksNodeList) {
    super(lineno, colno, cond, body);
  }


  get fields(): string[] {
    return ['cond', 'body'];
  }
}
