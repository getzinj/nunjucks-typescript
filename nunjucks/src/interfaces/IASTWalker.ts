import { INunjucksNode } from '../nodes/INunjucksNode';



export interface IASTWalker {
  walk(ast: INunjucksNode,
       func: (ast: INunjucksNode) => INunjucksNode | undefined, depthFirst?: boolean): INunjucksNode;

  depthWalk(ast: INunjucksNode, func: (node: INunjucksNode) => INunjucksNode): INunjucksNode;
}
