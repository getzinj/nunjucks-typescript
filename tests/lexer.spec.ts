
((() => {
  'use strict';


  const expect = require('expect.js');
  const lib = require('../nunjucks/src/lib');
  const Tokenizer = require('../nunjucks/src/compiler/lexer/tokenizer').Tokenizer;
  const tokenType = require('../nunjucks/src/compiler/lexer/tokenType');

  function lex(src, opts?) {
    return new Tokenizer(src, opts);
  }


  function _hasTokens(ws, tokens, types): void {
    for (let i = 0; i < types.length; i++) {
      let type = types[i];
      let tok = tokens.nextToken();
      if (!ws) {
        while (tok && tok.type === tokenType.TokenType.TOKEN_WHITESPACE) {
          tok = tokens.nextToken();
        }
      }

      if (lib.isArray(type)) {
        expect(tok.type).to.be(type[0]);
        expect(tok.value).to.be(type[1]);
      } else if (lib.isObject(type)) {
        expect(tok.type).to.be(type.type);
        if (type.value != null) {
          expect(tok.value).to.be(type.value);
        }
        if (type.lineno != null) {
          expect(tok.lineno).to.be(type.lineno);
        }
        if (type.colno != null) {
          expect(tok.colno).to.be(type.colno);
        }
      } else {
        expect(tok.type).to.be(type);
      }
    }
  }


  function hasTokens(tokens, ...types): void {
    return _hasTokens(false, tokens, lib.toArray(arguments).slice(1));
  }


  function hasTokensWithWS(tokens, ...types): void {
    return _hasTokens(true, tokens, lib.toArray(arguments).slice(1));
  }


  describe('lexer', () => {
    let tok;
    let tokens;


    it('should parse template data', () => {
      tok = lex('3').nextToken();
      expect(tok.type).to.be(tokenType.TokenType.TOKEN_DATA);
      expect(tok.value).to.be('3');

      let tmpl = 'foo bar bizzle 3 [1,2] !@#$%^&*()<>?:"{}|';
      tok = lex(tmpl).nextToken();
      expect(tok.type).to.be(tokenType.TokenType.TOKEN_DATA);
      expect(tok.value).to.be(tmpl);
    });


    it('should keep track of whitespace', () => {
      tokens = lex('data {% 1 2\n   3  %} data');
      hasTokensWithWS(tokens,
        tokenType.TokenType.TOKEN_DATA,
        tokenType.TokenType.TOKEN_BLOCK_START,
        [ tokenType.TokenType.TOKEN_WHITESPACE, ' ' ],
        tokenType.TokenType.TOKEN_INT,
        [ tokenType.TokenType.TOKEN_WHITESPACE, ' ' ],
        tokenType.TokenType.TOKEN_INT,
        [ tokenType.TokenType.TOKEN_WHITESPACE, '\n   ' ],
        tokenType.TokenType.TOKEN_INT,
        [ tokenType.TokenType.TOKEN_WHITESPACE, '  ' ],
        tokenType.TokenType.TOKEN_BLOCK_END,
        tokenType.TokenType.TOKEN_DATA);
    });


    it('should trim blocks', () => {
      tokens = lex('  {% if true %}\n    foo\n  {% endif %}\n', { trimBlocks: true });
      hasTokens(tokens,
        [ tokenType.TokenType.TOKEN_DATA, '  ' ],
        tokenType.TokenType.TOKEN_BLOCK_START,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_BOOLEAN,
        tokenType.TokenType.TOKEN_BLOCK_END,
        [ tokenType.TokenType.TOKEN_DATA, '    foo\n  ' ],
        tokenType.TokenType.TOKEN_BLOCK_START,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_BLOCK_END);
    });


    it('should trim windows-style CRLF line endings after blocks', () => {
      tokens = lex('  {% if true %}\r\n    foo\r\n  {% endif %}\r\n', { trimBlocks: true });
      hasTokens(tokens,
        [ tokenType.TokenType.TOKEN_DATA, '  ' ],
        tokenType.TokenType.TOKEN_BLOCK_START,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_BOOLEAN,
        tokenType.TokenType.TOKEN_BLOCK_END,
        [ tokenType.TokenType.TOKEN_DATA, '    foo\r\n  ' ],
        tokenType.TokenType.TOKEN_BLOCK_START,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_BLOCK_END);
    });


    it('should not trim CR after blocks', () => {
      tokens = lex('  {% if true %}\r    foo\r\n  {% endif %}\r', { trimBlocks: true });
      hasTokens(tokens,
        [ tokenType.TokenType.TOKEN_DATA, '  ' ],
        tokenType.TokenType.TOKEN_BLOCK_START,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_BOOLEAN,
        tokenType.TokenType.TOKEN_BLOCK_END,
        [ tokenType.TokenType.TOKEN_DATA, '\r    foo\r\n  ' ],
        tokenType.TokenType.TOKEN_BLOCK_START,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_BLOCK_END,
        [ tokenType.TokenType.TOKEN_DATA, '\r' ]);
    });


    it('should lstrip and trim blocks', () => {
      tokens = lex('test\n {% if true %}\n  foo\n {% endif %}\n</div>', {
        lstripBlocks: true,
        trimBlocks: true
      });
      hasTokens(tokens,
        [ tokenType.TokenType.TOKEN_DATA, 'test\n' ],
        tokenType.TokenType.TOKEN_BLOCK_START,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_BOOLEAN,
        tokenType.TokenType.TOKEN_BLOCK_END,
        [ tokenType.TokenType.TOKEN_DATA, '  foo\n' ],
        tokenType.TokenType.TOKEN_BLOCK_START,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_BLOCK_END,
        [ tokenType.TokenType.TOKEN_DATA, '</div>' ]);
    });


    it('should lstrip and not collapse whitespace between blocks', () => {
      tokens = lex('   {% t %} {% t %}', { lstripBlocks: true });
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_BLOCK_START,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_BLOCK_END,
        [ tokenType.TokenType.TOKEN_DATA, ' ' ],
        tokenType.TokenType.TOKEN_BLOCK_START,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_BLOCK_END);
    });



    it('should parse variable start and end', () => {
      tokens = lex('data {{ foo }} bar bizzle');
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_DATA,
        tokenType.TokenType.TOKEN_VARIABLE_START,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_VARIABLE_END,
        tokenType.TokenType.TOKEN_DATA);
    });


    it('should treat the non-breaking space as valid whitespace', () => {
      tokens = lex('{{\u00A0foo }}');
      tok = tokens.nextToken();
      tok = tokens.nextToken();
      tok = tokens.nextToken();
      expect(tok.type).to.be(tokenType.TokenType.TOKEN_SYMBOL);
      expect(tok.value).to.be('foo');
    });


    it('should parse block start and end', () => {
      tokens = lex('data {% foo %} bar bizzle');
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_DATA,
        tokenType.TokenType.TOKEN_BLOCK_START,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_BLOCK_END,
        tokenType.TokenType.TOKEN_DATA);
    });


    it('should parse basic types', () => {
      tokens = lex('{{ 3 4.5 true false none foo "hello" \'boo\' r/regex/ }}');
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_VARIABLE_START,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_FLOAT,
        tokenType.TokenType.TOKEN_BOOLEAN,
        tokenType.TokenType.TOKEN_BOOLEAN,
        tokenType.TokenType.TOKEN_NONE,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_STRING,
        tokenType.TokenType.TOKEN_STRING,
        tokenType.TokenType.TOKEN_REGEX,
        tokenType.TokenType.TOKEN_VARIABLE_END);
    });


    it('should parse function calls', () => {
      tokens = lex('{{ foo(bar) }}');
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_VARIABLE_START,
        [ tokenType.TokenType.TOKEN_SYMBOL, 'foo' ],
        tokenType.TokenType.TOKEN_LEFT_PAREN,
        [ tokenType.TokenType.TOKEN_SYMBOL, 'bar' ],
        tokenType.TokenType.TOKEN_RIGHT_PAREN,
        tokenType.TokenType.TOKEN_VARIABLE_END);
    });


    it('should parse groups', () => {
      tokens = lex('{{ (1, 2, 3) }}');
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_VARIABLE_START,
        tokenType.TokenType.TOKEN_LEFT_PAREN,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_COMMA,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_COMMA,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_RIGHT_PAREN,
        tokenType.TokenType.TOKEN_VARIABLE_END);
    });


    it('should parse arrays', () => {
      tokens = lex('{{ [1, 2, 3] }}');
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_VARIABLE_START,
        tokenType.TokenType.TOKEN_LEFT_BRACKET,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_COMMA,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_COMMA,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_RIGHT_BRACKET,
        tokenType.TokenType.TOKEN_VARIABLE_END);
    });


    it('should parse dicts', () => {
      tokens = lex('{{ {one:1, "two":2} }}');
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_VARIABLE_START,
        tokenType.TokenType.TOKEN_LEFT_CURLY,
        [ tokenType.TokenType.TOKEN_SYMBOL, 'one' ],
        tokenType.TokenType.TOKEN_COLON,
        [ tokenType.TokenType.TOKEN_INT, '1' ],
        tokenType.TokenType.TOKEN_COMMA,
        [ tokenType.TokenType.TOKEN_STRING, 'two' ],
        tokenType.TokenType.TOKEN_COLON,
        [ tokenType.TokenType.TOKEN_INT, '2' ],
        tokenType.TokenType.TOKEN_RIGHT_CURLY,
        tokenType.TokenType.TOKEN_VARIABLE_END);
    });


    it('should parse blocks without whitespace', () => {
      tokens = lex('data{{hello}}{%if%}data');
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_DATA,
        tokenType.TokenType.TOKEN_VARIABLE_START,
        [ tokenType.TokenType.TOKEN_SYMBOL, 'hello' ],
        tokenType.TokenType.TOKEN_VARIABLE_END,
        tokenType.TokenType.TOKEN_BLOCK_START,
        [ tokenType.TokenType.TOKEN_SYMBOL, 'if' ],
        tokenType.TokenType.TOKEN_BLOCK_END,
        tokenType.TokenType.TOKEN_DATA);
    });


    it('should parse filters', () => {
      hasTokens(lex('{{ foo|bar }}'),
        tokenType.TokenType.TOKEN_VARIABLE_START,
        [ tokenType.TokenType.TOKEN_SYMBOL, 'foo' ],
        tokenType.TokenType.TOKEN_PIPE,
        [ tokenType.TokenType.TOKEN_SYMBOL, 'bar' ],
        tokenType.TokenType.TOKEN_VARIABLE_END);
    });


    it('should parse operators', () => {
      hasTokens(lex('{{ 3+3-3*3/3 }}'),
        tokenType.TokenType.TOKEN_VARIABLE_START,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_OPERATOR,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_OPERATOR,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_OPERATOR,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_OPERATOR,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_VARIABLE_END);

      hasTokens(lex('{{ 3**4//5 }}'),
        tokenType.TokenType.TOKEN_VARIABLE_START,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_OPERATOR,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_OPERATOR,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_VARIABLE_END);

      hasTokens(lex('{{ 3 != 4 == 5 <= 6 >= 7 < 8 > 9 }}'),
        tokenType.TokenType.TOKEN_VARIABLE_START,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_OPERATOR,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_OPERATOR,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_OPERATOR,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_OPERATOR,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_OPERATOR,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_OPERATOR,
        tokenType.TokenType.TOKEN_INT,
        tokenType.TokenType.TOKEN_VARIABLE_END);
    });


    it('should parse comments', () => {
      tokens = lex('data data {# comment #} data');
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_DATA,
        tokenType.TokenType.TOKEN_COMMENT,
        tokenType.TokenType.TOKEN_DATA);
    });


    it('should allow changing the variable start and end', () => {
      tokens = lex('data {= var =}', {
        tags: {
          variableStart: '{=',
          variableEnd: '=}'
        }
      });
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_DATA,
        tokenType.TokenType.TOKEN_VARIABLE_START,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_VARIABLE_END);
    });


    it('should allow changing the block start and end', () => {
      tokens = lex('{= =}', {
        tags: {
          blockStart: '{=',
          blockEnd: '=}'
        }
      });
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_BLOCK_START,
        tokenType.TokenType.TOKEN_BLOCK_END);
    });


    it('should allow changing the variable start and end', () => {
      tokens = lex('data {= var =}', {
        tags: {
          variableStart: '{=',
          variableEnd: '=}'
        }
      });
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_DATA,
        tokenType.TokenType.TOKEN_VARIABLE_START,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_VARIABLE_END);
    });


    it('should allow changing the comment start and end', () => {
      tokens = lex('<!-- A comment! -->', {
        tags: {
          commentStart: '<!--',
          commentEnd: '-->'
        }
      });
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_COMMENT);
    });

    /**
     * Test that this bug is fixed: https://github.com/mozilla/nunjucks/issues/235
     */

    it('should have individual lexer tag settings for each environment', () => {
      tokens = lex('{=', { tags: { variableStart: '{=' } });
      hasTokens(tokens, tokenType.TokenType.TOKEN_VARIABLE_START);

      tokens = lex('{{');
      hasTokens(tokens, tokenType.TokenType.TOKEN_VARIABLE_START);

      tokens = lex('{{', { tags: { variableStart: '<<<' } });
      hasTokens(tokens, tokenType.TokenType.TOKEN_DATA);

      tokens = lex('{{');
      hasTokens(tokens, tokenType.TokenType.TOKEN_VARIABLE_START);
    });


    it('should parse regular expressions', () => {
      tokens = lex('{{ r/basic regex [a-z]/ }}');
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_VARIABLE_START,
        tokenType.TokenType.TOKEN_REGEX,
        tokenType.TokenType.TOKEN_VARIABLE_END);

      // A more complex regex with escaped slashes.
      tokens = lex('{{ r/{a*b} \\/regex! [0-9]\\// }}');
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_VARIABLE_START,
        tokenType.TokenType.TOKEN_REGEX,
        tokenType.TokenType.TOKEN_VARIABLE_END);

      // This one has flags.
      tokens = lex('{{ r/^x/gim }}');
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_VARIABLE_START,
        tokenType.TokenType.TOKEN_REGEX,
        tokenType.TokenType.TOKEN_VARIABLE_END);

      // This one has a valid flag then an invalid flag.
      tokens = lex('{{ r/x$/iv }}');
      hasTokens(tokens,
        tokenType.TokenType.TOKEN_VARIABLE_START,
        tokenType.TokenType.TOKEN_REGEX,
        tokenType.TokenType.TOKEN_SYMBOL,
        tokenType.TokenType.TOKEN_VARIABLE_END);
    });


    it('should keep track of token positions', () => {
      hasTokens(lex('{{ 3 != 4 == 5 <= 6 >= 7 < 8 > 9 }}'),
        {
          type: tokenType.TokenType.TOKEN_VARIABLE_START,
          lineno: 0,
          colno: 0,
        },
        {
          type: tokenType.TokenType.TOKEN_INT,
          value: '3',
          lineno: 0,
          colno: 3,
        },
        {
          type: tokenType.TokenType.TOKEN_OPERATOR,
          value: '!=',
          lineno: 0,
          colno: 5,
        },
        {
          type: tokenType.TokenType.TOKEN_INT,
          value: '4',
          lineno: 0,
          colno: 8,
        },
        {
          type: tokenType.TokenType.TOKEN_OPERATOR,
          value: '==',
          lineno: 0,
          colno: 10,
        },
        {
          type: tokenType.TokenType.TOKEN_INT,
          value: '5',
          lineno: 0,
          colno: 13,
        },
        {
          type: tokenType.TokenType.TOKEN_OPERATOR,
          value: '<=',
          lineno: 0,
          colno: 15,
        },
        {
          type: tokenType.TokenType.TOKEN_INT,
          value: '6',
          lineno: 0,
          colno: 18,
        },
        {
          type: tokenType.TokenType.TOKEN_OPERATOR,
          lineno: 0,
          colno: 20,
          value: '>=',
        },
        {
          type: tokenType.TokenType.TOKEN_INT,
          lineno: 0,
          colno: 23,
          value: '7',
        },
        {
          type: tokenType.TokenType.TOKEN_OPERATOR,
          value: '<',
          lineno: 0,
          colno: 25,
        },
        {
          type: tokenType.TokenType.TOKEN_INT,
          value: '8',
          lineno: 0,
          colno: 27,
        },
        {
          type: tokenType.TokenType.TOKEN_OPERATOR,
          value: '>',
          lineno: 0,
          colno: 29,
        },
        {
          type: tokenType.TokenType.TOKEN_INT,
          value: '9',
          lineno: 0,
          colno: 31,
        },
        {
          type: tokenType.TokenType.TOKEN_VARIABLE_END,
          lineno: 0,
          colno: 33,
        });

      hasTokens(lex('{% if something %}{{ value }}{% else %}{{ otherValue }}{% endif %}'),
        {
          type: tokenType.TokenType.TOKEN_BLOCK_START,
          lineno: 0,
          colno: 0,
        },
        {
          type: tokenType.TokenType.TOKEN_SYMBOL,
          value: 'if',
          lineno: 0,
          colno: 3,
        },
        {
          type: tokenType.TokenType.TOKEN_SYMBOL,
          value: 'something',
          lineno: 0,
          colno: 6,
        },
        {
          type: tokenType.TokenType.TOKEN_BLOCK_END,
          lineno: 0,
          colno: 16,
        },
        {
          type: tokenType.TokenType.TOKEN_VARIABLE_START,
          lineno: 0,
          colno: 18,
        },
        {
          type: tokenType.TokenType.TOKEN_SYMBOL,
          value: 'value',
          lineno: 0,
          colno: 21,
        },
        {
          type: tokenType.TokenType.TOKEN_VARIABLE_END,
          lineno: 0,
          colno: 27,
        },
        {
          type: tokenType.TokenType.TOKEN_BLOCK_START,
          lineno: 0,
          colno: 29,
        },
        {
          type: tokenType.TokenType.TOKEN_SYMBOL,
          value: 'else',
          lineno: 0,
          colno: 32,
        },
        {
          type: tokenType.TokenType.TOKEN_BLOCK_END,
          lineno: 0,
          colno: 37,
        },
        {
          type: tokenType.TokenType.TOKEN_VARIABLE_START,
          lineno: 0,
          colno: 39,
        },
        {
          type: tokenType.TokenType.TOKEN_SYMBOL,
          value: 'otherValue',
          lineno: 0,
          colno: 42,
        },
        {
          type: tokenType.TokenType.TOKEN_VARIABLE_END,
          lineno: 0,
          colno: 53,
        },
        {
          type: tokenType.TokenType.TOKEN_BLOCK_START,
          lineno: 0,
          colno: 55,
        },
        {
          type: tokenType.TokenType.TOKEN_SYMBOL,
          value: 'endif',
          lineno: 0,
          colno: 58,
        },
        {
          type: tokenType.TokenType.TOKEN_BLOCK_END,
          lineno: 0,
          colno: 64,
        });

      hasTokens(lex('{% if something %}\n{{ value }}\n{% else %}\n{{ otherValue }}\n{% endif %}'),
        {
          type: tokenType.TokenType.TOKEN_BLOCK_START,
          lineno: 0,
          colno: 0,
        },
        {
          type: tokenType.TokenType.TOKEN_SYMBOL,
          value: 'if',
          lineno: 0,
          colno: 3,
        },
        {
          type: tokenType.TokenType.TOKEN_SYMBOL,
          value: 'something',
          lineno: 0,
          colno: 6,
        },
        {
          type: tokenType.TokenType.TOKEN_BLOCK_END,
          lineno: 0,
          colno: 16,
        },
        {
          type: tokenType.TokenType.TOKEN_DATA,
          value: '\n',
        },
        {
          type: tokenType.TokenType.TOKEN_VARIABLE_START,
          lineno: 1,
          colno: 0,
        },
        {
          type: tokenType.TokenType.TOKEN_SYMBOL,
          value: 'value',
          lineno: 1,
          colno: 3,
        },
        {
          type: tokenType.TokenType.TOKEN_VARIABLE_END,
          lineno: 1,
          colno: 9,
        },
        {
          type: tokenType.TokenType.TOKEN_DATA,
          value: '\n',
        },
        {
          type: tokenType.TokenType.TOKEN_BLOCK_START,
          lineno: 2,
          colno: 0,
        },
        {
          type: tokenType.TokenType.TOKEN_SYMBOL,
          value: 'else',
          lineno: 2,
          colno: 3,
        },
        {
          type: tokenType.TokenType.TOKEN_BLOCK_END,
          lineno: 2,
          colno: 8,
        },
        {
          type: tokenType.TokenType.TOKEN_DATA,
          value: '\n',
        },
        {
          type: tokenType.TokenType.TOKEN_VARIABLE_START,
          lineno: 3,
          colno: 0,
        },
        {
          type: tokenType.TokenType.TOKEN_SYMBOL,
          value: 'otherValue',
          lineno: 3,
          colno: 3,
        },
        {
          type: tokenType.TokenType.TOKEN_VARIABLE_END,
          lineno: 3,
          colno: 14,
        },
        {
          type: tokenType.TokenType.TOKEN_DATA,
          value: '\n',
        },
        {
          type: tokenType.TokenType.TOKEN_BLOCK_START,
          lineno: 4,
          colno: 0,
        },
        {
          type: tokenType.TokenType.TOKEN_SYMBOL,
          value: 'endif',
          lineno: 4,
          colno: 3,
        },
        {
          type: tokenType.TokenType.TOKEN_BLOCK_END,
          lineno: 4,
          colno: 9,
        });
    });
  });
})());
