import { NunjucksNodeList } from './nunjucksNode';



export class Dict extends NunjucksNodeList {
  get typename(): string { return 'Dict'; }


  constructor(lineno: number, colno: number, children?) {
    super(lineno, colno, children);
  }
}
