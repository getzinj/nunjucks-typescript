'use strict';

import * as path from 'path';
import { ILoader } from '../interfaces/ILoader';
import { Template } from '../environment/template';
import { EventEmitter } from "events";



export abstract class Loader extends EventEmitter implements ILoader {
  cache: Record<string, Template>;

  resolve(from, to): string {
    return path.resolve(path.dirname(from), to);
  }

  isRelative(filename): boolean {
    return (filename.indexOf('./') === 0 || filename.indexOf('../') === 0);
  }

  abstract getSource(name: string, cb?: (err, src) => void);
}
