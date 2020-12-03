import { NunjucksNode } from './nunjucksNode';



export class TemplateRef extends NunjucksNode {
  get typename(): string { return 'TemplateRef'; }


  public template;


  constructor(lineno: number, colno: number, template) {
    super(lineno, colno, template);
  }


  get fields(): string[] {
    return [ 'template' ];
  }
}
