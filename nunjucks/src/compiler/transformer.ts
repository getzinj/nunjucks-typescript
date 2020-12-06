'use strict';

import { indexOf } from '../lib';
import { Block } from '../nodes/block';
import { IfAsync } from '../nodes/ifAsync';
import { Set } from '../nodes/set';
import { NunjucksSymbol } from '../nodes/nunjucksSymbol';
import { For } from '../nodes/for';
import { AsyncAll } from '../nodes/asyncAll';
import { FilterAsync } from '../nodes/filterAsync';
import { Super } from '../nodes/super';
import { FunCall } from '../nodes/funCall';
import { Filter } from '../nodes/filter';
import { Output } from '../nodes/output';
import { If } from '../nodes/if';
import { AsyncEach } from '../nodes/asyncEach';
import { CallExtensionAsync } from '../nodes/callExtensionAsync';
import { NunjucksNode } from '../nodes/nunjucksNode';
import { Root } from '../nodes/root';
import { Self } from '../nodes/self';
import { NodeFactory } from '../nodes/nodeFactory';
import { CallExtension } from '../nodes/callExtension';
import { NunjucksNodeList } from '../nodes/nunjucksNodeList';
import { INunjucksNode } from '../nodes/INunjucksNode';


export class Transformer {
  sym: number = 0;


  readonly nodeFactory: NodeFactory = new NodeFactory();


