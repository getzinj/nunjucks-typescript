import { For } from './for';



export class AsyncEach extends For {
  get typename(): string { return 'AsyncEach'; }


  constructor(lineno: number, colno: number, arr?, name?, body?, else_?) {
    super(lineno, colno, arr, name, body, else_);
  }
}
