'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompileGlobal = void 0;
function precompileGlobal(templates, opts) {
    let out = '';
    opts = opts || {};
    for (let i = 0; i < templates.length; i++) {
        const name = JSON.stringify(templates[i].name);
        const template = templates[i].template;
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
exports.precompileGlobal = precompileGlobal;
//# sourceMappingURL=precompile-global.js.map