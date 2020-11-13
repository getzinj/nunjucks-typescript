'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var web_loaders_1 = require("./src/web-loaders");

var node_resolve_loader_1 = require("./src/node-resolve-loader");

var file_system_loader_1 = require("./src/file-system-loader");

var loader_1 = require("./src/loader");

var compiler_1 = require("./src/compiler/compiler");

var precompile_1 = require("./src/precompile");

var parser_1 = require("./src/parser/parser");

var lib_1 = require("./src/lib");

var jinja_compat_1 = require("./src/jinja-compat"); // const lib = require('./src/lib');


var _require = require('./src/environment/environment'),
    Environment = _require.Environment,
    Template = _require.Template; //const loaders = require('./src/loaders');
//const precompile = require('./src/precompile');
//const compiler = require('./src/compiler');
//const parser = require('./src/parser');
//const lexer = require('./src/lexer');
// const runtime = require('./src/runtime');
// const nodes = require('./src/nodes');
// const installJinjaCompat = require('./src/jinja-compat');
// A single instance of an environment, since this is so commonly used


var e;

function configure(templatesPath, opts) {
  opts = opts || {};

  if (lib_1.isObject(templatesPath)) {
    opts = templatesPath;
    templatesPath = null;
  }

  var TemplateLoader;

  if (file_system_loader_1.FileSystemLoader) {
    TemplateLoader = new file_system_loader_1.FileSystemLoader(templatesPath, {
      watch: opts.watch,
      noCache: opts.noCache
    });
  } else if (web_loaders_1.WebLoader) {
    TemplateLoader = new web_loaders_1.WebLoader(templatesPath, {
      useCache: opts.web && opts.web.useCache,
      async: opts.web && opts.web.async
    });
  }

  e = new Environment(TemplateLoader, opts);

  if (opts && opts.express) {
    e.express(opts.express);
  }

  return e;
}

module.exports = {
  Environment: Environment,
  Template: Template,
  Loader: loader_1.Loader,
  FileSystemLoader: file_system_loader_1.FileSystemLoader,
  NodeResolveLoader: node_resolve_loader_1.NodeResolveLoader,
  PrecompiledLoader: web_loaders_1.PrecompiledLoader,
  WebLoader: web_loaders_1.WebLoader,
  compiler: compiler_1.Compiler,
  parser: parser_1.Parser,
  installJinjaCompat: jinja_compat_1.installCompat,
  configure: configure,
  reset: function reset() {
    e = undefined;
  },
  compile: function compile(src, env, path, eagerCompile) {
    if (!e) {
      configure();
    }

    return new Template(src, env, path, eagerCompile);
  },
  render: function render(name, ctx, cb) {
    if (!e) {
      configure();
    }

    return e.render(name, ctx, cb);
  },
  renderString: function renderString(src, ctx, cb) {
    if (!e) {
      configure();
    }

    return e.renderString(src, ctx, cb);
  },
  precompile: precompile_1.precompile !== null && precompile_1.precompile !== void 0 ? precompile_1.precompile : undefined,
  precompileString: precompile_1.precompileString !== null && precompile_1.precompileString !== void 0 ? precompile_1.precompileString : undefined
};