import { NunjucksNode } from './nunjucksNode';



export class Include extends NunjucksNode {
  get typename(): string { return 'Include'; }

  public template;
  public ignoreMissing;


  constructor(lineno: number, colno: number, template?, ignoreMissing?) {
    super(lineno, colno, template, ignoreMissing);
  }


  get fields(): string[] {
    return ['template', 'ignoreMissing'];
  }
}
