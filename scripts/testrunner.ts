#!/usr/bin/env node

'use strict';

const NYC = require('nyc');

process.env.NODE_ENV = 'test';

const nyc: typeof NYC = new NYC({
  exclude: [ '*.min.js', 'scripts/**', 'tests/**' ],
  reporter: [ 'text', 'html', 'lcovonly' ],
  showProcessTree: true
});
nyc.reset();

require('@babel/register');


const runtests = require('./lib/runtests').runtests;
const precompileTestTemplates = require('./lib/precompile').precompileTestTemplates;

let err: any;

precompileTestTemplates()
  .then( runtests )
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
