'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var web_loaders_1 = require("./src/loaders/web-loaders");

var node_resolve_loader_1 = require("./src/loaders/node-resolve-loader");

var FileSystemLoader_1 = require("./src/loaders/FileSystemLoader");

var loader_1 = require("./src/loaders/loader");

var compiler_1 = require("./src/compiler/compiler");

var precompile_1 = require("./src/compiler/precompile/precompile");

var parser_1 = require("./src/compiler/parser/parser");

var lib_1 = require("./src/lib");

var jinja_compat_1 = require("./src/jinja-compat");

var context_1 = require("./src/environment/context");

var _require = require('./src/environment/environment'),
    Environment = _require.Environment,
    Template = _require.Template; // A single instance of an environment, since this is so commonly used


var e;

function configure(templatesPath, opts) {
  opts = opts || {};

  if (lib_1.isObject(templatesPath)) {
    opts = templatesPath;
    templatesPath = null;
  }

  var TemplateLoader;

  if (FileSystemLoader_1.FileSystemLoader) {
    TemplateLoader = new FileSystemLoader_1.FileSystemLoader(templatesPath, {
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
  Context: context_1.Context,
  Environment: Environment,
  Template: Template,
  Loader: loader_1.Loader,
  FileSystemLoader: FileSystemLoader_1.FileSystemLoader,
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