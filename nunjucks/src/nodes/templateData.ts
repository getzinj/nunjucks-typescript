import { Literal } from './literal';



export class TemplateData extends Literal {
  get typename(): string { return 'TemplateData'; }


  constructor(lineno: number, colno: number, value: string | number) {
    super(lineno, colno, value);
  }
}
