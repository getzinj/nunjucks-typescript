declare var nunjucks;


((() => {
  'use strict';


  const expect = require('expect.js');
  const precompile = require('../nunjucks/src/compiler/precompile/precompile').precompile;
  const precompileString = require('../nunjucks/src/compiler/precompile/precompile').precompileString;
  describe('precompile', () => {
    it('should return a string', () => {
      expect(precompileString('{{ test }}', { name: 'test.njk' })).to.be.an('string');
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
