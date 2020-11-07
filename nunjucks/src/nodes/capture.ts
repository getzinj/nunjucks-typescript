import { NunjucksNode } from './nunjucksNode';



export class Capture extends NunjucksNode {
  get typename(): string { return 'Capture'; }

  public body;


  constructor(lineno: number, colno: number, body) {
    super(lineno, colno, body);
  }


  get fields(): string[] {
    return ['body'];
  }
}
