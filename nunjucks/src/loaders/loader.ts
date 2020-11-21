'use strict';

import * as path from 'path';
import { EmitterObj } from '../object/emitterObj';
import { ILoader } from '../environment/ILoader';
import { Template } from '../environment/template';



export abstract class Loader extends EmitterObj implements ILoader {
  cache: Record<string, Template>;

  resolve(from, to): string {
    return path.resolve(path.dirname(from), to);
  }

  isRelative(filename): boolean {
    return (filename.indexOf('./') === 0 || filename.indexOf('../') === 0);
  }

  abstract getSource(name: string, cb?);
}
