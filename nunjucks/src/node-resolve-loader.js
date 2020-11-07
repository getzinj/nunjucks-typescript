"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeResolveLoader = void 0;
const loader_1 = require("./loader");
const globals_1 = require("./globals");
const fs = __importStar(require("fs"));
class NodeResolveLoader extends loader_1.Loader {
    constructor(opts) {
        super();
        opts = opts || {};
        this.pathsToNames = {};
        this.noCache = !!opts.noCache;
        if (opts.watch) {
            try {
                globals_1.globalchokidar.chokidar = require('chokidar'); // eslint-disable-line global-require
            }
            catch (e) {
                throw new Error('watch requires chokidar to be installed');
            }
            this.watcher = globals_1.globalchokidar.chokidar.watch();
            this.watcher.on('change', (fullname) => {
                this.emit('update', this.pathsToNames[fullname], fullname);
            });
            this.watcher.on('error', (error) => {
                console.log('Watcher error: ' + error);
            });
            this.on('load', (name, source) => {
                this.watcher.add(source.path);
            });
        }
    }
    getSource(name) {
        // Don't allow file-system traversal
        if ((/^\.?\.?(\/|\\)/).test(name)) {
            return null;
        }
        if ((/^[A-Z]:/).test(name)) {
            return null;
        }
        let fullpath;
        try {
            fullpath = require.resolve(name);
        }
        catch (e) {
            return null;
        }
        this.pathsToNames[fullpath] = name;
        const source = {
            src: fs.readFileSync(fullpath, 'utf-8'),
            path: fullpath,
            noCache: this.noCache,
        };
        this.emit('load', name, source);
        return source;
    }
}
exports.NodeResolveLoader = NodeResolveLoader;
//# sourceMappingURL=node-resolve-loader.js.map