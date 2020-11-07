import { NunjucksNode } from './nunjucksNode';



export class Pair extends NunjucksNode {
  get typename(): string { return 'Pair'; }

  public key;
  public value;


  constructor(lineno: number, colno: number, key: any, value: any) {
    super(lineno, colno, key, value);
  }


  get fields(): string[] {
    return [ 'key', 'value' ];
  }
}
