import { NunjucksNode } from './nunjucksNode';



export class Pair extends NunjucksNode {
  get typename(): string { return 'Pair'; }

  public key: NunjucksNode;
  public value: NunjucksNode;


  constructor(lineno: number, colno: number, key: NunjucksNode, value: NunjucksNode) {
    super(lineno, colno, key, value);
  }


  get fields(): string[] {
    return [ 'key', 'value' ];
  }
}
