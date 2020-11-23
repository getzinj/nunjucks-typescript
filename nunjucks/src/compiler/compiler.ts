'use strict';

import { IExtension } from '../interfaces/IExtension';
import { IPreprocessor } from '../interfaces/IPreprocessor';
import { ICompilerOptions } from '../interfaces/ICompilerOptions';
import { Transformer } from './transformer';
import { Parser } from './parser/parser';
import { CodeGenerator } from './codeGenerator/codeGenerator';
import { NunjucksNode } from '../nodes/nunjucksNode';
import { Root } from '../nodes/root';



export class Compiler {

  constructor(private readonly templateName: string, private readonly throwOnUndefined: boolean = false) { }


  private getPreprocessedSource(extensions: IExtension[], src: string): string {
    // Run the extension preprocessors against the source.
    const preprocessors: IPreprocessor[] = (extensions ?? [])
        .map( (ext: IExtension): IPreprocessor => ext.preprocess )
        .filter( (f: IPreprocessor | null | undefined): boolean => !!f );
    return preprocessors.reduce((s: string, processor: IPreprocessor): string => processor(s), src);
  }


  private parseSource(processedSrc: string, extensions: IExtension[], opts: ICompilerOptions): Root {
    return new Parser().parseSource(processedSrc, extensions, opts);
  }


  private getTransformedSource(parsedCode: Root, asyncFilters, name: string): NunjucksNode {
    return new Transformer().transform(
        parsedCode,
        asyncFilters,
        name
    );
  }


  private generateCode(transformedCode: NunjucksNode): string {
    return new CodeGenerator(this.templateName, this.throwOnUndefined)
        .compile(transformedCode)
        .getCode();
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
