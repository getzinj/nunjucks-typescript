import { NunjucksNode } from './nunjucksNode';



export class For extends NunjucksNode {
  get typename(): string { return 'For'; }

  public arr;
  public name;
  public body;
  public else_;


  constructor(lineno: number, colno: number, arr?, name?, body?, else_?) {
    super(lineno, colno, arr, name, body, else_);
  }


  get fields(): string[] {
    return ['arr', 'name', 'body', 'else_'];
  }
}
