import { precompile } from '../../nunjucks/src/compiler/precompile/precompile';

import * as fs from 'fs';
import * as path from 'path';
import { IPromiseResolveFn } from './IPromiseResolveFn';
import { IPromiseRejectFn } from './IPromiseRejectFn';



const includeFileTypes: RegExp = /\.(njk|html)$/;

export function precompileTestTemplates(): Promise<void> {
  return new Promise((resolve: IPromiseResolveFn<void>, reject: IPromiseRejectFn<void>): void => {
    try {
      const testDir: string = path.join(__dirname, '../../tests');
      const output: string = precompile(path.join(testDir, 'templates'), {
        include: [ includeFileTypes ],
      });
      fs.writeFileSync(path.join(testDir, 'browser/precompiled-templates.js'), output);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
