import { NunjucksNode } from './nunjucksNode';
import { NunjucksNodeList } from './nunjucksNodeList';



export class Capture extends NunjucksNode {
  get typename(): string {
    return 'Capture';
  }

  public body: NunjucksNodeList;


  constructor(lineno: number, colno: number, body: NunjucksNodeList) {
    super(lineno, colno, body);
  }


  get fields(): string[] {
    return [ 'body' ];
  }
}
