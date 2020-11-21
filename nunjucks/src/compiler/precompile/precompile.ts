'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { _prettifyError } from '../../lib';

import { Environment } from '../../environment/environment';
import { precompileGlobal } from './precompile-global';
import { Compiler } from '../compiler';
import { IPrecompiled } from './IPrecompiled';
import { IExtension } from '../parser/IExtension';
import { IPrecompileOptions } from './IPrecompileOptions';


function match(filename: string, patterns: (string | RegExp)[]) {
  if (!Array.isArray(patterns)) {
    return false;
  }
  return patterns.some((pattern: string | RegExp): RegExpMatchArray => filename.match(pattern));
}


export function precompileString(str: string, opts: { isString?: boolean; env?: Environment; wrapper?: any; name?: any; }) {
  opts = opts || {};
  opts.isString = true;
  const env = opts.env || new Environment([]);
  const wrapper = opts.wrapper || precompileGlobal;

  if (!opts.name) {
    throw new Error('the "name" option is required when compiling a string');
  }
  return wrapper([_precompile(str, opts.name, env)], opts);
}


export function precompile(input, opts?: IPrecompileOptions) {
  // The following options are available:
  //
  // * name: name of the template (auto-generated when compiling a directory)
  // * isString: input is a string, not a file path
  // * asFunction: generate a callable function
  // * force: keep compiling on error
  // * env: the Environment to use (gets extensions and async filters from it)
  // * include: which file/folders to include (folders are auto-included, files are auto-excluded)
  // * exclude: which file/folders to exclude (folders are auto-included, files are auto-excluded)
  // * wrapper: function(templates, opts) {...}
  //       Customize the output format to store the compiled template.
  //       By default, templates are stored in a global variable used by the runtime.
  //       A custom loader will be necessary to load your custom wrapper.

  opts = opts || {};
  const env: Environment = opts.env || new Environment([]);
  const wrapper: (templates, opts) => string = opts.wrapper || precompileGlobal;

  if (opts.isString) {
    return precompileString(input, opts);
  }

  const pathStats = fs.existsSync(input) && fs.statSync(input);
  const precompiled: IPrecompiled[] = [];
  const templates: string[] = [];

  function addTemplates(dir): void {
    fs.readdirSync(dir).forEach((file: string): void => {
      const filepath: string = path.join(dir, file);
      let subpath: string = filepath.substr(path.join(input, '/').length);
      const stat = fs.statSync(filepath);

      if (stat && stat.isDirectory()) {
        subpath += '/';
        if (!match(subpath, opts.exclude)) {
          addTemplates(filepath);
        }
      } else if (match(subpath, opts.include)) {
        templates.push(filepath);
      }
    });
  }

  if (pathStats.isFile()) {
    precompiled.push(_precompile(
      fs.readFileSync(input, 'utf-8'),
      opts.name || input,
      env
    ));
  } else if (pathStats.isDirectory()) {
    addTemplates(input);

    for (let i: number = 0; i < templates.length; i++) {
      const name: string = templates[i].replace(path.join(input, '/'), '');

      try {
        precompiled.push(_precompile(
          fs.readFileSync(templates[i], 'utf-8'),
          name,
          env
        ));
      } catch (e) {
        if (opts.force) {
          // Don't stop generating the output if we're
          // forcing compilation.
          console.error(e); // eslint-disable-line no-console
        } else {
          throw e;
        }
      }
    }
  }

  return wrapper(precompiled, opts);
}


function _precompile(str: string, name: string, env: Environment): IPrecompiled {
  env = env || new Environment([]);

  const asyncFilters: string[] = env.asyncFilters;
  const extensions: IExtension[] = env.extensionsList;
  let template: string;

  name = name.replace(/\\/g, '/');

  try {
    template = new Compiler(name, env.opts.throwOnUndefined).compile(str, asyncFilters, extensions, name, env.opts);
  } catch (err) {
    throw _prettifyError(name, false, err);
  }

  return {
    name: name,
    template: template
  };
}
