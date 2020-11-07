import { NunjucksNode } from './nunjucksNode';



export class Macro extends NunjucksNode {
  get typename(): string { return 'Macro'; }

  public name;
  public args;
  public body;


  constructor(lineno: number, colno: number, name, args, body?) {
    super(lineno, colno, name, args, body);
  }


  get fields(): string[] {
    return ['name', 'args', 'body'];
  }
}
