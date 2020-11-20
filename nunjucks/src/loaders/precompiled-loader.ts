'use strict';

import { Loader } from './loader';
import { ISource } from './ISource';



export class PrecompiledLoader extends Loader {
  private readonly precompiled: Record<string, ISource>;


  constructor(compiledTemplates: Record<string, ISource>) {
    super();
    this.precompiled = compiledTemplates || {};
  }


  getSource(name: string): ISource | null {
    if (this.precompiled[name]) {
      return {
        src: {
          type: 'code',
          obj: this.precompiled[name]
        },
        path: name
      };
    }
    return null;
  }
}
