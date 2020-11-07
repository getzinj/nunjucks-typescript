import { If } from './if';



export class IfAsync extends If {
  get typename(): string { return 'IfAsync'; }


  constructor(lineno: number, colno: number, cond?, body?, else_?) {
    super(lineno, colno, cond, body, else_);
  }
}
