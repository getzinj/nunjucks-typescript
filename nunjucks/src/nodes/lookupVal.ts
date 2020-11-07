import { NunjucksNode } from './nunjucksNode';



export class LookupVal extends NunjucksNode {
  get typename(): string { return 'LookupVal'; }

  public target;
  public val;


  constructor(lineno: number, colno: number, target, val) {
    super(lineno, colno, target, val);
  }


  get fields(): string[] {
    return [ 'target', 'val' ];
  }
}
