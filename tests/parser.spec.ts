import { Parser } from '../nunjucks/src/compiler/parser/parser';
import { NunjucksNode } from '../nunjucks/src/nodes/nunjucksNode';
import { IExtension } from '../nunjucks/src/interfaces/IExtension';
import { NunjucksNodeList } from '../nunjucks/src/nodes/nunjucksNodeList';
import { INunjucksNode } from '../nunjucks/src/nodes/INunjucksNode';


(function(): void {
  'use strict';

  let parser: Parser = new Parser();
  let expect,
      lib;

  let Root;
  let Group;
  let Or;
  let Import;
  let In;
  let Macro;
  let Is;
  let Case;
  let Concat;
  let FunCall;
  let Output;
  let Literal;
  let Compare;
  let Pair;
  let CallExtension;
  let CompareOperand;
  let For;
  let FromImport;
  let Not;
  let TemplateData;
  let Switch;
  let Filter;
  let Caller;
  let And;
  let KeywordArgs;
  let If;
  let NunjucksSymbol;
  let ArrayNode;
  let Dict;

    expect = require('expect.js');
    lib = require('../nunjucks/src/lib');
    Root = require('../nunjucks/src/nodes/root').Root;
    Group = require('../nunjucks/src/nodes/group').Group;
    Or = require('../nunjucks/src/nodes/operators/or').Or;
    Import = require('../nunjucks/src/nodes/import').Import;
    In = require('../nunjucks/src/nodes/operators/in').In;
    Macro = require('../nunjucks/src/nodes/macro').Macro;
    Is = require('../nunjucks/src/nodes/operators/is').Is;
    Case = require('../nunjucks/src/nodes/case').Case;
    Concat = require('../nunjucks/src/nodes/operators/concat').Concat;
    FunCall = require('../nunjucks/src/nodes/funCall').FunCall;
    Output = require('../nunjucks/src/nodes/output').Output;
    Literal = require('../nunjucks/src/nodes/literal').Literal;
    Compare = require('../nunjucks/src/nodes/compare').Compare;
    Pair = require('../nunjucks/src/nodes/pair').Pair;
    CallExtension = require('../nunjucks/src/nodes/callExtension').CallExtension;
    CompareOperand = require('../nunjucks/src/nodes/compareOperand').CompareOperand;
    For = require('../nunjucks/src/nodes/for').For;
    FromImport = require('../nunjucks/src/nodes/fromImport').FromImport;
    Not = require('../nunjucks/src/nodes/operators/not').Not;
    TemplateData = require('../nunjucks/src/nodes/templateData').TemplateData;
    Switch = require('../nunjucks/src/nodes/switch').Switch;
    Filter = require('../nunjucks/src/nodes/filter').Filter;
    Caller = require('../nunjucks/src/nodes/caller').Caller;
    And = require('../nunjucks/src/nodes/operators/and').And;
    KeywordArgs = require('../nunjucks/src/nodes/keywordArgs').KeywordArgs;
    If = require('../nunjucks/src/nodes/if').If;
    NunjucksSymbol = require('../nunjucks/src/nodes/nunjucksSymbol').NunjucksSymbol;
    ArrayNode = require('../nunjucks/src/nodes/arrayNode').ArrayNode;
    Dict = require('../nunjucks/src/nodes/dict').Dict;

  function _isAST(node1: INunjucksNode, node2: INunjucksNode): void {
    // Compare ASTs
    // TODO: Clean this up (seriously, really)
    /* eslint-disable vars-on-top */

    expect(node1.typename).to.be(node2.typename);

    if (node2 instanceof NunjucksNodeList) {
      const lit: string = ': num-children: ';
      const sig2: string = (node2.typename + lit + node2.children.length);

      expect(node1.children).to.be.ok();
      const sig1: string = (node1.typename + lit + node1.children.length);

      expect(sig1).to.be(sig2);

      let n: number = 0;
      const l: number = node2.children.length;
      for (; n < l; n++) {
        _isAST(node1.children[n], node2.children[n]);
      }
    } else {
      node2.iterFields(function(value, field): void {
        const ofield = node1[field];

        if (value instanceof NunjucksNode) {
          _isAST(ofield, value);
        } else if (lib.isArray(ofield) && lib.isArray(value)) {
          expect('num-children: ' + ofield.length).to.be('num-children: ' + value.length);

          lib.each(ofield, function(v, i): void {
            if (ofield[i] instanceof NunjucksNode) {
              _isAST(ofield[i], value[i]);
            } else if (ofield[i] !== null && value[i] !== null) {
              expect(ofield[i]).to.be(value[i]);
            }
          });
        } else if ((ofield !== null || value !== null) &&
          (ofield !== undefined || value !== undefined)) {
          if (ofield === null) {
            throw new Error(value + ' expected for "' + field +
              '", null found');
          }

          if (value === null) {
            throw new Error(ofield + ' expected to be null for "' +
              field + '"');
          }

          // We want good errors and tracebacks, so test on
          // whichever object exists
          if (!ofield) {
            expect(value).to.be(ofield);
          } else if (ofield !== null && ofield instanceof RegExp) {
            // This conditional check for RegExp is needed because /a/ != /a/
            expect(String(ofield)).to.be(String(value));
          } else {
            expect(ofield).to.be(value);
          }
        }
      });
    }
  }

  function isAST(node1, ast): void {
    // Compare the ASTs, the second one is an AST literal so transform
    // it into a real one
    return _isAST(node1, toNodes(ast));
  }

  // We'll be doing a lot of AST comparisons, so this defines a kind
  // of "AST literal" that you can specify with arrays. This
  function createInstanceOfType(Type, ... args) {
    switch (Type) {
      case Compare: // @ts-ignore
        return new Compare(... args);
      case Macro: // @ts-ignore
        return new Macro(... args);
      case Not: // @ts-ignore
        return new Not(... args);
      case TemplateData: // @ts-ignore
        return new TemplateData(... args);
      case Literal: // @ts-ignore
        return new Literal(... args);
      case Output: // @ts-ignore
        return new Output(... args);
      case Import: // @ts-ignore
        return new Import(... args);
      case Pair: // @ts-ignore
        return new Pair(... args);
      case ArrayNode: // @ts-ignore
        return new ArrayNode(... args);
      case And: // @ts-ignore
        return new And(... args);
      case If: // @ts-ignore
        return new If(... args);
      case Filter: // @ts-ignore
        return new Filter(... args);
      case For: // @ts-ignore
        return new For(... args);
      case Is: // @ts-ignore
        return new Is(... args);
      case In: // @ts-ignore
        return new In(... args);
      case Caller: // @ts-ignore
        return new Caller(... args);
      case Root: // @ts-ignore
        return new Root(... args);
      case KeywordArgs: // @ts-ignore
        return new KeywordArgs(... args);
      case Concat: // @ts-ignore
        return new Concat(... args);
      case Dict: // @ts-ignore
        return new Dict(... args);
      case Group: // @ts-ignore
        return new Group(... args);
      case CallExtension: // @ts-ignore
        return new CallExtension(... args);
      case Switch: // @ts-ignore
        return new Switch(... args);
      case CompareOperand: // @ts-ignore
        return new CompareOperand(... args);
      case FromImport: // @ts-ignore
        return new FromImport(... args);
      case FunCall: // @ts-ignore
        return new FunCall(... args);
      case Case: // @ts-ignore
        return new Case(... args);
      case Or: // @ts-ignore
        return new Or(... args);
      // case NunjucksNode: // @ts-ignore
      //   return new NunjucksNode(... args);
      case NunjucksNodeList: // @ts-ignore
        return new NunjucksNodeList(... args);
      case NunjucksSymbol: // @ts-ignore
        return new NunjucksSymbol(... args);
      default:
        throw new Error(`Unexpected type ${ Type }.`);
    }
  }


  // transforms it into a real AST.
  function toNodes(ast) {
    if (!(ast && lib.isArray(ast))) { // TODO: Maybe this needs to be fixed
      return ast;
    }

    const Type = ast[0];
    // some nodes have fields (e.g. Compare.ops) which are plain arrays
    if (Type instanceof Array) {
      return lib.map(ast, toNodes); // TODO: Maybe this needs to be fixed
    }
    const F: () => void = function(): void {
    };
    F.prototype = Type.prototype;

    const dummy = new F();

    if (dummy instanceof NunjucksNodeList) {
      return createInstanceOfType(Type, 0, 0, lib.map(ast.slice(1), toNodes));
    } else if (dummy instanceof CallExtension) {
      return createInstanceOfType(Type, ast[1], ast[2], ast[3] ? toNodes(ast[3]) : ast[3],
        lib.isArray(ast[4]) ? lib.map(ast[4], toNodes) : ast[4]);
    } else {
      return createInstanceOfType(Type, 0, 0,
        toNodes(ast[1]),
        toNodes(ast[2]),
        toNodes(ast[3]),
        toNodes(ast[4]),
        toNodes(ast[5]));
    }
  }


  describe('parser', function(): void {
    it('should parse basic types', function(): void {
      isAST(parser.parseSource('{{ 1 }}'),
        [ Root,
          [ Output,
            [ Literal, 1 ] ] ]);

      isAST(parser.parseSource('{{ 4.567 }}'),
        [ Root,
          [ Output,
            [ Literal, 4.567 ] ] ]);

      isAST(parser.parseSource('{{ "foo" }}'),
        [ Root,
          [ Output,
            [ Literal, 'foo' ] ] ]);

      isAST(parser.parseSource('{{ \'foo\' }}'),
        [ Root,
          [ Output,
            [ Literal, 'foo' ] ] ]);

      isAST(parser.parseSource('{{ true }}'),
        [ Root,
          [ Output,
            [ Literal, true ] ] ]);

      isAST(parser.parseSource('{{ false }}'),
        [ Root,
          [ Output,
            [ Literal, false ] ] ]);

      isAST(parser.parseSource('{{ none }}'),
        [ Root,
          [ Output,
            [ Literal, null ] ] ]);

      isAST(parser.parseSource('{{ foo }}'),
        [ Root,
          [ Output,
            [ NunjucksSymbol, 'foo' ] ] ]);

      isAST(parser.parseSource('{{ r/23/gi }}'),
        [ Root,
          [ Output,
            [ Literal, new RegExp('23', 'gi') ] ] ]);
    });


    it('should parse aggregate types', function(): void {
      isAST(parser.parseSource('{{ [1,2,3] }}'),
        [ Root,
          [ Output,
            [ ArrayNode,
              [ Literal, 1 ],
              [ Literal, 2 ],
              [ Literal, 3 ] ] ] ]);

      isAST(parser.parseSource('{{ (1,2,3) }}'),
        [ Root,
          [ Output,
            [ Group,
              [ Literal, 1 ],
              [ Literal, 2 ],
              [ Literal, 3 ] ] ] ]);

      isAST(parser.parseSource('{{ {foo: 1, \'two\': 2} }}'),
        [ Root,
          [ Output,
            [ Dict,
              [ Pair,
                [ NunjucksSymbol, 'foo' ],
                [ Literal, 1 ] ],
              [ Pair,
                [ Literal, 'two' ],
                [ Literal, 2 ] ] ] ] ]);
    });


    it('should parse variables', function(): void {
      isAST(parser.parseSource('hello {{ foo }}, how are you'),
        [ Root,
          [ Output, [ TemplateData, 'hello ' ] ],
          [ Output, [ NunjucksSymbol, 'foo' ] ],
          [ Output, [ TemplateData, ', how are you' ] ] ]);
    });


    it('should parse operators', function(): void {
      isAST(parser.parseSource('{{ x == y }}'),
        [ Root,
          [ Output,
            [ Compare,
              [ NunjucksSymbol, 'x' ],
              [ [ CompareOperand, [ NunjucksSymbol, 'y' ], '==' ] ] ] ] ]);

      isAST(parser.parseSource('{{ x or y }}'),
        [ Root,
          [ Output,
            [ Or,
              [ NunjucksSymbol, 'x' ],
              [ NunjucksSymbol, 'y' ] ] ] ]);

      isAST(parser.parseSource('{{ x in y }}'),
        [ Root,
          [ Output,
            [ In,
              [ NunjucksSymbol, 'x' ],
              [ NunjucksSymbol, 'y' ] ] ] ]);

      isAST(parser.parseSource('{{ x not in y }}'),
        [ Root,
          [ Output,
            [ Not,
              [ In,
                [ NunjucksSymbol, 'x' ],
                [ NunjucksSymbol, 'y' ] ] ] ] ]);

      isAST(parser.parseSource('{{ x is callable }}'),
        [ Root,
          [ Output,
            [ Is,
              [ NunjucksSymbol, 'x' ],
              [ NunjucksSymbol, 'callable' ] ] ] ]);

      isAST(parser.parseSource('{{ x is not callable }}'),
        [ Root,
          [ Output,
            [ Not,
              [ Is,
                [ NunjucksSymbol, 'x' ],
                [ NunjucksSymbol, 'callable' ] ] ] ] ]);
    });


    it('should parse tilde', function(): void {
      isAST(parser.parseSource('{{ 2 ~ 3 }}'),
        [ Root,
          [ Output,
            [ Concat,
              [ Literal, 2 ],
              [ Literal, 3 ]
            ] ] ]
      );
    });


    it('should parse operators with correct precedence', function(): void {
      isAST(parser.parseSource('{{ x in y and z }}'),
        [ Root,
          [ Output,
            [ And,
              [ In,
                [ NunjucksSymbol, 'x' ],
                [ NunjucksSymbol, 'y' ] ],
              [ NunjucksSymbol, 'z' ] ] ] ]);

      isAST(parser.parseSource('{{ x not in y or z }}'),
        [ Root,
          [ Output,
            [ Or,
              [ Not,
                [ In,
                  [ NunjucksSymbol, 'x' ],
                  [ NunjucksSymbol, 'y' ] ] ],
              [ NunjucksSymbol, 'z' ] ] ] ]);

      isAST(parser.parseSource('{{ x or y and z }}'),
        [ Root,
          [ Output,
            [ Or,
              [ NunjucksSymbol, 'x' ],
              [ And,
                [ NunjucksSymbol, 'y' ],
                [ NunjucksSymbol, 'z' ] ] ] ] ]);
    });


    it('should parse blocks', function(): void {
      let n = parser.parseSource('want some {% if hungry %}pizza{% else %}' +
          'water{% endif %}?');
      expect(n.children[1].typename).to.be('If');

      n = parser.parseSource('{% block foo %}stuff{% endblock %}');
      expect(n.children[0].typename).to.be('Block');

      n = parser.parseSource('{% block foo %}stuff{% endblock foo %}');
      expect(n.children[0].typename).to.be('Block');

      n = parser.parseSource('{% extends "test.njk" %}stuff');
      expect(n.children[0].typename).to.be('Extends');

      n = parser.parseSource('{% include "test.njk" %}');
      expect(n.children[0].typename).to.be('Include');
    });


    it('should accept attributes and methods of static arrays, objects and primitives', function(): void {
      expect(function(): void {
        parser.parseSource('{{ ([1, 2, 3]).indexOf(1) }}');
      }).to.not.throwException();

      expect(function(): void {
        parser.parseSource('{{ [1, 2, 3].length }}');
      }).to.not.throwException();

      expect(function(): void {
        parser.parseSource('{{ "Some String".replace("S", "$") }}');
      }).to.not.throwException();

      expect(function(): void {
        parser.parseSource('{{ ({ name : "Khalid" }).name }}');
      }).to.not.throwException();

      expect(function(): void {
        parser.parseSource('{{ 1.618.toFixed(2) }}');
      }).to.not.throwException();
    });


    it('should parse include tags', function(): void {
      let n = parser.parseSource('{% include "test.njk" %}');
      expect(n.children[0].typename).to.be('Include');

      n = parser.parseSource('{% include "test.html"|replace("html","j2") %}');
      expect(n.children[0].typename).to.be('Include');

      n = parser.parseSource('{% include ""|default("test.njk") %}');
      expect(n.children[0].typename).to.be('Include');
    });


    it('should parse for loops', function(): void {
      isAST(parser.parseSource('{% for x in [1, 2] %}{{ x }}{% endfor %}'),
        [ Root,
          [ For,
            [ ArrayNode,
              [ Literal, 1 ],
              [ Literal, 2 ] ],
            [ NunjucksSymbol, 'x' ],
            [ NunjucksNodeList,
              [ Output,
                [ NunjucksSymbol, 'x' ] ] ] ] ]);
    });


    it('should parse for loops with else', function(): void {
      isAST(parser.parseSource('{% for x in [] %}{{ x }}{% else %}empty{% endfor %}'),
        [ Root,
          [ For,
            [ ArrayNode ],
            [ NunjucksSymbol, 'x' ],
            [ NunjucksNodeList,
              [ Output,
                [ NunjucksSymbol, 'x' ] ] ],
            [ NunjucksNodeList,
              [ Output,
                [ TemplateData, 'empty' ] ] ] ] ]);
    });


    it('should parse filters', function(): void {
      isAST(parser.parseSource('{{ foo | bar }}'),
        [ Root,
          [ Output,
            [ Filter,
              [ NunjucksSymbol, 'bar' ],
              [ NunjucksNodeList,
                [ NunjucksSymbol, 'foo' ] ] ] ] ]);

      isAST(parser.parseSource('{{ foo | bar | baz }}'),
        [ Root,
          [ Output,
            [ Filter,
              [ NunjucksSymbol, 'baz' ],
              [ NunjucksNodeList,
                [ Filter,
                  [ NunjucksSymbol, 'bar' ],
                  [ NunjucksNodeList,
                    [ NunjucksSymbol, 'foo' ] ] ] ] ] ] ]);

      isAST(parser.parseSource('{{ foo | bar(3) }}'),
        [ Root,
          [ Output,
            [ Filter,
              [ NunjucksSymbol, 'bar' ],
              [ NunjucksNodeList,
                [ NunjucksSymbol, 'foo' ],
                [ Literal, 3 ] ] ] ] ]);
    });


    it('should parse macro definitions', function(): void {
      const ast = parser.parseSource('{% macro foo(bar, baz="foobar") %}' +
          'This is a macro' +
          '{% endmacro %}');
      isAST(ast,
        [ Root,
          [ Macro,
            [ NunjucksSymbol, 'foo' ],
            [ NunjucksNodeList,
              [ NunjucksSymbol, 'bar' ],
              [ KeywordArgs,
                [ Pair,
                  [ NunjucksSymbol, 'baz' ], [ Literal, 'foobar' ] ] ] ],
            [ NunjucksNodeList,
              [ Output,
                [ TemplateData, 'This is a macro' ] ] ] ] ]);
    });


    it('should parse call blocks', function(): void {
      const ast = parser.parseSource('{% call foo("bar") %}' +
          'This is the caller' +
          '{% endcall %}');
      isAST(ast,
        [ Root,
          [ Output,
            [ FunCall,
              [ NunjucksSymbol, 'foo' ],
              [ NunjucksNodeList,
                [ Literal, 'bar' ],
                [ KeywordArgs,
                  [ Pair,
                    [ NunjucksSymbol, 'caller' ],
                    [ Caller,
                      [ NunjucksSymbol, 'caller' ],
                      [ NunjucksNodeList ],
                      [ NunjucksNodeList,
                        [ Output,
                          [ TemplateData, 'This is the caller' ] ] ] ] ] ] ] ] ] ]);
    });


    it('should parse call blocks with args', function(): void {
      const ast = parser.parseSource('{% call(i) foo("bar", baz="foobar") %}' +
          'This is {{ i }}' +
          '{% endcall %}');
      isAST(ast,
        [ Root,
          [ Output,
            [ FunCall,
              [ NunjucksSymbol, 'foo' ],
              [ NunjucksNodeList,
                [ Literal, 'bar' ],
                [ KeywordArgs,
                  [ Pair,
                    [ NunjucksSymbol, 'baz' ], [ Literal, 'foobar' ] ],
                  [ Pair,
                    [ NunjucksSymbol, 'caller' ],
                    [ Caller,
                      [ NunjucksSymbol, 'caller' ],
                      [ NunjucksNodeList, [ NunjucksSymbol, 'i' ] ],
                      [ NunjucksNodeList,
                        [ Output,
                          [ TemplateData, 'This is ' ] ],
                        [ Output,
                          [ NunjucksSymbol, 'i' ] ] ] ] ] ] ] ] ] ]);
    });


    it('should parse raw', function(): void {
      isAST(parser.parseSource('{% raw %}hello {{ {% %} }}{% endraw %}'),
        [ Root,
          [ Output,
            [ TemplateData, 'hello {{ {% %} }}' ] ] ]);
    });


    it('should parse raw with broken variables', function(): void {
      isAST(parser.parseSource('{% raw %}{{ x }{% endraw %}'),
        [ Root,
          [ Output,
            [ TemplateData, '{{ x }' ] ] ]);
    });


    it('should parse raw with broken blocks', function(): void {
      isAST(parser.parseSource('{% raw %}{% if i_am_stupid }Still do your job well{% endraw %}'),
        [ Root,
          [ Output,
            [ TemplateData, '{% if i_am_stupid }Still do your job well' ] ] ]);
    });


    it('should parse raw with pure text', function(): void {
      isAST(parser.parseSource('{% raw %}abc{% endraw %}'),
        [ Root,
          [ Output,
            [ TemplateData, 'abc' ] ] ]);
    });



    it('should parse raw with raw blocks', function(): void {
      isAST(parser.parseSource('{% raw %}{% raw %}{{ x }{% endraw %}{% endraw %}'),
        [ Root,
          [ Output,
            [ TemplateData, '{% raw %}{{ x }{% endraw %}' ] ] ]);
    });


    it('should parse raw with comment blocks', function(): void {
      isAST(parser.parseSource('{% raw %}{# test {% endraw %}'),
        [ Root,
          [ Output,
            [ TemplateData, '{# test ' ] ] ]);
    });


    it('should parse multiple raw blocks', function(): void {
      isAST(parser.parseSource('{% raw %}{{ var }}{% endraw %}{{ var }}{% raw %}{{ var }}{% endraw %}'),
        [ Root,
          [ Output, [ TemplateData, '{{ var }}' ] ],
          [ Output, [ NunjucksSymbol, 'var' ] ],
          [ Output, [ TemplateData, '{{ var }}' ] ] ]);
    });


    it('should parse multiline multiple raw blocks', function(): void {
      isAST(parser.parseSource('\n{% raw %}{{ var }}{% endraw %}\n{{ var }}\n{% raw %}{{ var }}{% endraw %}\n'),
        [ Root,
          [ Output, [ TemplateData, '\n' ] ],
          [ Output, [ TemplateData, '{{ var }}' ] ],
          [ Output, [ TemplateData, '\n' ] ],
          [ Output, [ NunjucksSymbol, 'var' ] ],
          [ Output, [ TemplateData, '\n' ] ],
          [ Output, [ TemplateData, '{{ var }}' ] ],
          [ Output, [ TemplateData, '\n' ] ] ]);
    });


    it('should parse verbatim', function(): void {
      isAST(parser.parseSource('{% verbatim %}hello {{ {% %} }}{% endverbatim %}'),
        [ Root,
          [ Output,
            [ TemplateData, 'hello {{ {% %} }}' ] ] ]);
    });


    it('should parse verbatim with broken variables', function(): void {
      isAST(parser.parseSource('{% verbatim %}{{ x }{% endverbatim %}'),
        [ Root,
          [ Output,
            [ TemplateData, '{{ x }' ] ] ]);
    });


    it('should parse verbatim with broken blocks', function(): void {
      isAST(parser.parseSource('{% verbatim %}{% if i_am_stupid }Still do your job well{% endverbatim %}'),
        [ Root,
          [ Output,
            [ TemplateData, '{% if i_am_stupid }Still do your job well' ] ] ]);
    });


    it('should parse verbatim with pure text', function(): void {
      isAST(parser.parseSource('{% verbatim %}abc{% endverbatim %}'),
        [ Root,
          [ Output,
            [ TemplateData, 'abc' ] ] ]);
    });



    it('should parse verbatim with verbatim blocks', function(): void {
      isAST(parser.parseSource('{% verbatim %}{% verbatim %}{{ x }{% endverbatim %}{% endverbatim %}'),
        [ Root,
          [ Output,
            [ TemplateData, '{% verbatim %}{{ x }{% endverbatim %}' ] ] ]);
    });


    it('should parse verbatim with comment blocks', function(): void {
      isAST(parser.parseSource('{% verbatim %}{# test {% endverbatim %}'),
        [ Root,
          [ Output,
            [ TemplateData, '{# test ' ] ] ]);
    });


    it('should parse multiple verbatim blocks', function(): void {
      isAST(parser.parseSource('{% verbatim %}{{ var }}{% endverbatim %}{{ var }}{% verbatim %}{{ var }}{% endverbatim %}'),
        [ Root,
          [ Output, [ TemplateData, '{{ var }}' ] ],
          [ Output, [ NunjucksSymbol, 'var' ] ],
          [ Output, [ TemplateData, '{{ var }}' ] ] ]);
    });


    it('should parse multiline multiple verbatim blocks', function(): void {
      isAST(parser.parseSource('\n{% verbatim %}{{ var }}{% endverbatim %}\n{{ var }}\n{% verbatim %}{{ var }}{% endverbatim %}\n'),
        [ Root,
          [ Output, [ TemplateData, '\n' ] ],
          [ Output, [ TemplateData, '{{ var }}' ] ],
          [ Output, [ TemplateData, '\n' ] ],
          [ Output, [ NunjucksSymbol, 'var' ] ],
          [ Output, [ TemplateData, '\n' ] ],
          [ Output, [ TemplateData, '{{ var }}' ] ],
          [ Output, [ TemplateData, '\n' ] ] ]);
    });


    it('should parse switch statements', function(): void {
      const tpl: string = '{% switch foo %}{% case "bar" %}BAR{% case "baz" %}BAZ{% default %}NEITHER FOO NOR BAR{% endswitch %}';
      isAST(parser.parseSource(tpl),
        [ Root,
          [ Switch,
            [ NunjucksSymbol, 'foo' ],
            [
              [ Case,
                [ Literal, 'bar' ],
                [ NunjucksNodeList,
                  [ Output,
                    [ TemplateData, 'BAR' ] ] ] ],
              [ Case,
                [ Literal, 'baz' ],
                [ NunjucksNodeList,
                  [ Output,
                    [ TemplateData, 'BAZ' ] ] ] ] ],
            [ NunjucksNodeList,
              [ Output,
                [ TemplateData, 'NEITHER FOO NOR BAR' ] ] ] ] ]);
    });


    it('should parse keyword and non-keyword arguments', function(): void {
      isAST(parser.parseSource('{{ foo("bar", falalalala, baz="foobar") }}'),
        [ Root,
          [ Output,
            [ FunCall,
              [ NunjucksSymbol, 'foo' ],
              [ NunjucksNodeList,
                [ Literal, 'bar' ],
                [ NunjucksSymbol, 'falalalala' ],
                [ KeywordArgs,
                  [ Pair,
                    [ NunjucksSymbol, 'baz' ],
                    [ Literal, 'foobar' ] ] ] ] ] ] ]);
    });


    it('should parse imports', function(): void {
      isAST(parser.parseSource('{% import "foo/bar.njk" as baz %}'),
        [ Root,
          [ Import,
            [ Literal, 'foo/bar.njk' ],
            [ NunjucksSymbol, 'baz' ] ] ]);

      isAST(parser.parseSource('{% from "foo/bar.njk" import baz, foobar as foobarbaz %}'),
        [ Root,
          [ FromImport,
            [ Literal, 'foo/bar.njk' ],
            [ NunjucksNodeList,
              [ NunjucksSymbol, 'baz' ],
              [ Pair,
                [ NunjucksSymbol, 'foobar' ],
                [ NunjucksSymbol, 'foobarbaz' ] ] ] ] ]);

      isAST(parser.parseSource('{% import "foo/bar.html"|replace("html", "j2") as baz %}'),
        [ Root,
          [ Import,
            [ Filter,
              [ NunjucksSymbol, 'replace' ],
              [ NunjucksNodeList,
                [ Literal, 'foo/bar.html' ],
                [ Literal, 'html' ],
                [ Literal, 'j2' ]
              ]
            ],
            [ NunjucksSymbol, 'baz' ] ] ]);

      isAST(parser.parseSource('{% from ""|default("foo/bar.njk") import baz, foobar as foobarbaz %}'),
        [ Root,
          [ FromImport,
            [ Filter,
              [ NunjucksSymbol, 'default' ],
              [ NunjucksNodeList,
                [ Literal, '' ],
                [ Literal, 'foo/bar.njk' ]
              ]
            ],
            [ NunjucksNodeList,
              [ NunjucksSymbol, 'baz' ],
              [ Pair,
                [ NunjucksSymbol, 'foobar' ],
                [ NunjucksSymbol, 'foobarbaz' ] ] ] ] ]);
    });


    it('should parse whitespace control', function(): void {
      // Every start/end tag with "-" should trim the whitespace
      // before or after it

      isAST(parser.parseSource('{% if x %}\n  hi \n{% endif %}'),
        [ Root,
          [ If,
            [ NunjucksSymbol, 'x' ],
            [ NunjucksNodeList,
              [ Output,
                [ TemplateData, '\n  hi \n' ] ] ] ] ]);

      isAST(parser.parseSource('{% if x -%}\n  hi \n{% endif %}'),
        [ Root,
          [ If,
            [ NunjucksSymbol, 'x' ],
            [ NunjucksNodeList,
              [ Output,
                [ TemplateData, 'hi \n' ] ] ] ] ]);

      isAST(parser.parseSource('{% if x %}\n  hi \n{%- endif %}'),
        [ Root,
          [ If,
            [ NunjucksSymbol, 'x' ],
            [ NunjucksNodeList,
              [ Output,
                [ TemplateData, '\n  hi' ] ] ] ] ]);

      isAST(parser.parseSource('{% if x -%}\n  hi \n{%- endif %}'),
        [ Root,
          [ If,
            [ NunjucksSymbol, 'x' ],
            [ NunjucksNodeList,
              [ Output,
                [ TemplateData, 'hi' ] ] ] ] ]);

      isAST(parser.parseSource('poop  \n{%- if x -%}\n  hi \n{%- endif %}'),
        [ Root,
          [ Output,
            [ TemplateData, 'poop' ] ],
          [ If,
            [ NunjucksSymbol, 'x' ],
            [ NunjucksNodeList,
              [ Output,
                [ TemplateData, 'hi' ] ] ] ] ]);

      isAST(parser.parseSource('hello \n{#- comment #}'),
        [ Root,
          [ Output,
            [ TemplateData, 'hello' ] ] ]);

      isAST(parser.parseSource('{# comment -#} \n world'),
        [ Root,
          [ Output,
            [ TemplateData, 'world' ] ] ]);

      isAST(parser.parseSource('hello \n{#- comment -#} \n world'),
        [ Root,
          [ Output,
            [ TemplateData, 'hello' ] ],
          [ Output,
            [ TemplateData, 'world' ] ] ]);

      isAST(parser.parseSource('hello \n{# - comment - #} \n world'),
        [ Root,
          [ Output,
            [ TemplateData, 'hello \n' ] ],
          [ Output,
            [ TemplateData, ' \n world' ] ] ]);

      // The from statement required a special case so make sure to
      // test it
      isAST(parser.parseSource('{% from x import y %}\n  hi \n'),
        [ Root,
          [ FromImport,
            [ NunjucksSymbol, 'x' ],
            [ NunjucksNodeList,
              [ NunjucksSymbol, 'y' ] ] ],
          [ Output,
            [ TemplateData, '\n  hi \n' ] ] ]);

      isAST(parser.parseSource('{% from x import y -%}\n  hi \n'),
        [ Root,
          [ FromImport,
            [ NunjucksSymbol, 'x' ],
            [ NunjucksNodeList,
              [ NunjucksSymbol, 'y' ] ] ],
          [ Output,
            [ TemplateData, 'hi \n' ] ] ]);

      isAST(parser.parseSource('{% if x -%}{{y}} {{z}}{% endif %}'),
        [ Root,
          [ If,
            [ NunjucksSymbol, 'x' ],
            [ NunjucksNodeList,
              [ Output,
                [ NunjucksSymbol, 'y' ] ],
              [ Output,
                // the value of TemplateData should be ' ' instead of ''
                [ TemplateData, ' ' ] ],
              [ Output,
                [ NunjucksSymbol, 'z' ] ] ] ] ]);

      isAST(parser.parseSource('{% if x -%}{% if y %} {{z}}{% endif %}{% endif %}'),
        [ Root,
          [ If,
            [ NunjucksSymbol, 'x' ],
            [ NunjucksNodeList,
              [ If,
                [ NunjucksSymbol, 'y' ],
                [ NunjucksNodeList,
                  [ Output,
                    // the value of TemplateData should be ' ' instead of ''
                    [ TemplateData, ' ' ] ],
                  [ Output,
                    [ NunjucksSymbol, 'z' ] ]
                ] ] ] ] ]);

      isAST(parser.parseSource('{% if x -%}{# comment #} {{z}}{% endif %}'),
        [ Root,
          [ If,
            [ NunjucksSymbol, 'x' ],
            [ NunjucksNodeList,
              [ Output,
                // the value of TemplateData should be ' ' instead of ''
                [ TemplateData, ' ' ] ],
              [ Output,
                [ NunjucksSymbol, 'z' ] ] ] ] ]);
    });


    it('should throw errors', function(): void {
      expect(function(): void {
        parser.parseSource('hello {{ foo');
      }).to.throwException(/expected variable end/);

      expect(function(): void {
        parser.parseSource('hello {% if');
      }).to.throwException(/expected expression/);

      expect(function(): void {
        parser.parseSource('hello {% if sdf zxc');
      }).to.throwException(/expected block end/);

      expect(function(): void {
        parser.parseSource('{% include "foo %}');
      }).to.throwException(/expected block end/);

      expect(function(): void {
        parser.parseSource('hello {% if sdf %} data');
      }).to.throwException(/expected elif, else, or endif/);

      expect(function(): void {
        parser.parseSource('hello {% block sdf %} data');
      }).to.throwException(/expected endblock/);

      expect(function(): void {
        parser.parseSource('hello {% block sdf %} data{% endblock foo %}');
      }).to.throwException(/expected block end/);

      expect(function(): void {
        parser.parseSource('hello {% bar %} dsfsdf');
      }).to.throwException(/unknown block tag/);

      expect(function(): void {
        parser.parseSource('{{ foo(bar baz) }}');
      }).to.throwException(/expected comma after expression/);

      expect(function(): void {
        parser.parseSource('{% import "foo" %}');
      }).to.throwException(/expected "as" keyword/);

      expect(function(): void {
        parser.parseSource('{% from "foo" %}');
      }).to.throwException(/expected import/);

      expect(function(): void {
        parser.parseSource('{% from "foo" import bar baz %}');
      }).to.throwException(/expected comma/);

      expect(function(): void {
        parser.parseSource('{% from "foo" import _bar %}');
      }).to.throwException(/names starting with an underscore cannot be imported/);
    });


    it('should parse custom tags', function(): void {
      function TestTagExtension(): void {
        /* eslint-disable no-shadow */
        this.tags = [ 'testtag' ];

        /* normally this is automatically done by Environment */
        this._name = 'testtagExtension';

        this.parse = function(parser, nodes) {
          parser.parserTokenStream.peekToken();
          parser.advanceAfterBlockEnd();
          return new CallExtension(this, 'foo');
        };
      }

      function TestBlockTagExtension(): void {
        /* eslint-disable no-shadow */
        this.tags = [ 'testblocktag' ];
        this._name = 'testblocktagExtension';

        this.parse = function(parser, nodes) {
          parser.parserTokenStream.peekToken();
          parser.advanceAfterBlockEnd();

          const content: NunjucksNodeList = parser.parseUntilBlocks('endtestblocktag');
          const tag = new CallExtension(this, 'bar', null, [ 1, content ]);
          parser.advanceAfterBlockEnd();

          return tag;
        };
      }

      function TestArgsExtension(): void {
        /* eslint-disable no-shadow */
        this.tags = [ 'testargs' ];
        this._name = 'testargsExtension';

        this.parse = function(parser, nodes) {
          const begun = parser.parserTokenStream.peekToken();
          let args = null;

          // Skip the name
          parser.parserTokenStream.nextToken();

          args = parser.parseSignature(true);
          parser.advanceAfterBlockEnd(begun.value);

          return new CallExtension(this, 'biz', args);
        };
      }

      const extensions: IExtension[] = [ new TestTagExtension(),
        new TestBlockTagExtension(),
        new TestArgsExtension() ];

      isAST(parser.parseSource('{% testtag %}', extensions),
        [ Root,
          [ CallExtension, extensions[0], 'foo', undefined, undefined ] ]);

      isAST(parser.parseSource('{% testblocktag %}sdfd{% endtestblocktag %}', extensions),
        [ Root,
          [ CallExtension, extensions[1], 'bar', null,
            [ 1, [ NunjucksNodeList,
              [ Output,
                [ TemplateData, 'sdfd' ] ] ] ] ] ]);

      isAST(parser.parseSource('{% testblocktag %}{{ 123 }}{% endtestblocktag %}', extensions),
        [ Root,
          [ CallExtension, extensions[1], 'bar', null,
            [ 1, [ NunjucksNodeList,
              [ Output,
                [ Literal, 123 ] ] ] ] ] ]);

      isAST(parser.parseSource('{% testargs(123, "abc", foo="bar") %}', extensions),
        [ Root,
          [ CallExtension, extensions[2], 'biz',

            // The only arg is the list of run-time arguments
            // coming from the template
            [ NunjucksNodeList,
              [ Literal, 123 ],
              [ Literal, 'abc' ],
              [ KeywordArgs,
                [ Pair,
                  [ NunjucksSymbol, 'foo' ],
                  [ Literal, 'bar' ] ] ] ] ] ]);

      isAST(parser.parseSource('{% testargs %}', extensions),
        [ Root,
          [ CallExtension, extensions[2], 'biz', null ] ]);
    });
  });
}());
