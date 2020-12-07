declare var nunjucks;

(((): void => {
  'use strict';

  let expect;
  let Environment;
  let WebLoader;
  let FileSystemLoader;
  let NodeResolveLoader;
  let templatesPath;


  if (typeof require !== 'undefined') {
    expect = require('expect.js');
    Environment = require('../nunjucks/src/environment/environment').Environment;
    WebLoader = require('../nunjucks/src/loaders/web-loaders').WebLoader;
    FileSystemLoader = require('../nunjucks/src/loaders/node-loaders').FileSystemLoader;
    NodeResolveLoader = require('../nunjucks/src/loaders/node-loaders').NodeResolveLoader;
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
      function MyLoader(arg?): void {
        // configuration
      }

      MyLoader.prototype.getSource = (): { path: '/tmp/somewhere'; src: 'Hello World' } => ({
        src: 'Hello World',
        path: '/tmp/somewhere'
      });


      // From Docs: http://mozilla.github.io/nunjucks/api.html#writing-a-loader
      // We should be able to create a loader that only exposes getSource
      let env = new Environment(new MyLoader(templatesPath));
      let parent = env.getTemplate('fake.njk');
      expect(parent.render()).to.be('Hello World');
    });


    it('should catch loader error', (done): void => {
      function MyLoader(arg?): void {
        // configuration
        this.async = true;
      }

      MyLoader.prototype.getSource = (s, cb): void => {
        setTimeout((): void => {
          cb(new Error('test'));
        }, 1);
      };


      // From Docs: http://mozilla.github.io/nunjucks/api.html#writing-a-loader
      // We should be able to create a loader that only exposes getSource
      let env = new Environment(new MyLoader(templatesPath));
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


      it('should emit a "load" event', function(done): void {
        const loader = new WebLoader(templatesPath);

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


        it('should emit a "load" event', (done): void => {
          const loader = new FileSystemLoader(templatesPath);
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


        it('should emit a "load" event', (done): void => {
          const loader = new NodeResolveLoader();
          loader.on('load', (name, source): void => {
            expect(name).to.equal('dummy-pkg/simple-template.html');
            done();
          });

          loader.getSource('dummy-pkg/simple-template.html');
        });


        it('should render templates', (): void => {
          const env = new Environment(new NodeResolveLoader());
          const tmpl = env.getTemplate('dummy-pkg/simple-template.html');
          expect(tmpl.render({ foo: 'foo' })).to.be('foo');
        });


        it('should not allow directory traversal', (): void => {
          const loader = new NodeResolveLoader();
          const dummyPkgPath = require.resolve('dummy-pkg/simple-template.html');
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
