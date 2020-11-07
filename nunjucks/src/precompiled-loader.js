'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrecompiledLoader = void 0;
const loader_1 = require("./loader");
class PrecompiledLoader extends loader_1.Loader {
    constructor(compiledTemplates) {
        super();
        this.precompiled = compiledTemplates || {};
    }
    getSource(name) {
        if (this.precompiled[name]) {
            return {
                src: {
                    type: 'code',
                    obj: this.precompiled[name]
                },
                path: name
            };
        }
        return null;
    }
}
exports.PrecompiledLoader = PrecompiledLoader;
//# sourceMappingURL=precompiled-loader.js.map