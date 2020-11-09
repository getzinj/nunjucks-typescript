import { Done } from 'mocha';
import { Loader } from '../nunjucks/src/loader';

declare var nunjucks;

(((): void => {
  'use strict';

  let expect,
      Environment,
      WebLoader,
      FileSystemLoader,
      NodeResolveLoader,
      templatesPath;

  if (typeof require !== 'undefined') {
    expect = require('expect.js');
    Environment = require('../nunjucks/src/environment').Environment;
    WebLoader = require('../nunjucks/src/web-loaders').WebLoader;
    FileSystemLoader = require('../nunjucks/src/file-system-loader').FileSystemLoader;
    NodeResolveLoader = require('../nunjucks/src/node-resolve-loader').NodeResolveLoader;
    templatesPath = 'tests/templates';
  } else {
    expect = window['expect'];
    Environment = nunjucks.Environment;
    WebLoader = nunjucks.WebLoader;
    FileSystemLoader = nunjucks.FileSystemLoader;
    NodeResolveLoader = nunjucks.NodeResolveLoader;
    templatesPath = '../templates';
  }

  describe('loader', (): void => {
    it('should allow a simple loader to be created', (): void => {
      // From Docs: http://mozilla.github.io/nunjucks/api.html#writing-a-loader
      // We should be able to create a loader that only exposes getSource
      let env, parent;

      function MyLoader(): void {
        // configuration
      }

      MyLoader.prototype.getSource = (): { path: "/tmp/somewhere"; src: "Hello World" } => ({
        src: 'Hello World',
        path: '/tmp/somewhere'
      });

      env = new Environment(new MyLoader(templatesPath));
      parent = env.getTemplate('fake.njk');
      expect(parent.render()).to.be('Hello World');
    });


    it('should catch loader error', (done): void => {
      // From Docs: http://mozilla.github.io/nunjucks/api.html#writing-a-loader
      // We should be able to create a loader that only exposes getSource
      let env;

      function MyLoader(): void {
        // configuration
        this.async = true;
      }

      MyLoader.prototype.getSource = (s, cb): void => {
        setTimeout((): void => {
          cb(new Error('test'));
        }, 1);
      };

      env = new Environment(new MyLoader(templatesPath));
      env.getTemplate('fake.njk', (err, parent): void => {
        expect(err).to.be.a(Error);
        expect(parent).to.be(undefined);

        done();
      });
    });


    describe('WebLoader', (): void => {
      it('should have default opts for WebLoader', (): void => {
        const webLoader = new WebLoader(templatesPath);
        expect(webLoader).to.be.a(WebLoader);
        expect(webLoader.useCache).to.be(false);
        expect(webLoader.async).to.be(false);
      });


      it('should emit a "load" event', function(done: Done): void {
        const loader: Loader = new WebLoader(templatesPath);

        if (typeof window === 'undefined') {
          this.skip();
          done();
        }

        loader.on('load', (name, source): void => {
          expect(name).to.equal('simple-base.njk');
          done();
        });

        loader.getSource('simple-base.njk');
      });
    });

    if (typeof FileSystemLoader !== 'undefined') {
      describe('FileSystemLoader', (): void => {
        it('should have default opts', (): void => {
          const loader = new FileSystemLoader(templatesPath);
          expect(loader).to.be.a(FileSystemLoader);
          expect(loader.noCache).to.be(false);
        });


        it('should emit a "load" event', (done: Done): void => {
          const loader: Loader = new FileSystemLoader(templatesPath);
          loader.on('load', (name, source): void => {
            expect(name).to.equal('simple-base.njk');
            done();
          });

          loader.getSource('simple-base.njk');
        });
      });
    }

    if (typeof NodeResolveLoader !== 'undefined') {
      describe('NodeResolveLoader', (): void => {
        it('should have default opts', (): void => {
          const loader = new NodeResolveLoader();
          expect(loader).to.be.a(NodeResolveLoader);
          expect(loader.noCache).to.be(false);
        });


        it('should emit a "load" event', (done: Done): void => {
          const loader: Loader = new NodeResolveLoader();
          loader.on('load', (name, source): void => {
            expect(name).to.equal('dummy-pkg/simple-template.html');
            done();
          });

          loader.getSource('dummy-pkg/simple-template.html');
        });


        it('should render templates', (): void => {
          const env = new Environment(new NodeResolveLoader());
          const tmpl = env.getTemplate('dummy-pkg/simple-template.html');
          expect(tmpl.render({foo: 'foo'})).to.be('foo');
        });


        it('should not allow directory traversal', (): void => {
          const loader = new NodeResolveLoader();
          const dummyPkgPath: string = require.resolve('dummy-pkg/simple-template.html');
          expect(loader.getSource(dummyPkgPath)).to.be(null);
        });


        it('should return null if no match', (): void => {
          const loader = new NodeResolveLoader();
          const tmplName: string = 'dummy-pkg/does-not-exist.html';
          expect(loader.getSource(tmplName)).to.be(null);
        });
      });
    }
  });
})());
