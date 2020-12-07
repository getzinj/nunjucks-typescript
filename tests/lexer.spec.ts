declare var nunjucks;

((() => {
  'use strict';


  let expect;
  let lib;
  let Tokenizer;
  let TokenType;

  if (typeof require !== 'undefined') {
    expect = require('expect.js');
    lib = require('../nunjucks/src/lib');
    Tokenizer = require('../nunjucks/src/compiler/lexer/tokenizer').Tokenizer;
    TokenType = require('../nunjucks/src/compiler/lexer/tokenType').TokenType;
  } else {
    expect = window['expect'];
    lib = nunjucks.lib;
    Tokenizer = nunjucks.Tokenizer;
    TokenType = nunjucks.TokenType;
  }


  function lex(src, opts?) {
    return new Tokenizer(src, opts);
  }


  function _hasTokens(ws, tokens, types): void {
    for (let i = 0; i < types.length; i++) {
      let type = types[i];
      let tok = tokens.nextToken();
      if (!ws) {
        while (tok && tok.type === TokenType.TOKEN_WHITESPACE) {
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
      expect(tok.type).to.be(TokenType.TOKEN_DATA);
      expect(tok.value).to.be('3');

      let tmpl = 'foo bar bizzle 3 [1,2] !@#$%^&*()<>?:"{}|';
      tok = lex(tmpl).nextToken();
      expect(tok.type).to.be(TokenType.TOKEN_DATA);
      expect(tok.value).to.be(tmpl);
    });


    it('should keep track of whitespace', () => {
      tokens = lex('data {% 1 2\n   3  %} data');
      hasTokensWithWS(tokens,
        TokenType.TOKEN_DATA,
        TokenType.TOKEN_BLOCK_START,
        [ TokenType.TOKEN_WHITESPACE, ' ' ],
        TokenType.TOKEN_INT,
        [ TokenType.TOKEN_WHITESPACE, ' ' ],
        TokenType.TOKEN_INT,
        [ TokenType.TOKEN_WHITESPACE, '\n   ' ],
        TokenType.TOKEN_INT,
        [ TokenType.TOKEN_WHITESPACE, '  ' ],
        TokenType.TOKEN_BLOCK_END,
        TokenType.TOKEN_DATA);
    });


    it('should trim blocks', () => {
      tokens = lex('  {% if true %}\n    foo\n  {% endif %}\n', { trimBlocks: true });
      hasTokens(tokens,
        [ TokenType.TOKEN_DATA, '  ' ],
        TokenType.TOKEN_BLOCK_START,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_BOOLEAN,
        TokenType.TOKEN_BLOCK_END,
        [ TokenType.TOKEN_DATA, '    foo\n  ' ],
        TokenType.TOKEN_BLOCK_START,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_BLOCK_END);
    });


    it('should trim windows-style CRLF line endings after blocks', () => {
      tokens = lex('  {% if true %}\r\n    foo\r\n  {% endif %}\r\n', { trimBlocks: true });
      hasTokens(tokens,
        [ TokenType.TOKEN_DATA, '  ' ],
        TokenType.TOKEN_BLOCK_START,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_BOOLEAN,
        TokenType.TOKEN_BLOCK_END,
        [ TokenType.TOKEN_DATA, '    foo\r\n  ' ],
        TokenType.TOKEN_BLOCK_START,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_BLOCK_END);
    });


    it('should not trim CR after blocks', () => {
      tokens = lex('  {% if true %}\r    foo\r\n  {% endif %}\r', { trimBlocks: true });
      hasTokens(tokens,
        [ TokenType.TOKEN_DATA, '  ' ],
        TokenType.TOKEN_BLOCK_START,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_BOOLEAN,
        TokenType.TOKEN_BLOCK_END,
        [ TokenType.TOKEN_DATA, '\r    foo\r\n  ' ],
        TokenType.TOKEN_BLOCK_START,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_BLOCK_END,
        [ TokenType.TOKEN_DATA, '\r' ]);
    });


    it('should lstrip and trim blocks', () => {
      tokens = lex('test\n {% if true %}\n  foo\n {% endif %}\n</div>', {
        lstripBlocks: true,
        trimBlocks: true
      });
      hasTokens(tokens,
        [ TokenType.TOKEN_DATA, 'test\n' ],
        TokenType.TOKEN_BLOCK_START,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_BOOLEAN,
        TokenType.TOKEN_BLOCK_END,
        [ TokenType.TOKEN_DATA, '  foo\n' ],
        TokenType.TOKEN_BLOCK_START,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_BLOCK_END,
        [ TokenType.TOKEN_DATA, '</div>' ]);
    });


    it('should lstrip and not collapse whitespace between blocks', () => {
      tokens = lex('   {% t %} {% t %}', { lstripBlocks: true });
      hasTokens(tokens,
        TokenType.TOKEN_BLOCK_START,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_BLOCK_END,
        [ TokenType.TOKEN_DATA, ' ' ],
        TokenType.TOKEN_BLOCK_START,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_BLOCK_END);
    });



    it('should parse variable start and end', () => {
      tokens = lex('data {{ foo }} bar bizzle');
      hasTokens(tokens,
        TokenType.TOKEN_DATA,
        TokenType.TOKEN_VARIABLE_START,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_VARIABLE_END,
        TokenType.TOKEN_DATA);
    });


    it('should treat the non-breaking space as valid whitespace', () => {
      tokens = lex('{{\u00A0foo }}');
      tok = tokens.nextToken();
      tok = tokens.nextToken();
      tok = tokens.nextToken();
      expect(tok.type).to.be(TokenType.TOKEN_SYMBOL);
      expect(tok.value).to.be('foo');
    });


    it('should parse block start and end', () => {
      tokens = lex('data {% foo %} bar bizzle');
      hasTokens(tokens,
        TokenType.TOKEN_DATA,
        TokenType.TOKEN_BLOCK_START,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_BLOCK_END,
        TokenType.TOKEN_DATA);
    });


    it('should parse basic types', () => {
      tokens = lex('{{ 3 4.5 true false none foo "hello" \'boo\' r/regex/ }}');
      hasTokens(tokens,
        TokenType.TOKEN_VARIABLE_START,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_FLOAT,
        TokenType.TOKEN_BOOLEAN,
        TokenType.TOKEN_BOOLEAN,
        TokenType.TOKEN_NONE,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_STRING,
        TokenType.TOKEN_STRING,
        TokenType.TOKEN_REGEX,
        TokenType.TOKEN_VARIABLE_END);
    });


    it('should parse function calls', () => {
      tokens = lex('{{ foo(bar) }}');
      hasTokens(tokens,
        TokenType.TOKEN_VARIABLE_START,
        [ TokenType.TOKEN_SYMBOL, 'foo' ],
        TokenType.TOKEN_LEFT_PAREN,
        [ TokenType.TOKEN_SYMBOL, 'bar' ],
        TokenType.TOKEN_RIGHT_PAREN,
        TokenType.TOKEN_VARIABLE_END);
    });


    it('should parse groups', () => {
      tokens = lex('{{ (1, 2, 3) }}');
      hasTokens(tokens,
        TokenType.TOKEN_VARIABLE_START,
        TokenType.TOKEN_LEFT_PAREN,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_COMMA,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_COMMA,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_RIGHT_PAREN,
        TokenType.TOKEN_VARIABLE_END);
    });


    it('should parse arrays', () => {
      tokens = lex('{{ [1, 2, 3] }}');
      hasTokens(tokens,
        TokenType.TOKEN_VARIABLE_START,
        TokenType.TOKEN_LEFT_BRACKET,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_COMMA,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_COMMA,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_RIGHT_BRACKET,
        TokenType.TOKEN_VARIABLE_END);
    });


    it('should parse dicts', () => {
      tokens = lex('{{ {one:1, "two":2} }}');
      hasTokens(tokens,
        TokenType.TOKEN_VARIABLE_START,
        TokenType.TOKEN_LEFT_CURLY,
        [ TokenType.TOKEN_SYMBOL, 'one' ],
        TokenType.TOKEN_COLON,
        [ TokenType.TOKEN_INT, '1' ],
        TokenType.TOKEN_COMMA,
        [ TokenType.TOKEN_STRING, 'two' ],
        TokenType.TOKEN_COLON,
        [ TokenType.TOKEN_INT, '2' ],
        TokenType.TOKEN_RIGHT_CURLY,
        TokenType.TOKEN_VARIABLE_END);
    });


    it('should parse blocks without whitespace', () => {
      tokens = lex('data{{hello}}{%if%}data');
      hasTokens(tokens,
        TokenType.TOKEN_DATA,
        TokenType.TOKEN_VARIABLE_START,
        [ TokenType.TOKEN_SYMBOL, 'hello' ],
        TokenType.TOKEN_VARIABLE_END,
        TokenType.TOKEN_BLOCK_START,
        [ TokenType.TOKEN_SYMBOL, 'if' ],
        TokenType.TOKEN_BLOCK_END,
        TokenType.TOKEN_DATA);
    });


    it('should parse filters', () => {
      hasTokens(lex('{{ foo|bar }}'),
        TokenType.TOKEN_VARIABLE_START,
        [ TokenType.TOKEN_SYMBOL, 'foo' ],
        TokenType.TOKEN_PIPE,
        [ TokenType.TOKEN_SYMBOL, 'bar' ],
        TokenType.TOKEN_VARIABLE_END);
    });


    it('should parse operators', () => {
      hasTokens(lex('{{ 3+3-3*3/3 }}'),
        TokenType.TOKEN_VARIABLE_START,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_OPERATOR,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_OPERATOR,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_OPERATOR,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_OPERATOR,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_VARIABLE_END);

      hasTokens(lex('{{ 3**4//5 }}'),
        TokenType.TOKEN_VARIABLE_START,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_OPERATOR,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_OPERATOR,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_VARIABLE_END);

      hasTokens(lex('{{ 3 != 4 == 5 <= 6 >= 7 < 8 > 9 }}'),
        TokenType.TOKEN_VARIABLE_START,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_OPERATOR,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_OPERATOR,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_OPERATOR,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_OPERATOR,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_OPERATOR,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_OPERATOR,
        TokenType.TOKEN_INT,
        TokenType.TOKEN_VARIABLE_END);
    });


    it('should parse comments', () => {
      tokens = lex('data data {# comment #} data');
      hasTokens(tokens,
        TokenType.TOKEN_DATA,
        TokenType.TOKEN_COMMENT,
        TokenType.TOKEN_DATA);
    });


    it('should allow changing the variable start and end', () => {
      tokens = lex('data {= var =}', {
        tags: {
          variableStart: '{=',
          variableEnd: '=}'
        }
      });
      hasTokens(tokens,
        TokenType.TOKEN_DATA,
        TokenType.TOKEN_VARIABLE_START,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_VARIABLE_END);
    });


    it('should allow changing the block start and end', () => {
      tokens = lex('{= =}', {
        tags: {
          blockStart: '{=',
          blockEnd: '=}'
        }
      });
      hasTokens(tokens,
        TokenType.TOKEN_BLOCK_START,
        TokenType.TOKEN_BLOCK_END);
    });


    it('should allow changing the variable start and end', () => {
      tokens = lex('data {= var =}', {
        tags: {
          variableStart: '{=',
          variableEnd: '=}'
        }
      });
      hasTokens(tokens,
        TokenType.TOKEN_DATA,
        TokenType.TOKEN_VARIABLE_START,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_VARIABLE_END);
    });


    it('should allow changing the comment start and end', () => {
      tokens = lex('<!-- A comment! -->', {
        tags: {
          commentStart: '<!--',
          commentEnd: '-->'
        }
      });
      hasTokens(tokens,
        TokenType.TOKEN_COMMENT);
    });

    /**
     * Test that this bug is fixed: https://github.com/mozilla/nunjucks/issues/235
     */

    it('should have individual lexer tag settings for each environment', () => {
      tokens = lex('{=', { tags: { variableStart: '{=' } });
      hasTokens(tokens, TokenType.TOKEN_VARIABLE_START);

      tokens = lex('{{');
      hasTokens(tokens, TokenType.TOKEN_VARIABLE_START);

      tokens = lex('{{', { tags: { variableStart: '<<<' } });
      hasTokens(tokens, TokenType.TOKEN_DATA);

      tokens = lex('{{');
      hasTokens(tokens, TokenType.TOKEN_VARIABLE_START);
    });


    it('should parse regular expressions', () => {
      tokens = lex('{{ r/basic regex [a-z]/ }}');
      hasTokens(tokens,
        TokenType.TOKEN_VARIABLE_START,
        TokenType.TOKEN_REGEX,
        TokenType.TOKEN_VARIABLE_END);

      // A more complex regex with escaped slashes.
      tokens = lex('{{ r/{a*b} \\/regex! [0-9]\\// }}');
      hasTokens(tokens,
        TokenType.TOKEN_VARIABLE_START,
        TokenType.TOKEN_REGEX,
        TokenType.TOKEN_VARIABLE_END);

      // This one has flags.
      tokens = lex('{{ r/^x/gim }}');
      hasTokens(tokens,
        TokenType.TOKEN_VARIABLE_START,
        TokenType.TOKEN_REGEX,
        TokenType.TOKEN_VARIABLE_END);

      // This one has a valid flag then an invalid flag.
      tokens = lex('{{ r/x$/iv }}');
      hasTokens(tokens,
        TokenType.TOKEN_VARIABLE_START,
        TokenType.TOKEN_REGEX,
        TokenType.TOKEN_SYMBOL,
        TokenType.TOKEN_VARIABLE_END);
    });


    it('should keep track of token positions', () => {
      hasTokens(lex('{{ 3 != 4 == 5 <= 6 >= 7 < 8 > 9 }}'),
        {
          type: TokenType.TOKEN_VARIABLE_START,
          lineno: 0,
          colno: 0,
        },
        {
          type: TokenType.TOKEN_INT,
          value: '3',
          lineno: 0,
          colno: 3,
        },
        {
          type: TokenType.TOKEN_OPERATOR,
          value: '!=',
          lineno: 0,
          colno: 5,
        },
        {
          type: TokenType.TOKEN_INT,
          value: '4',
          lineno: 0,
          colno: 8,
        },
        {
          type: TokenType.TOKEN_OPERATOR,
          value: '==',
          lineno: 0,
          colno: 10,
        },
        {
          type: TokenType.TOKEN_INT,
          value: '5',
          lineno: 0,
          colno: 13,
        },
        {
          type: TokenType.TOKEN_OPERATOR,
          value: '<=',
          lineno: 0,
          colno: 15,
        },
        {
          type: TokenType.TOKEN_INT,
          value: '6',
          lineno: 0,
          colno: 18,
        },
        {
          type: TokenType.TOKEN_OPERATOR,
          lineno: 0,
          colno: 20,
          value: '>=',
        },
        {
          type: TokenType.TOKEN_INT,
          lineno: 0,
          colno: 23,
          value: '7',
        },
        {
          type: TokenType.TOKEN_OPERATOR,
          value: '<',
          lineno: 0,
          colno: 25,
        },
        {
          type: TokenType.TOKEN_INT,
          value: '8',
          lineno: 0,
          colno: 27,
        },
        {
          type: TokenType.TOKEN_OPERATOR,
          value: '>',
          lineno: 0,
          colno: 29,
        },
        {
          type: TokenType.TOKEN_INT,
          value: '9',
          lineno: 0,
          colno: 31,
        },
        {
          type: TokenType.TOKEN_VARIABLE_END,
          lineno: 0,
          colno: 33,
        });

      hasTokens(lex('{% if something %}{{ value }}{% else %}{{ otherValue }}{% endif %}'),
        {
          type: TokenType.TOKEN_BLOCK_START,
          lineno: 0,
          colno: 0,
        },
        {
          type: TokenType.TOKEN_SYMBOL,
          value: 'if',
          lineno: 0,
          colno: 3,
        },
        {
          type: TokenType.TOKEN_SYMBOL,
          value: 'something',
          lineno: 0,
          colno: 6,
        },
        {
          type: TokenType.TOKEN_BLOCK_END,
          lineno: 0,
          colno: 16,
        },
        {
          type: TokenType.TOKEN_VARIABLE_START,
          lineno: 0,
          colno: 18,
        },
        {
          type: TokenType.TOKEN_SYMBOL,
          value: 'value',
          lineno: 0,
          colno: 21,
        },
        {
          type: TokenType.TOKEN_VARIABLE_END,
          lineno: 0,
          colno: 27,
        },
        {
          type: TokenType.TOKEN_BLOCK_START,
          lineno: 0,
          colno: 29,
        },
        {
          type: TokenType.TOKEN_SYMBOL,
          value: 'else',
          lineno: 0,
          colno: 32,
        },
        {
          type: TokenType.TOKEN_BLOCK_END,
          lineno: 0,
          colno: 37,
        },
        {
          type: TokenType.TOKEN_VARIABLE_START,
          lineno: 0,
          colno: 39,
        },
        {
          type: TokenType.TOKEN_SYMBOL,
          value: 'otherValue',
          lineno: 0,
          colno: 42,
        },
        {
          type: TokenType.TOKEN_VARIABLE_END,
          lineno: 0,
          colno: 53,
        },
        {
          type: TokenType.TOKEN_BLOCK_START,
          lineno: 0,
          colno: 55,
        },
        {
          type: TokenType.TOKEN_SYMBOL,
          value: 'endif',
          lineno: 0,
          colno: 58,
        },
        {
          type: TokenType.TOKEN_BLOCK_END,
          lineno: 0,
          colno: 64,
        });

      hasTokens(lex('{% if something %}\n{{ value }}\n{% else %}\n{{ otherValue }}\n{% endif %}'),
        {
          type: TokenType.TOKEN_BLOCK_START,
          lineno: 0,
          colno: 0,
        },
        {
          type: TokenType.TOKEN_SYMBOL,
          value: 'if',
          lineno: 0,
          colno: 3,
        },
        {
          type: TokenType.TOKEN_SYMBOL,
          value: 'something',
          lineno: 0,
          colno: 6,
        },
        {
          type: TokenType.TOKEN_BLOCK_END,
          lineno: 0,
          colno: 16,
        },
        {
          type: TokenType.TOKEN_DATA,
          value: '\n',
        },
        {
          type: TokenType.TOKEN_VARIABLE_START,
          lineno: 1,
          colno: 0,
        },
        {
          type: TokenType.TOKEN_SYMBOL,
          value: 'value',
          lineno: 1,
          colno: 3,
        },
        {
          type: TokenType.TOKEN_VARIABLE_END,
          lineno: 1,
          colno: 9,
        },
        {
          type: TokenType.TOKEN_DATA,
          value: '\n',
        },
        {
          type: TokenType.TOKEN_BLOCK_START,
          lineno: 2,
          colno: 0,
        },
        {
          type: TokenType.TOKEN_SYMBOL,
          value: 'else',
          lineno: 2,
          colno: 3,
        },
        {
          type: TokenType.TOKEN_BLOCK_END,
          lineno: 2,
          colno: 8,
        },
        {
          type: TokenType.TOKEN_DATA,
          value: '\n',
        },
        {
          type: TokenType.TOKEN_VARIABLE_START,
          lineno: 3,
          colno: 0,
        },
        {
          type: TokenType.TOKEN_SYMBOL,
          value: 'otherValue',
          lineno: 3,
          colno: 3,
        },
        {
          type: TokenType.TOKEN_VARIABLE_END,
          lineno: 3,
          colno: 14,
        },
        {
          type: TokenType.TOKEN_DATA,
          value: '\n',
        },
        {
          type: TokenType.TOKEN_BLOCK_START,
          lineno: 4,
          colno: 0,
        },
        {
          type: TokenType.TOKEN_SYMBOL,
          value: 'endif',
          lineno: 4,
          colno: 3,
        },
        {
          type: TokenType.TOKEN_BLOCK_END,
          lineno: 4,
          colno: 9,
        });
    });
  });
})());
