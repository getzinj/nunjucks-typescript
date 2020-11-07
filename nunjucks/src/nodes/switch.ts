import { NunjucksNode } from './nunjucksNode';



export class Switch extends NunjucksNode {
  get typename(): string { return 'Switch'; }

  public expr;
  public cases;
  public default;


  constructor(lineno: number, colno: number, expr, cases, defaultCase) {
    super(lineno, colno, expr, cases, defaultCase);
  }


  get fields(): string[] {
    return ['expr', 'cases', 'default'];
  }
}
