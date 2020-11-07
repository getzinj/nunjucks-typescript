import { Dict } from './dict';



export class KeywordArgs extends Dict {
  get typename(): string { return 'KeywordArgs'; }


  constructor(lineno: number, colno: number, children?) {
    super(lineno, colno, children);
  }
}
