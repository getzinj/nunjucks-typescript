(((): void => {
  'use strict';


  let util;

  if (typeof require !== 'undefined') {
    util = require('./util.spec');
  } else {
    util = window['util'];
  }

  const equal = util.jinjaEqual;
  const finish = util.finish;

  describe('jinja-compat', (): void => {
    const arr: string[] = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h' ];


    it('should support array slices with start and stop', (done): void => {
      equal('{% for i in arr[1:4] %}{{ i }}{% endfor %}',
        { arr: arr },
        'bcd');
      finish(done);
    });


    it('should support array slices using expressions', (done): void => {
      equal('{% for i in arr[n:n+3] %}{{ i }}{% endfor %}',
        {
          n: 1,
          arr: arr
        },
        'bcd');
      finish(done);
    });


    it('should support array slices with start', (done): void => {
      equal('{% for i in arr[3:] %}{{ i }}{% endfor %}',
        { arr: arr },
        'defgh');
      finish(done);
    });


    it('should support array slices with negative start', (done): void => {
      equal('{% for i in arr[-3:] %}{{ i }}{% endfor %}',
        { arr: arr },
        'fgh');
      finish(done);
    });


    it('should support array slices with stop', (done): void => {
      equal('{% for i in arr[:4] %}{{ i }}{% endfor %}',
        { arr: arr },
        'abcd');
      finish(done);
    });


    it('should support array slices with negative stop', (done): void => {
      equal('{% for i in arr[:-3] %}{{ i }}{% endfor %}',
        { arr: arr },
        'abcde');
      finish(done);
    });


    it('should support array slices with step', (done): void => {
      equal('{% for i in arr[::2] %}{{ i }}{% endfor %}',
        { arr: arr },
        'aceg');
      finish(done);
    });


    it('should support array slices with negative step', (done): void => {
      equal('{% for i in arr[::-1] %}{{ i }}{% endfor %}',
        { arr: arr },
        'hgfedcba');
      finish(done);
    });


    it('should support array slices with start and negative step', (done): void => {
      equal('{% for i in arr[4::-1] %}{{ i }}{% endfor %}',
        { arr: arr },
        'edcba');
      finish(done);
    });


    it('should support array slices with negative start and negative step', (done): void => {
      equal('{% for i in arr[-5::-1] %}{{ i }}{% endfor %}',
        { arr: arr },
        'dcba');
      finish(done);
    });


    it('should support array slices with stop and negative step', (done): void => {
      equal('{% for i in arr[:3:-1] %}{{ i }}{% endfor %}',
        { arr: arr },
        'hgfe');
      finish(done);
    });


    it('should support array slices with start and step', (done): void => {
      equal('{% for i in arr[1::2] %}{{ i }}{% endfor %}',
        { arr: arr },
        'bdfh');
      finish(done);
    });


    it('should support array slices with start, stop, and step', (done): void => {
      equal('{% for i in arr[1:7:2] %}{{ i }}{% endfor %}',
        { arr: arr },
        'bdf');
      finish(done);
    });
  });
})());
