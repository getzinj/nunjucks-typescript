import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { Utils } from './utils';
import { IPromiseRejectFn } from './IPromiseRejectFn';
import { IPromiseResolveFn } from './IPromiseResolveFn';
import { IMochaPhantomJsOptions } from './i-mocha-phantom-js-options';

export function mochaPhantomJS(url, options: IMochaPhantomJsOptions = { }): Promise<void> {
  const coverageFile: string = path.join(
    __dirname, '../../.nyc_output',
    (url.indexOf('slim') > -1) ? 'browser-slim.json' : 'browser-std.json');

  return new Promise((resolve: IPromiseResolveFn<void>, reject: IPromiseRejectFn<void>): void => {
    try {
      const scriptPath: string = require.resolve('mocha-phantomjs-core/mocha-phantomjs-core.js');

      if (!scriptPath) {
        throw new Error('mocha-phantomjs-core.js not found');
      }

      const args: string[] = [
        scriptPath,
        url,
        options.reporter || 'dot',
        JSON.stringify(Object.assign({
          useColors: true,
          hooks: 'mocha-phantomjs-istanbul',
          coverageFile: coverageFile,
        }, options.phantomjs || { })),
      ];
      const phantomjsPath: string = Utils.lookup('.bin/phantomjs', true) || Utils.lookup('phantomjs-prebuilt/bin/phantomjs', true);

      if (!phantomjsPath) {
        throw new Error('PhantomJS not found');
      }

      const proc: ChildProcess = spawn(phantomjsPath, args, { cwd: path.join(__dirname, '../..') });

      proc.stdout.pipe(process.stdout);
      proc.stderr.pipe(process.stderr);

      proc.on('error', reject);

      proc.on('exit', (code: number): void => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`test failed. phantomjs exit code: ${ code }`));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
