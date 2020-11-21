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
        .map( (ext: IExtension): IPreprocessor => ext.preprocess )
        .filter( (f: IPreprocessor | null | undefined): boolean => !!f );
    return preprocessors.reduce((s: string, processor: IPreprocessor): string => processor(s), src);
  }


  public parseSource(processedSrc: string, extensions: IExtension[], opts: ICompilerOptions): Root {
    return new Parser().parseSource(processedSrc, extensions, opts);
  }


  public getTransformedSource(parsedCode: Root, asyncFilters, name: string): NunjucksNode {
    return new Transformer().transform(
        parsedCode,
        asyncFilters,
        name
    );
  }


  public generateCode(transformedCode: NunjucksNode): string {
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
