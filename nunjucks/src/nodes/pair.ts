import { NunjucksNode } from './nunjucksNode';
import { INunjucksNode } from './INunjucksNode';



export class Pair extends NunjucksNode {
  get typename(): string { return 'Pair'; }

  public key: INunjucksNode;
  public value: INunjucksNode;


  constructor(lineno: number, colno: number, key: INunjucksNode, value: INunjucksNode) {
    super(lineno, colno, key, value);
  }


  get fields(): string[] {
    return [ 'key', 'value' ];
  }
}
