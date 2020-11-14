// Abstract nodes
import { NunjucksNode } from './nunjucksNode';



export abstract class Value<T extends string | number> extends NunjucksNode {
  get typename(): string { return 'Value'; }


  get fields(): string[] {
    return [ 'value' ];
  }

  constructor(lineno: number, colno: number, public readonly value: T) {
    super(lineno, colno, value);
  }
}
