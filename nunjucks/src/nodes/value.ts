// Abstract nodes
import { NunjucksNode } from './nunjucksNode';



export abstract class Value extends NunjucksNode {
  get typename(): string { return 'Value'; }


  get fields(): string[] {
    return [ 'value' ];
  }

  constructor(lineno, colno, public readonly value) {
    super(lineno, colno, value);
  }
}
