'use strict';

import { Obj } from '../object/obj';
import { IExtension } from './parser/IExtension';
import { IPreprocessor } from './IPreprocessor';
import { ICompilerOptions } from './ICompilerOptions';
import { Transformer } from './transformer';
import { Parser } from './parser/parser';
import { CodeGenerator } from './codeGenerator';
import { NunjucksNode } from '../nodes/nunjucksNode';
import { Root } from '../nodes/root';



export class Compiler extends Obj {

  constructor(private readonly templateName: string, private readonly throwOnUndefined: boolean = false) {
    super();
  }


  public getPreprocessedSource(extensions: IExtension[], src: string): string {
    // Run the extension preprocessors against the source.
    const preprocessors: IPreprocessor[] = (extensions ?? [])
    .map((ext: IExtension): IPreprocessor => ext.preprocess)
    .filter((f: IPreprocessor | null | undefined): boolean => !!f);
    return preprocessors.reduce((s: IPreprocessor, processor: IPreprocessor) => processor(s), src);
  }


  public parseSource(processedSrc: string, extensions: IExtension[], opts: ICompilerOptions): Root {
    const parser: Parser = new Parser();
    return parser.parseSource(processedSrc, extensions, opts);
  }


  public getTransformedSource(parsedCode: Root, asyncFilters, name: string): NunjucksNode {
    const transformer: Transformer = new Transformer();
    return transformer.transform(
        parsedCode,
        asyncFilters,
        name
    );
  }


  public generateCode(transformedCode: NunjucksNode): string {
    const codeGenerator: CodeGenerator = new CodeGenerator(this.templateName, this.throwOnUndefined);
    codeGenerator.compile(transformedCode);
    return codeGenerator.getCode();
  }


  public compile( src: string,
                  asyncFilters,
                  extensions: IExtension[],
                  name: string,
                  opts: ICompilerOptions = { throwOnUndefined: undefined }): string {
    const processedSrc: string = this.getPreprocessedSource(extensions, src);
    const parsedCode: Root = this.parseSource(processedSrc, extensions, opts);
    const transformedCode: NunjucksNode = this.getTransformedSource(parsedCode, asyncFilters, name);
    return this.generateCode(transformedCode);
  }
}
