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
exports.mochaPhantomJS = void 0;
const path = __importStar(require("path"));
const utils_1 = require("./utils");
const child_process_1 = require("child_process");
function mochaPhantomJS(url, options) {
    options = options || {};
    const coverageFile = path.join(__dirname, '../../.nyc_output', (url.indexOf('slim') > -1) ? 'browser-slim.json' : 'browser-std.json');
    return new Promise((resolve, reject) => {
        try {
            const scriptPath = require.resolve('mocha-phantomjs-core/mocha-phantomjs-core.js');
            if (!scriptPath) {
                throw new Error('mocha-phantomjs-core.js not found');
            }
            const args = [
                scriptPath,
                url,
                options.reporter || 'dot',
                JSON.stringify(Object.assign({
                    useColors: true,
                    hooks: 'mocha-phantomjs-istanbul',
                    coverageFile: coverageFile,
                }, options.phantomjs || {})),
            ];
            const phantomjsPath = utils_1.Utils.lookup('.bin/phantomjs', true) || utils_1.Utils.lookup('phantomjs-prebuilt/bin/phantomjs', true);
            if (!phantomjsPath) {
                throw new Error('PhantomJS not found');
            }
            const proc = child_process_1.spawn(phantomjsPath, args, { cwd: path.join(__dirname, '../..') });
            proc.stdout.pipe(process.stdout);
            proc.stderr.pipe(process.stderr);
            proc.on('error', reject);
            proc.on('exit', (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(`test failed. phantomjs exit code: ${code}`));
                }
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
exports.mochaPhantomJS = mochaPhantomJS;
//# sourceMappingURL=mocha-phantomjs.js.map