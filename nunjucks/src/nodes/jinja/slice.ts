import { NunjucksNode } from '../nunjucksNode';
import { Literal } from '../literal';



export class Slice extends NunjucksNode {
  get typename(): string { return 'Slice'; }

  public start;
  public stop;
  public step;


  constructor(lineno: number, colno: number, start?, stop?, step?) {
    super(lineno, colno,
        start || new Literal(lineno, colno, null),
        stop || new Literal(lineno, colno, null),
        step || new Literal(lineno, colno, 1));
  }


  get fields(): string[] {
    return ['start', 'stop', 'step'];
  }
}
