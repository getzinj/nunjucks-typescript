import { NunjucksNode } from './nunjucksNode';



export class Set extends NunjucksNode {
  get typename(): string { return 'Set'; }


  public targets;
  public value;
  public body;


  constructor(lineno: number, colno: number, targets?, value?, body?) {
    super(lineno, colno, targets, value, body);
  }


  get fields(): string[] {
    return ['targets', 'value', 'body'];
  }
}
