import { NunjucksNode } from './nunjucksNode';



export class Case extends NunjucksNode {
  get typename(): string { return 'Case'; }

  public cond;
  public body;

  constructor(lineno: number, colno: number, cond, body) {
    super(lineno, colno, cond, body);
  }


  get fields(): string[] {
    return ['cond', 'body'];
  }
}
