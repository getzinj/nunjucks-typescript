'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderString = exports.render = exports.compile = exports.reset = exports.configure = exports.precompileString = exports.precompile = exports.NodeResolveLoader = exports.PrecompiledLoader = exports.WebLoader = exports.FileSystemLoader = void 0;

var environment_1 = require("./src/environment");

var lib_1 = require("./src/lib");

var file_system_loader_1 = require("./src/file-system-loader");

var file_system_loader_2 = require("./src/file-system-loader");

Object.defineProperty(exports, "FileSystemLoader", {
  enumerable: true,
  get: function get() {
    return file_system_loader_2.FileSystemLoader;
  }
});

var web_loaders_1 = require("./src/web-loaders");

var web_loaders_2 = require("./src/web-loaders");

Object.defineProperty(exports, "WebLoader", {
  enumerable: true,
  get: function get() {
    return web_loaders_2.WebLoader;
  }
});
Object.defineProperty(exports, "PrecompiledLoader", {
  enumerable: true,
  get: function get() {
    return web_loaders_2.PrecompiledLoader;
  }
});

var node_resolve_loader_1 = require("./src/node-resolve-loader");

Object.defineProperty(exports, "NodeResolveLoader", {
  enumerable: true,
  get: function get() {
    return node_resolve_loader_1.NodeResolveLoader;
  }
});

var precompile_1 = require("./src/precompile");

Object.defineProperty(exports, "precompile", {
  enumerable: true,
  get: function get() {
    return precompile_1.precompile;
  }
});
Object.defineProperty(exports, "precompileString", {
  enumerable: true,
  get: function get() {
    return precompile_1.precompileString;
  }
});
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

  e = new environment_1.Environment(TemplateLoader, opts);

  if (opts && opts.express) {
    e.express(opts.express);
  }

  return e;
}

exports.configure = configure;

function reset() {
  e = undefined;
}

exports.reset = reset;

function compile(src, env, path, eagerCompile) {
  if (!e) {
    configure();
  }

  return new environment_1.Template(src, env, path, eagerCompile);
}

exports.compile = compile;

function render(name, ctx, cb) {
  if (!e) {
    configure();
  }

  return e.render(name, ctx, cb);
}

exports.render = render;

function renderString(src, ctx, cb) {
  if (!e) {
    configure();
  }

  return e.renderString(src, ctx, {}, cb);
}

exports.renderString = renderString;