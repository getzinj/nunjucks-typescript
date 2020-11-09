declare var nunjucks;


((() => {
  'use strict';

  let expect;
  let precompile;
  let precompileString;

  if (typeof require !== 'undefined') {
    expect = require('expect.js');
    precompile = require('../nunjucks/src/precompile').precompile;
    precompileString = require('../nunjucks/src/precompile').precompileString;
  } else {
    expect = window['expect'];
    precompile = nunjucks.precompile;
    precompileString = nunjucks.precompileString;
  }


  describe('precompile', () => {
    it('should return a string', () => {
      expect(precompileString('{{ test }}', {
        name: 'test.njk'
      })).to.be.an('string');
    });


    describe('templates', () => {
      it('should return *NIX path seperators', () => {
        let fileName;

        precompile('./tests/templates/item.njk', {
          wrapper: templates => {
            fileName = templates[0].name;
          }
        });

        expect(fileName).to.equal('./tests/templates/item.njk');
      });


      it('should return *NIX path seperators, when name is passed as option', () => {
        let fileName;

        precompile('<span>test</span>', {
          name: 'path\\to\\file.j2',
          isString: true,
          wrapper: templates => {
            fileName = templates[0].name;
          }
        });

        expect(fileName).to.equal('path/to/file.j2');
      });
    });
  });
})());
