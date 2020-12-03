import { Done } from 'mocha';


(function() {
  'use strict';

  const path = require('path');
  const execFile = require('child_process').execFile;
  const expect = require('expect.js');

  const rootDir = path.resolve(path.join(__dirname, '..'));
  let precompileBin = path.join(rootDir, 'bin', 'precompile');

  if (process.platform === 'win32') {
    precompileBin += '.cmd';
  }


  function execPrecompile(args, cb) {
    execFile(precompileBin, args, { cwd: rootDir }, cb);
  }


  describe('precompile cli', () => {
    it('should echo a compiled template to stdout', function(done) {
      execPrecompile([ 'tests/templates/item.njk' ], function(err, stdout, stderr) {
        if (err) {
          done(err);
          return;
        }
        expect(stdout).to.contain('window.nunjucksPrecompiled');
        expect(stderr).to.equal('');
        done();
      });
    });


    it('should support --name', (done: Done) => {
      const args = [
        '--name', 'item.njk',
        'tests/templates/item.njk',
      ];
      execPrecompile(args, function(err, stdout, stderr) {
        if (err) {
          done(err);
          return;
        }
        expect(stdout).to.contain('"item.njk"');
        expect(stderr).to.equal('');
        done();
      });
    });
  });
}());
