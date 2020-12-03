import { INunjucksNodeList } from './INunjucksNodeList';
import { INunjucksNode } from './INunjucksNode';
import { NunjucksNode } from './nunjucksNode';



export class NunjucksNodeList extends NunjucksNode implements INunjucksNodeList {
  get typename(): string {
    return 'NunjucksNodeList';
  }


  constructor(lineno: number, colno: number, nodes?: INunjucksNode[]) {
    super(lineno, colno, nodes ?? []);
  }


  addChild(node: INunjucksNode): void {
    this.children.push(node);
  }


  get fields(): string[] {
    return [ 'children' ];
  }


  findAll<T>(type, results?: T[]): T[] {
    results = results || [];

    this.children.forEach((child: NunjucksNode): void => this.traverseAndCheck(child, type, results));

    return results;
  }
}
