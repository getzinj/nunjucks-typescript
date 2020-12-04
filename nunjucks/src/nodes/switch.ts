import { Case } from './case';
import { NunjucksNode } from './nunjucksNode';
import { INunjucksNode } from './INunjucksNode';



export class Switch extends NunjucksNode {
  get typename(): string {
    return 'Switch';
  }

  public default;


  constructor(lineno: number, colno: number, public expr: INunjucksNode, public cases: Case[], defaultCase) {
    super(lineno, colno, expr, cases, defaultCase);
  }


  get fields(): string[] {
    return [ 'expr', 'cases', 'default' ];
  }
}
