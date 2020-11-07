import { NunjucksNode } from './nunjucksNode';



export class Set extends NunjucksNode {
  get typename(): string { return 'Set'; }


  public body;
  public targets;
  public value;


  constructor(lineno: number, colno: number, targets?, value?) {
    super(lineno, colno, targets, value);
  }


  get fields(): string[] {
    return ['targets', 'value', 'body'];
  }
}
