'use strict';

import { WebLoader, PrecompiledLoader } from './src/loaders/web-loaders';
import { NodeResolveLoader } from './src/loaders/node-resolve-loader';
import { FileSystemLoader } from './src/loaders/FileSystemLoader';
import { Loader } from './src/loaders/loader';
import { Compiler } from './src/compiler/compiler';
import { precompile, precompileString } from './src/compiler/precompile/precompile';
import { Parser } from './src/compiler/parser/parser';
import { isObject } from './src/lib';
import { installCompat } from './src/jinja-compat';
import { Context } from './src/environment/context';
import { Tokenizer } from './src/compiler/lexer/tokenizer';
import { ParserTokenStream } from './src/compiler/parser/parserTokenStream';
import * as runtime from './src/runtime/runtime';
import * as lib from './src/lib';
import * as nodes from './src/nodes/nodes';
import { Environment } from './src/environment/environment';
import { Template } from './src/environment/template';
import { IEnvironmentOptions } from './src/interfaces/IEnvironmentOptions';

// A single instance of an environment, since this is so commonly used
let e;


function isEnvironmentsOptions(v): v is IEnvironmentOptions {
  return isObject(v);
}


function configure();
function configure(templatesPath: IEnvironmentOptions, opts: undefined);
function configure(templatesPath: string, opts: IEnvironmentOptions);
function configure(templatesPath?: string | IEnvironmentOptions, opts?: IEnvironmentOptions) {
  opts = opts ?? { };
  if (isEnvironmentsOptions(templatesPath)) {
    opts = templatesPath;
    templatesPath = null;
  }

  let TemplateLoader;
  if (FileSystemLoader) {
    TemplateLoader = new FileSystemLoader(templatesPath as string, {
      watch: opts.watch,
      noCache: opts.noCache
    });
  } else if (WebLoader) {
    TemplateLoader = new WebLoader(templatesPath as string, {
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
  Compiler: Compiler,
  parser: Parser,
  Parser: Parser,
  lexer: Tokenizer,
  Tokenizer: Tokenizer,
  ParserTokenStream: ParserTokenStream,
  runtime: runtime,
  lib: lib,
  nodes: nodes,
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

  Context: Context,
};
