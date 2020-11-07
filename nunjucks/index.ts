'use strict';

export { Environment, Template } from './src/environment';
import { Environment, Template } from './src/environment';
import { isObject } from './src/lib';
import { FileSystemLoader } from './src/file-system-loader';
export { FileSystemLoader } from './src/file-system-loader';
import { WebLoader, PrecompiledLoader } from './src/web-loaders';
export { WebLoader, PrecompiledLoader } from './src/web-loaders';
export { NodeResolveLoader } from './src/node-resolve-loader';
export { precompile, precompileString } from './src/precompile';
export { installCompat as installJinjaCompat } from './src/jinja-compat';

let e: Environment;


export function configure(templatesPath?, opts?): Environment {
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


export function reset(): void {
  e = undefined;
}


export function compile(src, env, path, eagerCompile): Template {
  if (!e) {
    configure();
  }

  return new Template(src, env, path, eagerCompile);
}


export function render(name, ctx, cb) {
  if (!e) {
    configure();
  }

  return e.render(name, ctx, cb);
}


export function renderString(src, ctx, cb) {
  if (!e) {
    configure();
  }

  return e.renderString(src, ctx, {}, cb);
}

