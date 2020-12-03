import { NunjucksNode } from './nunjucksNode';



export class InlineIf extends NunjucksNode {
  get typename(): string { return 'InlineIf'; }

  public cond;
  public body;
  public else_;


  constructor(lineno: number, colno: number, cond?, body?, else_?) {
    super(lineno, colno, cond, body, else_);
  }


  get fields(): string[] {
    return [ 'cond', 'body', 'else_' ];
  }
}
