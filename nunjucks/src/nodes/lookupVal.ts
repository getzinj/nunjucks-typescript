import { NunjucksNode } from './nunjucksNode';



export class LookupVal extends NunjucksNode {
  get typename(): string { return 'LookupVal'; }

  public target: NunjucksNode;
  public val: NunjucksNode;


  constructor(lineno: number, colno: number, target: NunjucksNode, val: NunjucksNode) {
    super(lineno, colno, target, val);
  }


  get fields(): string[] {
    return [ 'target', 'val' ];
  }
}
