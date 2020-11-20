import { NunjucksNode, NunjucksNodeList, CallExtension } from './nunjucksNode';
import { Root } from './root';
import { Value } from './value';
import { Literal } from './literal';
import { NunjucksSymbol } from './nunjucksSymbol';
import { Group } from './group';
import { ArrayNode } from './arrayNode';
import { Pair } from './pair';
import { Dict } from './dict';
import { Output } from './output';
import { Capture } from './capture';
import { TemplateData } from './templateData';
import { If } from './if';
import { IfAsync } from './ifAsync';
import { InlineIf } from './inlineIf';
import { For } from './for';
import { AsyncEach } from './asyncEach';
import { AsyncAll } from './asyncAll';
import { Macro } from './macro';
import { Caller } from './caller';
import { Import } from './import';
import { FromImport } from './fromImport';
import { FunCall } from './funCall';
import { Filter } from './filter';
import { FilterAsync } from './filterAsync';
import { KeywordArgs } from './keywordArgs';
import { Block } from './block';
import { Self } from './self';
import { Super } from './super';
import { Extends } from './extends';
import { Include } from './include';
import { Set } from './set';
import { Switch } from './switch';
import { Case } from './case';
import { LookupVal } from './lookupVal';
import { BinOp } from '../lexer/operators/binOp';
import { In } from '../lexer/operators/in';
import { Is } from '../lexer/operators/is';
import { Or } from '../lexer/operators/or';
import { And } from '../lexer/operators/and';
import { Not } from '../lexer/operators/not';
import { Add } from '../lexer/operators/add';
import { Concat } from '../lexer/operators/concat';
import { Sub } from '../lexer/operators/sub';
import { Mul } from '../lexer/operators/mul';
import { Div } from '../lexer/operators/div';
import { FloorDiv } from '../lexer/operators/floorDiv';
import { Mod } from '../lexer/operators/mod';
import { Pow } from '../lexer/operators/pow';
import { Neg } from '../lexer/operators/neg';
import { Pos } from '../lexer/operators/pos';
import { Compare } from './compare';
import { CompareOperand } from './compareOperand';
import { CallExtensionAsync } from './callExtensionAsync';



export class NodeFactory {
  public createDynamicNode<T extends NunjucksNode>(typename: string, ...args: any[]): T {
    switch (typename) {
      case 'Node':
      case 'NunjucksNode':
        // @ts-ignore
        return new NunjucksNode(...args);
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
}
