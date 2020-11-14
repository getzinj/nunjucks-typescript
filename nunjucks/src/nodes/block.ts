import { NunjucksNode } from './nunjucksNode';



export class Block extends NunjucksNode {
  get typename(): string { return 'Block'; }

  public name: NunjucksNode;
  public body;


  constructor(lineno: number, colno: number, name?, body?) {
    super(lineno, colno, name, body);
  }


  get fields(): string[] {
    return ['name', 'body'];
  }
}
