((() => {
  'use strict';


  const expect = require('expect.js');
  const nunjucks = require('../nunjucks');
  const fs = require('fs-extra');
  const path = require('path');
  const os = require('os');

  function rmdir(dirPath) {
    fs.emptyDirSync(dirPath);
    fs.rmdirSync(dirPath);
  }


  describe('nunjucks.configure', function() {
    let tempdir: string;


    before(() => {
      if (fs && path && os) {
        try {
          tempdir = fs.mkdtempSync(path.join(os.tmpdir(), 'templates'));
          fs.emptyDirSync(tempdir);
        } catch (e) {
          rmdir(tempdir);
          throw e;
        }
      }
    });


    after(() => {
      nunjucks.reset();
      if (typeof tempdir !== 'undefined') {
        rmdir(tempdir);
      }
    });


    it('should cache templates by default', function() {
      if (typeof fs === 'undefined') {
        this.skip();
      } else {
        nunjucks.configure(tempdir);

        fs.writeFileSync(tempdir + '/test.html', '{{ name }}', 'utf-8');
        expect(nunjucks.render('test.html', { name: 'foo' })).to.be('foo');

        fs.writeFileSync(tempdir + '/test.html', '{{ name }}-changed', 'utf-8');
        expect(nunjucks.render('test.html', { name: 'foo' })).to.be('foo');
      }
    });


    it('should not cache templates with {noCache: true}', function() {
      if (typeof fs === 'undefined') {
        this.skip();
      } else {
        nunjucks.configure(tempdir, { noCache: true });

        fs.writeFileSync(tempdir + '/test.html', '{{ name }}', 'utf-8');
        expect(nunjucks.render('test.html', { name: 'foo' })).to.be('foo');

        fs.writeFileSync(tempdir + '/test.html', '{{ name }}-changed', 'utf-8');
        expect(nunjucks.render('test.html', { name: 'foo' })).to.be('foo-changed');
      }
    });
  });
})());
