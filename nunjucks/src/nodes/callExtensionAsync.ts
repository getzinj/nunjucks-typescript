import { CallExtension } from './nunjucksNode';



export class CallExtensionAsync extends CallExtension {
  get typename(): string { return 'CallExtensionAsync'; }


  constructor(lineno: number, colno: number, ext, prop, args, contentArgs) {
    super(lineno, colno, ext, prop, args, contentArgs);
  }
}
