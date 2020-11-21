'use strict';


import { ITemplate } from './ITemplate';
import { IPrecompileGlobalOptions } from './IPrecompileGlobalOptions';
import { Template } from '../../environment/template';


export function precompileGlobal(templates: ITemplate[], opts?: IPrecompileGlobalOptions): string {
  let out: string = '';
  opts = opts || {};

  for (let i: number = 0; i < templates.length; i++) {
    const name: string = JSON.stringify(templates[i].name);
    const template: Template = templates[i].template;

    out += '(function() {' +
      '(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})' +
      '[' + name + '] = (function() {\n' + template + '\n})();\n';

    if (opts.asFunction) {
      out += 'return function(ctx, cb) { return nunjucks.render(' + name + ', ctx, cb); }\n';
    }

    out += '})();\n';
  }
  return out;
}
