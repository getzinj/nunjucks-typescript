'use strict';

import { Loader } from './loader';
import { ISource } from '../interfaces/ISource';
import { ILoader } from '../interfaces/ILoader';



export class PrecompiledLoader extends Loader implements ILoader {
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
