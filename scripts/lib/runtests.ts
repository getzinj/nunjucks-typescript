import * as path from 'path';
import * as platform from 'platform';

/* eslint-disable */
import { SpawnOptions, ChildProcess, spawn } from 'child_process';

import { getStaticServer } from './static-server';
import { mochaPhantomJS } from './mocha-phantomjs';
import { IServer } from './IServer';
import { Server } from 'http';
import { IPromiseResolveFn } from './IPromiseResolveFn';
import { IPromiseRejectFn } from './IPromiseRejectFn';
import { IPromiseExecutor } from './IPromiseExecutor';
import { lookup, promiseSequence } from './utils';


function mochaRun({ cliTest = false }: { cliTest?: boolean } = { }): Promise<void> {
  // We need to run the cli test without nyc because of weird behavior
  // with spawn-wrap
  const bin: string = lookup(cliTest ? '.bin/mocha' : '.bin/nyc', true);//.replace(/\\/g, '\\\\');

  const runArgs: string[] = cliTest
      ? [ ]
      : [
        '--require', '@babel/register',
        '--exclude', '/tests/**',
        '--silent',
        '--no-clean',
        require.resolve('mocha/bin/mocha')
      ];

  const mochaArgs: string[] = cliTest
      ? [ 'tests/cli.spec.js' ]
      : [ '--grep', 'precompile cli',
        '--invert', 'tests' ];

  const cmd_args: string[] = [
    ... runArgs,
    '-R', 'spec',
    '-r', 'tests/setup',
    '-r', '@babel/register',
    ... mochaArgs,
  ];

  return new Promise<void>(getMochaRunExecutor(bin, cmd_args));
}


function getMochaRunExecutor(bin: string, cmd_args: string[]): IPromiseExecutor<void> {
  return (resolve: IPromiseResolveFn<void>, reject: IPromiseRejectFn<void>): void => {
    try {
      const cmd_opts: SpawnOptions = {
        cwd: path.join(__dirname, '../..'),
        env: process.env,
        windowsVerbatimArguments: (platform?.os?.family?.toLowerCase() === 'win32')
      };

      const proc: ChildProcess = spawn(bin, cmd_args, cmd_opts);

      proc.stdout.pipe(process.stdout);
      proc.stderr.pipe(process.stderr);

      proc.on('error', (err: any): void => {
        reject(err);
      });

      proc.on('exit', (code: any): void => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error('test failed. nyc/mocha exit code: ' + code));
        }
      });
    } catch (err) {
      reject(err);
    }
  };
}




function getRunTestsPromiseExecutor(): IPromiseExecutor<void> {
  return (resolve: IPromiseResolveFn<void>, reject: IPromiseRejectFn<void>): Promise<void> => {
    const mochaPromise: Promise<void> = promiseSequence([
      (): Promise<void> => mochaRun({cliTest: false}),
      (): Promise<void> => mochaRun({cliTest: true}),
    ]);

    let server: IServer;
    return mochaPromise
        .then((): Promise<void> => {
          return getStaticServer().then((args: [Server, number]): Promise<void> => {
            server = args[0];
            const port: number = args[1];
            const promises: IPromiseResolveFn<void>[] = ['index', 'slim'].map(
                (f: string): IPromiseResolveFn<void> =>
                    (): Promise<void> => mochaPhantomJS(`http://localhost:${ port }/tests/browser/${ f }.html`));
            return promiseSequence(promises).then((): void => {
              server.close();
              resolve();
            });
          });
        })
        .catch((err: any): void => {
          if (server) {
            server.close();
          }
          reject(err);
        });
  };
}


export function runtests(): Promise<void> {
  return new Promise<void>(getRunTestsPromiseExecutor());
}
