import { NunjucksNode } from './nunjucksNode';



export class Block extends NunjucksNode {
  get typename(): string { return 'Block'; }

  public name;
  public body;


  constructor(lineno: number, colno: number, name?, body?: any) {
    super(lineno, colno, name, body);
  }


  get fields(): string[] {
    return ['name', 'body'];
  }
}
