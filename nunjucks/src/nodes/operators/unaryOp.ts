import { NunjucksNode } from '../nunjucksNode';



export abstract class UnaryOp extends NunjucksNode {
  get typename(): string { return 'UnaryOp'; }

  public target;


  protected constructor(lineno: number, colno: number, target: NunjucksNode) {
    super(lineno, colno, target);
  }


  get fields(): string[] {
    return [ 'target' ];
  }
}
