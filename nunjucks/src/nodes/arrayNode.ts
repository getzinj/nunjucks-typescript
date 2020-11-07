import { NunjucksNodeList } from './nunjucksNode';



export class ArrayNode extends NunjucksNodeList {

  get typename(): string { return 'ArrayNode'; }


  constructor(lineno: number, colno: number, children?) {
    super(lineno, colno, children);
  }
}
