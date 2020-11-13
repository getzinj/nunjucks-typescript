'use strict';

import { WebLoader, PrecompiledLoader } from './src/web-loaders';
import { NodeResolveLoader } from './src/node-resolve-loader';
import { FileSystemLoader } from './src/file-system-loader';
import { Loader } from './src/loader';
import { Compiler } from './src/compiler/compiler';
import { precompile, precompileString } from './src/precompile';
import { Parser } from './src/parser/parser';
import { isObject } from './src/lib';
import { installCompat } from './src/jinja-compat';

// const lib = require('./src/lib');
const {Environment, Template} = require('./src/environment/environment');
//const loaders = require('./src/loaders');
//const precompile = require('./src/precompile');
//const compiler = require('./src/compiler');
//const parser = require('./src/parser');
//const lexer = require('./src/lexer');
// const runtime = require('./src/runtime');
// const nodes = require('./src/nodes');
// const installJinjaCompat = require('./src/jinja-compat');

// A single instance of an environment, since this is so commonly used
let e;


function configure(templatesPath?, opts?: INunjucksOptions) {
  opts = opts || {};
  if (isObject(templatesPath)) {
    opts = templatesPath;
    templatesPath = null;
  }

  let TemplateLoader;
  if (FileSystemLoader) {
    TemplateLoader = new FileSystemLoader(templatesPath, {
      watch: opts.watch,
      noCache: opts.noCache
    });
  } else if (WebLoader) {
    TemplateLoader = new WebLoader(templatesPath, {
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
  Loader: Loader,
  FileSystemLoader: FileSystemLoader,
  NodeResolveLoader: NodeResolveLoader,
  PrecompiledLoader: PrecompiledLoader,
  WebLoader: WebLoader,
  compiler: Compiler,
  parser: Parser,
  installJinjaCompat: installCompat,
  configure: configure,
  reset() {
    e = undefined;
  },
  compile(src, env, path, eagerCompile) {
    if (!e) {
      configure();
    }
    return new Template(src, env, path, eagerCompile);
  },

  render(name, ctx, cb) {
    if (!e) {
      configure();
    }

    return e.render(name, ctx, cb);
  },
  renderString(src, ctx, cb) {
    if (!e) {
      configure();
    }

    return e.renderString(src, ctx, cb);
  },
  precompile: precompile ?? undefined,
  precompileString: precompileString ?? undefined,
};



export interface INunjucksOptions {
  watch?: boolean;
  noCache?: boolean;
  web?;
  express?;
}
