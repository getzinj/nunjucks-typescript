import { NunjucksNode } from './nunjucksNode';



export interface INodeFactory {
  createDynamicNode<T extends NunjucksNode>(typename: string, ...args: any[]): T;
}
