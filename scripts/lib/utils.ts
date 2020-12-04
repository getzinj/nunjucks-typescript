'use strict';

const fs = require('fs');
const path = require('path');


export function lookup(relPath: string, isExecutable: boolean): string | undefined {
  for (let i: number = 0; i < module.paths.length; i++) {
    let absPath: string = path.join(module.paths[i], relPath);
    if (isExecutable && process.platform === 'win32') {
      absPath += '.cmd';
    }
    if (fs.existsSync(absPath)) {
      return absPath;
    }
  }
  return undefined;
}


export function promiseSequence<T, V>(promises) {
  return new Promise((resolve: (value?) => void, reject: (reason?: any) => void): void => {
    const results: T[] = [];

    function iterator(prev: Promise<T>, curr: (result: T, results: T[]) => Promise<V>): Promise<V | void> {
      return prev.then((result: T): Promise<V> => {
        results.push(result);
        return curr(result, results);
      }).catch((err: any): void => {
        reject(err);
      });
    }

    promises.push((): Promise<void> => Promise.resolve());
    promises.reduce(iterator, Promise.resolve(false)).then((res): void => resolve(res));
  });
}
