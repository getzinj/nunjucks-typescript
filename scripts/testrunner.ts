#!/usr/bin/env node

'use strict';

const Precompile: { precompileTestTemplates(): Promise<void> } = require('./lib/precompile');
const NYC = require('nyc');
const Runtests: { runtests(): Promise<void> } = require('./lib/runtests');

process.env.NODE_ENV = 'test';

const nyc: typeof NYC = new NYC({
  exclude: [ '*.min.js', 'scripts/**', 'tests/**' ],
  reporter: [ 'text', 'html', 'lcovonly' ],
  showProcessTree: true
});
nyc.reset();

require('@babel/register');


let err: any;

Precompile.precompileTestTemplates()
  .then( Runtests.runtests )
  .catch( (e: any): void => {
    err = e;
    console.log(err); // eslint-disable-line no-console
  } )
  .then( (): void => {
    nyc.writeCoverageFile();
    nyc.report();

    if (err) {
      process.exit(1);
    }
  } );
