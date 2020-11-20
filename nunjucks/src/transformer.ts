'use strict';

import * as lib from './lib';
import { Block } from './nodes/block';
import { IfAsync } from './nodes/ifAsync';
import { Set } from './nodes/set';
import { NunjucksSymbol } from './nodes/nunjucksSymbol';
import { For } from './nodes/for';
import { AsyncAll } from './nodes/asyncAll';
import { FilterAsync } from './nodes/filterAsync';
import { Super } from './nodes/super';
import { FunCall } from './nodes/funCall';
import { Filter } from './nodes/filter';
import { Output } from './nodes/output';
import { If } from './nodes/if';
import { AsyncEach } from './nodes/asyncEach';
import { CallExtensionAsync } from './nodes/callExtensionAsync';
import { NunjucksNode, NunjucksNodeList, CallExtension } from './nodes/nunjucksNode';
import { Add } from './lexer/operators/add';
import { Group } from './nodes/group';
import { Import } from './nodes/import';
import { Or } from './lexer/operators/or';
import { In } from './lexer/operators/in';
import { Macro } from './nodes/macro';
import { Include } from './nodes/include';
import { Is } from './lexer/operators/is';
import { Capture } from './nodes/capture';
import { Case } from './nodes/case';
import { Concat } from './lexer/operators/concat';
import { Literal } from './nodes/literal';
import { Compare } from './nodes/compare';
import { Extends } from './nodes/extends';
import { Pair } from './nodes/pair';
import { InlineIf } from './nodes/inlineIf';
import { Sub } from './lexer/operators/sub';
import { Mod } from './lexer/operators/mod';
import { Root } from './nodes/root';
import { CompareOperand } from './nodes/compareOperand';
import { LookupVal } from './nodes/lookupVal';
import { Mul } from './lexer/operators/mul';
import { FloorDiv } from './lexer/operators/floorDiv';
import { Div } from './lexer/operators/div';
import { FromImport } from './nodes/fromImport';
import { Neg } from './lexer/operators/neg';
import { Not } from './lexer/operators/not';
import { TemplateData } from './nodes/templateData';
import { Switch } from './nodes/switch';
import { Caller } from './nodes/caller';
import { Pos } from './lexer/operators/pos';
import { And } from './lexer/operators/and';
import { Value } from './nodes/value';
import { Pow } from './lexer/operators/pow';
import { BinOp } from './lexer/operators/binOp';
import { KeywordArgs } from './nodes/keywordArgs';
import { Dict } from './nodes/dict';
import { ArrayNode } from './nodes/arrayNode';
import { Self } from './nodes/self';

let sym: number = 0;


function gensym(): string {
  return 'hole_' + sym++;
}