  private gensym(): string {
    return 'hole_' + this.sym++;
  }


// copy-on-write version of map
  mapCOW<T, V>(arr: T[], func: (item: T) => T | V): (T | V)[] {
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



  private walk(ast: INunjucksNode, func: (ast: INunjucksNode) => INunjucksNode | undefined, depthFirst?: boolean): INunjucksNode {
    if (ast instanceof NunjucksNode) {
      if (!depthFirst) {
        const astT: INunjucksNode | undefined = func(ast);

        if (astT && astT !== ast) {
          return astT;
        }
      }

      if (ast instanceof NunjucksNodeList) {
        const children: INunjucksNode[] = this.mapCOW(ast.children, (node: INunjucksNode): INunjucksNode => this.walk(node, func, depthFirst));

        if (children !== ast.children) {
          ast = this.nodeFactory.createDynamicNode(ast.typename, ast.lineno, ast.colno, children);
        }
      } else if (ast instanceof CallExtension) {
        const args: NunjucksNodeList = this.walk(ast.args, func, depthFirst) as NunjucksNodeList;
        const contentArgs: INunjucksNode[] = this.mapCOW(ast.contentArgs, (node: INunjucksNode): INunjucksNode => this.walk(node, func, depthFirst));

        if (args !== ast.args || contentArgs !== ast.contentArgs) {
          ast = this.nodeFactory.createDynamicNode(ast.typename, ast.extName, ast.prop, args, contentArgs);
        }
      } else {
        const props: INunjucksNode[] = ast.fields.map(<T extends INunjucksNode>(field: string): T => ast[field]);
        const propsT: INunjucksNode[] = this.mapCOW(props, (prop: INunjucksNode): INunjucksNode => this.walk(prop, func, depthFirst));

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


  private depthWalk(ast: INunjucksNode, func: (node: INunjucksNode) => INunjucksNode): INunjucksNode {
    return this.walk(ast, func, true);
  }


  private _liftFilters(node: CallExtension | Output | Set | For | If, asyncFilters: string[], prop?: string): CallExtension | Output | Set | For | If | NunjucksNodeList {
    const children: INunjucksNode[] = [];

    const walked: INunjucksNode = this.depthWalk(prop ? node[prop] : node, (descNode: Block | NunjucksSymbol | Filter): Block | NunjucksSymbol => {
      let symbol: NunjucksSymbol;
      if (descNode instanceof Block) {
        return descNode;
      } else if ((descNode instanceof Filter &&
          indexOf(asyncFilters, descNode.name.value) !== -1) ||
          descNode instanceof CallExtensionAsync) {
        symbol = new NunjucksSymbol(descNode.lineno,
            descNode.colno,
            this.gensym());

        children.push(new FilterAsync(
            descNode.lineno,
            descNode.colno,
            (descNode as Filter).name,
            (descNode as Filter).args,
            symbol));
      }
      return symbol;
    });

    if (prop) {
      node[prop] = walked;
    } else {
      node = walked as Output | CallExtension | If | For | Set;
    }

    if (children.length) {
      children.push(node);

      return new NunjucksNodeList(
          node.lineno,
          node.colno,
          children
      );
    } else {
      return node;
    }
  }


  private liftFilters(ast: Root, asyncFilters: string[]): INunjucksNode | undefined {
    return this.depthWalk(ast, (node: CallExtension | Output | Set | For | If): NunjucksNodeList | CallExtension | Set | For | If | undefined => {
      if (node instanceof Output) {
        return this._liftFilters(node, asyncFilters);
      } else if (node instanceof Set) {
        return this._liftFilters(node, asyncFilters, 'value');
      } else if (node instanceof For) {
        return this._liftFilters(node, asyncFilters, 'arr');
      } else if (node instanceof If) {
        return this._liftFilters(node, asyncFilters, 'cond');
      } else if (node instanceof CallExtension) {
        return this._liftFilters(node, asyncFilters, 'args');
      } else {
        return undefined;
      }
    });
  }


  private liftSuper(ast: INunjucksNode): INunjucksNode | undefined {
    return this.walk(ast, (blockNode: INunjucksNode): INunjucksNode => {
      if (!(blockNode instanceof Block)) {
        return;
      }

      let hasSuper: boolean = false;
      const symbol: string = this.gensym();

      blockNode.body = this.walk(blockNode.body, (node: INunjucksNode): NunjucksSymbol => { // eslint-disable-line consistent-return
        if (node instanceof FunCall && node.name.value === 'super') {
          hasSuper = true;
          return new NunjucksSymbol(node.lineno, node.colno, symbol);
        }
      });

      if (hasSuper) {
        blockNode.body.children.unshift(new Super(
            0, 0, blockNode.name, new NunjucksSymbol(0, 0, symbol)
        ));
      }
    });
  }


  private liftSelf(ast: INunjucksNode): INunjucksNode | undefined {
    return this.walk(ast, (blockNode: INunjucksNode): NunjucksSymbol => { // eslint-disable-line consistent-return
      if (!(blockNode instanceof Block)) {
        return;
      }

      let hasSelf: boolean = false;
      const symbol: string = this.gensym();
      let blockName: NunjucksSymbol;

      blockNode.body = this.walk(blockNode.body, (node: INunjucksNode): NunjucksSymbol => { // eslint-disable-line consistent-return
        if (node instanceof FunCall && node.name.value === 'self') {
          hasSelf = true;
          blockName = node.args.children[0] as NunjucksSymbol;
          return new NunjucksSymbol(node.lineno, node.colno, symbol);
        }
      });

      if (hasSelf) {
        blockNode.body.children.unshift(new Self(0, 0, blockName, new NunjucksSymbol(0, 0, symbol)));
      }
    });
  }


  private convertStatements(ast): INunjucksNode | undefined {
    return this.depthWalk(ast, (node: INunjucksNode): AsyncEach | undefined | IfAsync => {
      if (!(node instanceof If) && !(node instanceof For)) {
        return undefined;
      }

      let async: boolean = false;
      this.walk(node, (child: INunjucksNode): FilterAsync | IfAsync | AsyncEach | AsyncAll | CallExtensionAsync | undefined => {
        if (child instanceof FilterAsync ||
            child instanceof IfAsync ||
            child instanceof AsyncEach ||
            child instanceof AsyncAll ||
            child instanceof CallExtensionAsync) {
          async = true;
          // Stop iterating by returning the node
          return child;
        }
        return undefined;
      });

      if (async) {
        if (node instanceof If) {
          return new IfAsync(
              node.lineno,
              node.colno,
              node.cond,
              node.body,
              node.else_
          );
        } else if (node instanceof For && !(node instanceof AsyncAll)) {
          return new AsyncEach(
              node.lineno,
              node.colno,
              (node as For).arr,
              (node as For).name,
              (node as For).body,
              (node as For).else_
          );
        }
      }
      return undefined;
    });
  }


  private cps(ast: Root, asyncFilters: string[]): INunjucksNode {
    return this.convertStatements(this.liftSelf(this.liftSuper(this.liftFilters(ast, asyncFilters))));
  }


  public transform(ast: Root, asyncFilters, name?: string): INunjucksNode {
    return this.cps(ast, asyncFilters || []);
  }

// var parser = require('./parser');
// var src = 'hello {% foo %}{% endfoo %} end';
// var ast = transform(parser.parse(src, [new FooExtension()]), ['bar']);
// printNodes(ast);
}
