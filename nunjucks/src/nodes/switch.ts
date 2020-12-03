import { Case } from './case';
import { NunjucksNode } from './nunjucksNode';



export class Switch extends NunjucksNode {
  get typename(): string {
    return 'Switch';
  }

  public default;


  constructor(lineno: number, colno: number, public expr: NunjucksNode, public cases: Case[], defaultCase) {
    super(lineno, colno, expr, cases, defaultCase);
  }


  get fields(): string[] {
    return [ 'expr', 'cases', 'default' ];
  }
}
