var spawn = require('child_process').spawn;
var path = require('path');
// var lookup = require('./utils').lookup;
const chromiumPath = require('chromium').path;

import { ChildProcess, SpawnOptionsWithoutStdio } from 'child_process';
import { IPromiseRejectFn } from './IPromiseRejectFn';
import { IPromiseResolveFn } from './IPromiseResolveFn';
import { IMochaPhantomJsOptions } from './i-mocha-phantom-js-options';



export function mochaPhantomJS(url, options: IMochaPhantomJsOptions = { }): Promise<void> {
  const coverageFile: string = path.join(__dirname, '../../.nyc_output', (url.indexOf('slim') > -1)
        ? 'browser-slim.json'
        : 'browser-std.json');

  return new Promise((resolve: IPromiseResolveFn<void>, reject: IPromiseRejectFn<void>): void => {
    try {
//      const scriptPath: string = lookup('mocha-chrome');

      const mochaArguments: string = ('$$$' + JSON.stringify(Object.assign({
        exit: true,
        logLevel: 'trace', // DEBUG ONLY $$$
        fullTrace: true, // DEBUG ONLY $$$$
        isWorker: true, // DEBUG ONLY $$$$
        color: true,
        hooks: 'mocha-phantomjs-istanbul',
        coverageFile: coverageFile,
      }, options.phantomjs || {})) + '$$$').replace(/"/g, '\\"').replace(/\$\$\$/g, '"');


      const args: string[] = [
        url,
        '--exit',
        options.reporter || 'dot',
        mochaArguments,
      ];

      if (!chromiumPath) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error('Chrome not found');
      }

      const runDir: string = path.join(__dirname, '../..');
      const opts: SpawnOptionsWithoutStdio = { cwd: runDir };

      const command: string = `"${ chromiumPath } ${ (args ?? [ ]).join(' ') }" in ${ opts?.cwd }`;
      console.info(`Executing: ${ command }.`);

      const proc: ChildProcess = spawn(chromiumPath, args, opts);

      proc.stdout.pipe(process.stdout);
      proc.stderr.pipe(process.stderr);

      proc.on('error', (reason: any): void => {
        reject(reason);
      });

      proc.on('exit', (code: number): void => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`test failed executing ${ command }. chromium exit code: ${ code }`));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
