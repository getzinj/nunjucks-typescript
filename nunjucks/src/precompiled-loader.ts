'use strict';

import { Loader } from './loader';



export class PrecompiledLoader extends Loader {
  private readonly precompiled: Record<string, any>;


  constructor(compiledTemplates) {
    super();
    this.precompiled = compiledTemplates || {};
  }


  getSource(name: string): null | { path: string; src: { obj: any; type: string } } {
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
