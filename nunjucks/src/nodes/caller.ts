import { Macro } from './macro';



export class Caller extends Macro {
  get typename(): string { return 'Caller'; }


  constructor(lineno: number, colno: number, name, args, body) {
    super(lineno, colno, name, args, body);
  }
}
