import { TemplateRef } from './templateRef';



export class Extends extends TemplateRef {
  get typename(): string { return 'Extends'; }


  constructor(lineno: number, colno: number, template?) {
    super(lineno, colno, template);
  }
}
