'use strict';

import * as path from 'path';
import { EmitterObj } from './emitterObj';



export class Loader extends EmitterObj {
  cache: Record<string, any>;

  resolve(from, to): string {
    return path.resolve(path.dirname(from), to);
  }

  isRelative(filename): boolean {
    return (filename.indexOf('./') === 0 || filename.indexOf('../') === 0);
  }
}
