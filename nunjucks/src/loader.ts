'use strict';

import * as path from 'path';
import { EmitterObj } from './object/emitterObj';
import { Template } from './environment/environment';



export abstract class Loader extends EmitterObj {
  cache: Record<string, Template>;

  resolve(from, to): string {
    return path.resolve(path.dirname(from), to);
  }

  isRelative(filename): boolean {
    return (filename.indexOf('./') === 0 || filename.indexOf('../') === 0);
  }

  abstract getSource(name: string, cb?);
}
