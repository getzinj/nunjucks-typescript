#!/usr/bin/env node
'use strict';
var Precompile = require('./lib/precompile');
var NYC = require('nyc');
var Runtests = require('./lib/runtests');
process.env.NODE_ENV = 'test';
var nyc = new NYC({
    exclude: ['*.min.js', 'scripts/**', 'tests/**'],
    reporter: ['text', 'html', 'lcovonly'],
    showProcessTree: true
});
nyc.reset();
require('@babel/register');
var err;
Precompile.precompileTestTemplates()
    .then(Runtests.runtests)
    .catch(function (e) {
    err = e;
    console.log(err); // eslint-disable-line no-console
})
    .then(function () {
    nyc.writeCoverageFile();
    nyc.report();
    if (err) {
        process.exit(1);
    }
});
