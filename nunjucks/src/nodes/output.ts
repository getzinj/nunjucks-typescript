import { NunjucksNodeList } from './nunjucksNodeList';



export class Output extends NunjucksNodeList {
  get typename(): string { return 'Output'; }


  constructor(lineno: number, colno: number, children) {
    super(lineno, colno, children);
  }
}
