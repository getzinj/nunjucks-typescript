#!/usr/bin/env node
"use strict";
/* eslint-disable vars-on-top, func-names */
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var UglifyJsPlugin = require("uglifyjs-webpack-plugin");
var webpack_1 = require("webpack");
var webpack = require('webpack');
var utils_1 = require("./lib/utils");
require('module-alias/register');
var pjson = require('../package.json');
var TEST_ENV = (process.env.NODE_ENV === 'test');
var destDir = path.resolve(path.join(__dirname, TEST_ENV ? '../tests/browser' : '../browser'));
function getPathResolver(opts) {
    return function (sourcePath) {
        if (sourcePath.match(/^(fs|path|chokidar)$/)) {
            return 'node-libs-browser/mock/empty';
        }
        else if (opts.slim && sourcePath.match(/(nodes|lexer|parser|precompile|transformer|compiler)(\.js)?$/)) {
            return 'node-libs-browser/mock/empty';
        }
        else if (sourcePath.match(/\/loaders(\.js)?$/)) {
            return sourcePath.replace('loaders', opts.slim ? 'precompiled-loader' : 'web-loaders');
        }
        else {
            return null;
        }
    };
}
function getWebpackModulesConfig(opts) {
    return {
        rules: [{
                test: /nunjucks/,
                exclude: /(node_modules|browser|tests)(?!\.js)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: [['module-resolver', {
                                    extensions: ['.js'],
                                    resolvePath: getPathResolver(opts),
                                }]]
                    }
                }
            }]
    };
}
function getWebpackPluginsConfig(type, opts) {
    return [
        new webpack_1.BannerPlugin("Browser bundle of nunjucks " + pjson.version + " " + type),
        new webpack_1.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
            'process.env.BUILD_TYPE': JSON.stringify(opts.slim ? 'SLIM' : 'STD'),
        }),
    ];
}
function createWebPackConfig(filename, opts, type) {
    return {
        entry: './nunjucks/index.js',
        devtool: 'source-map',
        output: {
            path: destDir,
            filename: filename,
            library: 'nunjucks',
            libraryTarget: 'umd',
            devtoolModuleFilenameTemplate: function (info) {
                return path.relative(destDir, info.absoluteResourcePath);
            }
        },
        node: {
            process: false,
            setImmediate: false
        },
        module: getWebpackModulesConfig(opts),
        plugins: getWebpackPluginsConfig(type, opts)
    };
}
function getUglifyJSConfig() {
    return {
        sourceMap: true,
        uglifyOptions: {
            mangle: {
                properties: {
                    regex: /^_[^_]/
                }
            },
            compress: {
                unsafe: true
            }
        }
    };
}
function runWebpack(opts) {
    var type = (opts.slim) ? '(slim, only works with precompiled templates)' : '';
    var ext = (opts.min) ? '.min.js' : '.js';
    if (opts.slim) {
        ext = '-slim' + ext;
    }
    var filename = 'nunjucks' + ext;
    return new Promise(function (resolve, reject) {
        try {
            var config = createWebPackConfig(filename, opts, type);
            if (opts.min) {
                config.plugins.push(new UglifyJsPlugin(getUglifyJSConfig()));
            }
            webpack(config).run(function (err, stats) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(stats.toString({ cached: false, cachedAssets: false }));
                }
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
var runConfigs = [
    { min: true, slim: false },
    { min: true, slim: true }
];
if (!TEST_ENV) {
    runConfigs.unshift({ min: false, slim: false }, { min: false, slim: true });
}
var promises = runConfigs.map(function (opts) { return function () {
    return runWebpack(opts).then(function (stats) {
        console.log(stats); // eslint-disable-line no-console
    });
}; });
utils_1.Utils.promiseSequence(promises).catch(function (err) {
    throw err;
});
