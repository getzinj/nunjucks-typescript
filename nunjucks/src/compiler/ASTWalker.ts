import { IASTWalker } from '../interfaces/IASTWalker';
import { NodeFactory } from '../nodes/nodeFactory';
import { INunjucksNode } from '../nodes/INunjucksNode';
import { NunjucksNode } from '../nodes/nunjucksNode';
import { NunjucksNodeList } from '../nodes/nunjucksNodeList';
import { CallExtension } from '../nodes/callExtension';
import { INodeFactory } from '../nodes/INodeFactory';



export class ASTWalker implements IASTWalker {
  private readonly nodeFactory: INodeFactory = new NodeFactory();

  walk(ast: INunjucksNode,
       func: (ast: INunjucksNode) => INunjucksNode | undefined, depthFirst?: boolean): INunjucksNode {
    if (ast instanceof NunjucksNode) {
      if (!depthFirst) {
        const astT: INunjucksNode | undefined = func(ast);

        if (astT && astT !== ast) {
          return astT;
        }
      }

      if (ast instanceof NunjucksNodeList) {
        const children: INunjucksNode[] = this.mapCOW(ast.children, (node: INunjucksNode): INunjucksNode =>
            this.walk(node, func, depthFirst));

        if (children !== ast.children) {
          ast = this.nodeFactory.createDynamicNode(ast.typename, ast.lineno, ast.colno, children);
        }
      } else if (ast instanceof CallExtension) {
        const args: NunjucksNodeList = this.walk(ast.args, func, depthFirst) as NunjucksNodeList;
        const contentArgs: INunjucksNode[] = this.mapCOW(ast.contentArgs, (node: INunjucksNode): INunjucksNode =>
            this.walk(node, func, depthFirst));

        if (args !== ast.args || contentArgs !== ast.contentArgs) {
          ast = this.nodeFactory.createDynamicNode(ast.typename, ast.extName, ast.prop, args, contentArgs);
        }
      } else {
        const props: INunjucksNode[] = ast.fields.map(<T extends INunjucksNode>(field: string): T => ast[field]);
        const propsT: INunjucksNode[] =
            this.mapCOW(props, (prop: INunjucksNode): INunjucksNode => this.walk(prop, func, depthFirst));

        if (propsT !== props) {
          ast = this.nodeFactory.createDynamicNode(ast.typename, ast.lineno, ast.colno);
          propsT.forEach((prop: INunjucksNode, i: number): void => {
            ast[ast.fields[i]] = prop;
          });
        }
      }

      return depthFirst ? (func(ast) || ast) : ast;
    } else {
      return ast;
    }
  }


  depthWalk(ast: INunjucksNode, func: (node: INunjucksNode) => INunjucksNode): INunjucksNode {
    return this.walk(ast, func, true);
  }


  // copy-on-write version of map
  private mapCOW<T, V>(arr: T[], func: (item: T) => T | V): (T | V)[] {
    let res: (T | V)[] = null;
    for (let i: number = 0; i < arr.length; i++) {
      const item: T | V = func(arr[i]);

      if (item !== arr[i]) {
        if (!res) {
          res = arr.slice();
        }

        res[i] = item;
      }
    }

    return res ?? arr;
  }
}
