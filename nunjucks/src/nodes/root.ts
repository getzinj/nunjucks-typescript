import { NunjucksNode} from './nunjucksNode';
import { NunjucksNodeList } from './nunjucksNodeList';



export class Root extends NunjucksNodeList {
  get typename(): string { return 'Root'; }


  constructor(lineno: number, colno: number, children: NunjucksNode[]) {
    super(lineno, colno, children);
  }
}
