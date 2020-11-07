import { NunjucksNodeList } from './nunjucksNode';



export class Group extends NunjucksNodeList {
  get typename(): string { return 'Group'; }


  constructor(lineno: number, colno: number, children?) {
    super(lineno, colno, children);
  }
}
