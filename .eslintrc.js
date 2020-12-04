module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [ '@typescript-eslint' ],
  extends: [
    'airbnb-base/legacy',
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2017,
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    'array-bracket-spacing': [ 'error', 'always' ],
    'dot-notation': [ 'off' ],
    // The one assertion of personal preference: no spaces before parentheses
    // of anonymous functions
    'space-before-function-paren': [ 'error', {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always',
    } ],

    'space-in-parens': [ 'off' ],
    indent: [ 'off' ],
    'linebreak-style': [ 'off' ],
    // Temporarily disabled rules
    //
    // no-use-before-define is a good rule, but it would make the diff for
    // linting the code even more inscrutible than it already is.
    'no-use-before-define': 'off',
    // Relax some rules
    'no-cond-assign': [ 'error', 'except-parens' ],
    'no-unused-vars': [ 'error', { args: 'none', } ],
    'no-lone-blocks': 'off',
    'no-multiple-empty-lines': 'off',
    // Disable some overly-strict airbnb style rules
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'class-methods-use-this': 'off',
    'function-paren-newline': 'off',
    'no-plusplus': 'off',
    'object-curly-newline': [ 'off', {
      ObjectExpression: {
        multiline: true,
        minProperties: 3
      },
      ObjectPattern: {
        multiline: true,
        minProperties: 3
      },
      ImportDeclaration: 'never',
      ExportDeclaration: {
        multiline: true,
        minProperties: 3
      }
    } ],
    'object-curly-spacing': [ 'error', 'always' ],
    'max-len': [ 'warn', {
      code: 120,
      comments: 180,
      tabWidth: 4
    } ],
    'no-shadow': 'off',
    'no-multi-assign': 'error',
    'no-empty-function': [ 'warn', { allow: [ 'constructors' ] } ],
    'no-else-return': 'off',
    'no-redeclare': [ 'warn' ],
    // While technically useless from the point of view of the regex parser,
    // escaping characters inside character classes is more consistent. I
    // would say that they make the regular expression more readable, if the
    // idea of readable regular expressions wasn't absurd on its face.
    'no-useless-escape': 'off',
    // I'm inclined to reverse this rule to be ['error', 'always'], but not just yet
    // IE 8 is a thing of the past and trailing commas are useful.
    'comma-dangle': 'off',
  },
  globals: { nunjucks: false, },
};
