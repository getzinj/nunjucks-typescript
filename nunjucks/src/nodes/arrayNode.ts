import { NunjucksNodeList, NunjucksNode } from './nunjucksNode';



export class ArrayNode extends NunjucksNodeList {

  get typename(): string {
    return 'ArrayNode';
  }


  constructor(lineno: number, colno: number, children?: NunjucksNode[]) {
    super(lineno, colno, children);
  }
}
