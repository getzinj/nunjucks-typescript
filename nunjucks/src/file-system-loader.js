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
exports.FileSystemLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const globals_1 = require("./globals");
const loader_1 = require("./loader");
class FileSystemLoader extends loader_1.Loader {
    constructor(searchPaths, opts) {
        super();
        if (typeof opts === 'boolean') {
            console.log('[nunjucks] Warning: you passed a boolean as the second ' +
                'argument to FileSystemLoader, but it now takes an options ' +
                'object. See http://mozilla.github.io/nunjucks/api.html#filesystemloader');
        }
        opts = opts || {};
        this.pathsToNames = {};
        this.noCache = !!opts.noCache;
        if (searchPaths) {
            searchPaths = Array.isArray(searchPaths) ? searchPaths : [searchPaths];
            // For windows, convert to forward slashes
            this.searchPaths = searchPaths.map(path.normalize);
        }
        else {
            this.searchPaths = ['.'];
        }
        if (opts.watch) {
            // Watch all the templates in the paths and fire an event when
            // they change
            try {
                globals_1.globalchokidar.chokidar = require('chokidar'); // eslint-disable-line global-require
            }
            catch (e) {
                throw new Error('watch requires chokidar to be installed');
            }
            const paths = this.searchPaths.filter(fs.existsSync);
            const watcher = globals_1.globalchokidar.chokidar.watch(paths);
            watcher.on('all', (event, fullname) => {
                fullname = path.resolve(fullname);
                if (event === 'change' && fullname in this.pathsToNames) {
                    this.emit('update', this.pathsToNames[fullname], fullname);
                }
            });
            watcher.on('error', (error) => {
                console.log('Watcher error: ' + error);
            });
        }
    }
    getSource(name) {
        var fullpath = null;
        var paths = this.searchPaths;
        for (let i = 0; i < paths.length; i++) {
            const basePath = path.resolve(paths[i]);
            const p = path.resolve(paths[i], name);
            // Only allow the current directory and anything
            // underneath it to be searched
            if (p.indexOf(basePath) === 0 && fs.existsSync(p)) {
                fullpath = p;
                break;
            }
        }
        if (!fullpath) {
            return null;
        }
        this.pathsToNames[fullpath] = name;
        const source = {
            src: fs.readFileSync(fullpath, 'utf-8'),
            path: fullpath,
            noCache: this.noCache
        };
        this.emit('load', name, source);
        return source;
    }
}
exports.FileSystemLoader = FileSystemLoader;
//# sourceMappingURL=file-system-loader.js.map