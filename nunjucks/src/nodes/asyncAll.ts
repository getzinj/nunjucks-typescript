import { For } from './for';



export class AsyncAll extends For {
  get typename(): string { return 'AsyncAll'; }


  constructor(lineno: number, colno: number, arr?: string[], name?, body?, else_?) {
    super(lineno, colno, arr, name, body, else_);
  }
}
