declare var nunjucks;

(function(): void {
  'use strict';

  let expect;
  let util;
  let Loader;
  let templatesPath;
  let path;
  let Environment;

  if (typeof require !== 'undefined') {
    expect = require('expect.js');
    util = require('./util.spec');
    Loader = require('../nunjucks/src/loaders/FileSystemLoader').FileSystemLoader;
    templatesPath = 'tests/templates';
    path = require('path');
    Environment = require('../nunjucks/src/environment/environment').Environment;
  } else {
    expect = window['expect'];
    Loader = nunjucks.WebLoader;
    templatesPath = '../templates';
    Environment = nunjucks.Environment;
  }


  describe('api', function(): void {
    it('should always force compilation of parent template', function(): void {
      const env = new Environment(new Loader(templatesPath));

      const child = env.getTemplate('base-inherit.njk');
      expect(child.render()).to.be('Foo*Bar*BazFizzle');
    });


    it('should only call the callback once when conditional import fails', function(done: (err?) => void): void {
      const env = new Environment(new Loader(templatesPath));
      let called: number = 0;
      env.render('broken-conditional-include.njk',
        function(): void {
          expect(++called).to.be(1);
        }
      );
      setTimeout(done, 0);
    });


    it('should handle correctly relative paths', function(): void {
      if (typeof path === 'undefined') {
        this.skip();
        return;
      }
      let env = new Environment(new Loader(templatesPath));
      let child1 = env.getTemplate('relative/test1.njk');
      let child2 = env.getTemplate('relative/test2.njk');
      expect(child1.render()).to.be('FooTest1BazFizzle');
      expect(child2.render()).to.be('FooTest2BazFizzle');
    });


    it('should handle correctly cache for relative paths', function(): void {
      if (typeof path === 'undefined') {
        this.skip();
        return;
      }
      const env = new Environment(new Loader(templatesPath));
      const test = env.getTemplate('relative/test-cache.njk');

      expect(util.normEOL(test.render())).to.be('Test1\nTest2');
    });


    it('should handle correctly relative paths in renderString', function(): void {
      if (typeof path === 'undefined') {
        this.skip();
        return;
      }
      let env = new Environment(new Loader(templatesPath));
      expect(env.renderString('{% extends "./relative/test1.njk" %}{% block block1 %}Test3{% endblock %}',
          { },
          { path: path.resolve(templatesPath, 'string.njk') })).to.be('FooTest3BazFizzle');
    });


    it('should emit "load" event on Environment instance', function(done: (err?) => void): void {
      const env = new Environment(new Loader(templatesPath));
      env.on('load', function(name: string, source): void {
        expect(name).to.equal('item.njk');
        done();
      });
      env.render('item.njk', { });
    });
  });
}());
