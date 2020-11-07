import { NunjucksNode } from './nunjucksNode';



export class If extends NunjucksNode {
  get typename(): string { return 'If'; }

  public cond;
  public body;
  public else_;


  constructor(lineno: number, colno: number, cond?, body?, else_?) {
    super(lineno, colno, cond, body, else_);
  }


  get fields(): string[] {
    return ['cond', 'body', 'else_'];
  }
}
