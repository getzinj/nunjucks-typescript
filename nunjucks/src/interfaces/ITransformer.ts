import { Root } from '../nodes/root';
import { INunjucksNode } from '../nodes/INunjucksNode';



export interface ITransformer {
  transform(ast: Root, asyncFilters, name?: string): INunjucksNode;
}
