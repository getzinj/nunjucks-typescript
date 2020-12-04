import { NunjucksNode } from '../nunjucksNode';
import { INunjucksNode } from '../INunjucksNode';



export abstract class UnaryOp extends NunjucksNode {
  get typename(): string { return 'UnaryOp'; }


  protected constructor(lineno: number, colno: number, public readonly target: INunjucksNode) {
    super(lineno, colno, target);
  }


  get fields(): string[] {
    return [ 'target' ];
  }
}
