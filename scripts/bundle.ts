#!/usr/bin/env node
/* eslint-disable vars-on-top, func-names */

import * as path from 'path';
import { BannerPlugin, Configuration, DefinePlugin, DevtoolModuleFilenameTemplateInfo, Plugin, Stats } from 'webpack';
import { IBundleType } from './IBundleType';
import { IUglifyJSConfig } from './IUglifyJSConfig';
import { promiseSequence } from './lib/utils';

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const webpack = require('webpack');


require('module-alias/register');

const pjson: Record<string | number | symbol, any> = require('../package.json');
const TEST_ENV: boolean = (process.env.NODE_ENV === 'test');
const destDir: string = path.resolve(path.join(__dirname, TEST_ENV ? '../tests/browser' : '../browser'));


function getPathResolver(opts: IBundleType): (sourcePath: string) => (string | null) {
  return (sourcePath: string): string | null => {
    if (sourcePath.match(/^(fs|path|chokidar)$/)) {
      return 'node-libs-browser/mock/empty';
    } else if (opts.slim && sourcePath.match(/(nodes|lexer|parser|precompile|transformer|compiler)(\.js)?$/)) {
      return 'node-libs-browser/mock/empty';
    } else if (sourcePath.match(/\/loaders(\.js)?$/)) {
      return replaceLast(sourcePath, 'loaders', opts.slim ? 'precompiled-loader' : 'web-loaders');
    } else {
      return null;
    }
  };
}


function replaceLast(str: string | null | undefined,
                     substring: string | null | undefined, withValue: string | null | undefined): string {
  const asRegExp: RegExp = new RegExp(substring ?? '');
  const parts: string[] = (str ?? '').split(asRegExp);

  if (parts.length > 0) {
    let reassembled: string = '';
    let lastElementIndex: number = parts.length - 1;
    for (let i = 0; i < lastElementIndex; i++) {
      if (i > 0) {
        reassembled += (substring ?? '');
      }
      reassembled += parts[i];
    }
    reassembled += withValue;
    reassembled += parts[lastElementIndex];

    return reassembled;
  } else {
    return str;
  }
}


function getWebpackModulesConfig(opts: IBundleType) {
  return {
    rules: [ {
      test: /nunjucks/,
      exclude: /(node_modules|browser|tests)(?!\.js)/,
      use: {
        loader: 'babel-loader',
        options: {
          plugins: [ [ 'module-resolver', {
            extensions: [ '.js' ],
            resolvePath: getPathResolver(opts),
          } ] ]
        }
      }
    } ]
  };
}


function getWebpackPluginsConfig(type: string, opts: IBundleType): Plugin[] {
  return [
    new BannerPlugin(`Browser bundle of nunjucks ${pjson.version} ${type}`),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.BUILD_TYPE': JSON.stringify(opts.slim ? 'SLIM' : 'STD'),
    }),
  ];
}


function createWebPackConfig(filename: string, opts: IBundleType, type: string): Configuration {
  return {
    entry: './nunjucks/index.js',
    devtool: 'source-map',
    output: {
      path: destDir,
      filename: filename,
      library: 'nunjucks',
      libraryTarget: 'umd',
      devtoolModuleFilenameTemplate: (info: DevtoolModuleFilenameTemplateInfo): string =>
          path.relative(destDir, info.absoluteResourcePath)
    },
    node: {
      process: false,
      setImmediate: false
    },
    module: getWebpackModulesConfig(opts),
    plugins: getWebpackPluginsConfig(type, opts)
  };
}


function getUglifyJSConfig(): IUglifyJSConfig {
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


function runWebpack(opts: IBundleType) {
  const type: string = (opts.slim) ? '(slim, only works with precompiled templates)' : '';
  let ext: string = (opts.min) ? '.min.js' : '.js';
  if (opts.slim) {
    ext = '-slim' + ext;
  }
  const filename: string = 'nunjucks' + ext;

  return new Promise((resolve, reject): void => {
    try {
      const config: Configuration = createWebPackConfig(filename, opts, type);

      if (opts.min) {
        config.plugins.push(
          new UglifyJsPlugin(getUglifyJSConfig())
        );
      }

      webpack(config).run((err: Error, stats: Stats): void => {
        if (err) {
          reject(err);
        } else {
          resolve(stats.toString({ cached: false, cachedAssets: false }));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

const runConfigs: IBundleType[] = [
  { min: true, slim: false },
  { min: true, slim: true }
];

if (!TEST_ENV) {
  runConfigs.unshift( { min: false, slim: false }, { min: false, slim: true });
}

const promises: (() => Promise<void>)[] =
    runConfigs.map( (opts: IBundleType): () => Promise<void> => (): Promise<void> =>
        runWebpack(opts).then((stats): void => {
          console.log(stats); // eslint-disable-line no-console
        })
    );


promiseSequence(promises).catch((err: any): void => {
  throw err;
});