// copy-on-write version of map
function mapCOW<T, V>(arr: T[], func: (item: T) => T | V): (T | V)[] {
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


function createDynamicNode<T extends NunjucksNode>(typename: string, ...args: any[]): any {
  switch(typename) {
    case 'Node':
    case 'NunjucksNode':
      // @ts-ignore
      return new NunjucksNode(... args);
    case 'Root':
      // @ts-ignore
      return new Root(...args);
    case 'NodeList':
    case 'NunjucksNodeList':
      // @ts-ignore
      return new NunjucksNodeList(...args);
    case 'Value':
      // @ts-ignore
      return new Value(...args);
    case 'Literal':
      // @ts-ignore
      return new Literal(...args);
    case 'Symbol':
    case 'NunjucksSymbol':
      // @ts-ignore
      return new NunjucksSymbol(...args);
    case 'Group':
      // @ts-ignore
      return new Group(...args);
    case 'Array':
      // @ts-ignore
      return new ArrayNode(...args);
    case 'Pair':
      // @ts-ignore
      return new Pair(...args);
    case 'Dict':
      // @ts-ignore
      return new Dict(...args);
    case 'Output':
      // @ts-ignore
      return new Output(...args);
    case 'Capture':
      // @ts-ignore
      return new Capture(...args);
    case 'TemplateData':
      // @ts-ignore
      return new TemplateData(...args);
    case 'If':
      // @ts-ignore
      return new If(...args);
    case 'IfAsync':
      // @ts-ignore
      return new IfAsync(...args);
    case 'InlineIf':
      // @ts-ignore
      return new InlineIf(...args);
    case 'For':
      // @ts-ignore
      return new For(...args);
    case 'AsyncEach':
      // @ts-ignore
      return new AsyncEach(...args);
    case 'AsyncAll':
      // @ts-ignore
      return new AsyncAll(...args);
    case 'Macro':
      // @ts-ignore
      return new Macro(...args);
    case 'Caller':
      // @ts-ignore
      return new Caller(...args);
    case 'Import':
      // @ts-ignore
      return new Import(...args);
    case 'FromImport':
      // @ts-ignore
      return new FromImport(...args);
    case 'FunCall':
      // @ts-ignore
      return new FunCall(...args);
    case 'Filter':
      // @ts-ignore
      return new Filter(...args);
    case 'FilterAsync':
      // @ts-ignore
      return new FilterAsync(...args);
    case 'KeywordArgs':
      // @ts-ignore
      return new KeywordArgs(...args);
    case 'Block':
      // @ts-ignore
      return new Block(...args);
    case 'Self':
      // @ts-ignore
      return new Self(...args);
    case 'Super':
      // @ts-ignore
      return new Super(...args);
    case 'Extends':
      // @ts-ignore
      return new Extends(...args);
    case 'Include':
      // @ts-ignore
      return new Include(...args);
    case 'Set':
      // @ts-ignore
      return new Set(...args);
    case 'Switch':
      // @ts-ignore
      return new Switch(...args);
    case 'Case':
      // @ts-ignore
      return new Case(...args);
    case 'LookupVal':
      // @ts-ignore
      return new LookupVal(...args);
    case 'BinOp':
      // @ts-ignore
      return new BinOp(...args);
    case 'In':
      // @ts-ignore
      return new In(...args);
    case 'Is':
      // @ts-ignore
      return new Is(...args);
    case 'Or':
      // @ts-ignore
      return new Or(...args);
    case 'And':
      // @ts-ignore
      return new And(...args);
    case 'Not':
      // @ts-ignore
      return new Not(...args);
    case 'Add':
      // @ts-ignore
      return new Add(...args);
    case 'Concat':
      // @ts-ignore
      return new Concat(...args);
    case 'Sub':
      // @ts-ignore
      return new Sub(...args);
    case 'Mul':
      // @ts-ignore
      return new Mul(...args);
    case 'Div':
      // @ts-ignore
      return new Div(...args);
    case 'FloorDiv':
      // @ts-ignore
      return new FloorDiv(...args);
    case 'Mod':
      // @ts-ignore
      return new Mod(...args);
    case 'Pow':
      // @ts-ignore
      return new Pow(...args);
    case 'Neg':
      // @ts-ignore
      return new Neg(...args);
    case 'Pos':
      // @ts-ignore
      return new Pos(...args);
    case 'Compare':
      // @ts-ignore
      return new Compare(...args);
    case 'CompareOperand':
      // @ts-ignore
      return new CompareOperand(...args);
    case 'CallExtension':
      // @ts-ignore
      return new CallExtension(...args);
    case 'CallExtensionAsync':
      // @ts-ignore
      return new CallExtensionAsync(...args);
    default:
      throw new Error(`Invalid type ${typename}`);
  }
}


function walk(ast: NunjucksNode, func: (ast: NunjucksNode) => NunjucksNode | undefined, depthFirst?: boolean) {
  if (!(ast instanceof NunjucksNode)) {
    return ast;
  } else {

    if (!depthFirst) {
      const astT: NunjucksNode | undefined = func(ast);

      if (astT && astT !== ast) {
        return astT;
      }
    }

    if (ast instanceof NunjucksNodeList) {
      const children: NunjucksNode[] = mapCOW(ast.children, (node: NunjucksNode) => walk(node, func, depthFirst));

      if (children !== ast.children) {
        ast = createDynamicNode(ast.typename, ast.lineno, ast.colno, children);
      }
    } else if (ast instanceof CallExtension) {
      const args: NunjucksNodeList = walk(ast.args, func, depthFirst) as NunjucksNodeList;
      const contentArgs: NunjucksNode[] = mapCOW(ast.contentArgs, (node: NunjucksNode) => walk(node, func, depthFirst));

      if (args !== ast.args || contentArgs !== ast.contentArgs) {
        ast = createDynamicNode(ast.typename, ast.extName, ast.prop, args, contentArgs);
      }
    } else {
      const props: NunjucksNode[] = ast.fields.map(<T extends NunjucksNode>(field: string): T => ast[field]);
      const propsT: NunjucksNode[] = mapCOW(props, (prop: NunjucksNode): NunjucksNode => walk(prop, func, depthFirst));

      if (propsT !== props) {
        ast = createDynamicNode(ast.typename, ast.lineno, ast.colno);
        propsT.forEach((prop: NunjucksNode, i: number): void => {
          ast[ast.fields[i]] = prop;
        });
      }
    }

    return depthFirst ? (func(ast) || ast) : ast;
  }
}


function depthWalk(ast: NunjucksNode, func: (node: NunjucksNode) => NunjucksNode): NunjucksNode {
  return walk(ast, func, true);
}


function _liftFilters(node: CallExtension | Output | Set | For | If, asyncFilters: string[], prop?: string): CallExtension | Output | Set | For | If | NunjucksNodeList {
  const children: NunjucksNode[] = [];

  const walked: NunjucksNode = depthWalk(prop ? node[prop] : node, (descNode: Block | NunjucksSymbol | Filter): Block | NunjucksSymbol => {
    let symbol: NunjucksSymbol;
    if (descNode instanceof Block) {
      return descNode;
    } else if ((descNode instanceof Filter &&
        lib.indexOf(asyncFilters, descNode.name.value) !== -1) ||
        descNode instanceof CallExtensionAsync) {
      symbol = new NunjucksSymbol(descNode.lineno,
          descNode.colno,
          gensym());

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


function liftFilters(ast: Root, asyncFilters: string[]): NunjucksNode | undefined {
  return depthWalk(ast, (node: CallExtension | Output | Set | For | If): NunjucksNodeList | CallExtension | Set | For | If | undefined => {
    if (node instanceof Output) {
      return _liftFilters(node, asyncFilters);
    } else if (node instanceof Set) {
      return _liftFilters(node, asyncFilters, 'value');
    } else if (node instanceof For) {
      return _liftFilters(node, asyncFilters, 'arr');
    } else if (node instanceof If) {
      return _liftFilters(node, asyncFilters, 'cond');
    } else if (node instanceof CallExtension) {
      return _liftFilters(node, asyncFilters, 'args');
    } else {
      return undefined;
    }
  });
}


function liftSuper(ast: NunjucksNode) {
  return walk(ast, (blockNode: NunjucksNode): NunjucksNode => {
    if (!(blockNode instanceof Block)) {
      return;
    }

    let hasSuper: boolean = false;
    const symbol: string = gensym();

    blockNode.body = walk(blockNode.body, (node: NunjucksNode): NunjucksSymbol => { // eslint-disable-line consistent-return
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


function liftSelf(ast: NunjucksNode) {
  return walk(ast, (blockNode: NunjucksNode): NunjucksSymbol => { // eslint-disable-line consistent-return
    if (!(blockNode instanceof Block)) {
      return;
    }

    let hasSelf: boolean = false;
    const symbol: string = gensym();
    let blockName: NunjucksSymbol;

    blockNode.body = walk(blockNode.body, (node: NunjucksNode): NunjucksSymbol => { // eslint-disable-line consistent-return
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


function convertStatements(ast): NunjucksNode | undefined {
  return depthWalk(ast, (node: NunjucksNode): AsyncEach | undefined | IfAsync => {
    if (!(node instanceof If) && !(node instanceof For)) {
      return undefined;
    }

    let async: boolean = false;
    walk(node, (child: NunjucksNode): FilterAsync | IfAsync | AsyncEach | AsyncAll | CallExtensionAsync | undefined => {
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


function cps(ast: Root, asyncFilters: string[]): NunjucksNode {
  return convertStatements(liftSelf(liftSuper(liftFilters(ast, asyncFilters))));
}


export function transform(ast: Root, asyncFilters, name?: string): NunjucksNode {
  return cps(ast, asyncFilters || []);
}

// var parser = require('./parser');
// var src = 'hello {% foo %}{% endfoo %} end';
// var ast = transform(parser.parse(src, [new FooExtension()]), ['bar']);
// printNodes(ast);
