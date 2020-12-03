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
exports.runtests = exports.fixPath = void 0;
const path = __importStar(require("path"));
const platform = __importStar(require("platform"));
/* eslint-disable */
const child_process_1 = require("child_process");
const utils_1 = require("./utils");
const static_server_1 = require("./static-server");
const mocha_phantomjs_1 = require("./mocha-phantomjs");
function fixPath(path, basePath = '') {
    return path;
    // // noinspection PointlessBooleanExpressionJS
    // const isWindows: boolean = !!(platform?.os?.family?.toLowerCase?.() === 'win32');
    //
    // const pathWithoutQuotes: string = (basePath
    //     ? (basePath + '\\' + path)
    //     : path).replace(/\//g, '\\');
    //
    // return isWindows? `"${ pathWithoutQuotes }"` : pathWithoutQuotes;
}
exports.fixPath = fixPath;
function getMochaRunExecutor(bin, cmd_args) {
    return (resolve, reject) => {
        var _a, _b;
        try {
            const cmd_opts = {
                cwd: path.join(__dirname, '../..'),
                env: process.env,
                windowsVerbatimArguments: (((_b = (_a = platform === null || platform === void 0 ? void 0 : platform.os) === null || _a === void 0 ? void 0 : _a.family) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === 'win32')
            };
            const proc = child_process_1.spawn(bin, cmd_args, cmd_opts);
            proc.stdout.pipe(process.stdout);
            proc.stderr.pipe(process.stderr);
            proc.on('message', (msg) => {
                console.error(`${bin} ${cmd_args.join(' ')}: ${msg}`);
            });
            proc.on('error', (err) => {
                console.error(`${bin} ${cmd_args.join(' ')}: ${err}`);
                reject(err);
            });
            proc.on('exit', (code) => {
                console.error(`${bin} ${cmd_args.join(' ')}`);
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error('test failed. nyc/mocha exit code: ' + code));
                }
            });
        }
        catch (err) {
            reject(err);
        }
    };
}
function mochaRun({ cliTest = false } = {}) {
    // We need to run the cli test without nyc because of weird behavior
    // with spawn-wrap
    const bin = utils_1.Utils.lookup(cliTest ? '.bin/mocha' : '.bin/nyc', true); //.replace(/\\/g, '\\\\');
    const params = cliTest
        ? []
        : [
            '--require', '@babel/register',
            '--exclude', '/tests/**',
            '--silent',
            '--no-clean',
            require.resolve('mocha/bin/mocha')
        ];
    const mochaArgs = cliTest
        ? ['tests/cli.spec.js']
        : ['--grep', 'precompile cli',
            '--invert', 'tests'];
    const cmd_args = [
        ...params,
        '-R', 'spec',
        '-r', __dirname + 'tests/setup',
        '-r', '@babel/register',
        ...mochaArgs,
    ];
    return new Promise(getMochaRunExecutor(bin, cmd_args));
}
function getRunTestsPromiseExecutor() {
    return (resolve, reject) => {
        const mochaPromise = utils_1.Utils.promiseSequence([
            () => mochaRun({ cliTest: false }),
            () => mochaRun({ cliTest: true }),
        ]);
        let server;
        return mochaPromise
            .then(() => {
            return static_server_1.getStaticServer().then((args) => {
                server = args[0];
                const port = args[1];
                const promises = ['index', 'slim'].map((f) => (() => mocha_phantomjs_1.mochaPhantomJS(`http://localhost:${port}/tests/browser/${f}.html`)));
                return utils_1.Utils.promiseSequence(promises).then(() => {
                    server.close();
                    resolve();
                });
            });
        })
            .catch((err) => {
            if (server) {
                server.close();
            }
            reject(err);
        });
    };
}
function runtests() {
    return new Promise(getRunTestsPromiseExecutor());
}
exports.runtests = runtests;
//# sourceMappingURL=runtests.js.map