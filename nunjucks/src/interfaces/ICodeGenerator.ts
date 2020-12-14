import { INunjucksNode } from '../nodes/INunjucksNode';



export interface ICodeGenerator {
  getCode(): string;
  generateCode(transformedCode: INunjucksNode): string;
}
