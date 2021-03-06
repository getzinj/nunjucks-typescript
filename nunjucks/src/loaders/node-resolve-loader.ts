import * as fs from 'fs';

import { Loader } from './loader';
import { globalchokidar } from '../environment/globals';
import { URL } from 'url';
import { ISource } from '../interfaces/ISource';
import { ILoaderOptions } from '../interfaces/ILoaderOptions';
import { ILoader } from '../interfaces/ILoader';


export class NodeResolveLoader extends Loader implements ILoader {
  private readonly pathsToNames;
  private readonly noCache: boolean;
  private watcher;


  constructor(opts?: ILoaderOptions) {
    super();
    opts = opts || {};
    this.pathsToNames = {};
    this.noCache = !!opts.noCache;

    if (opts.watch) {
      try {
        globalchokidar.chokidar = require('chokidar'); // eslint-disable-line global-require
      } catch (e) {
        throw new Error('watch requires chokidar to be installed');
      }
      this.watcher = globalchokidar.chokidar.watch();

      this.watcher.on('change', (fullname: string | number): void => {
        this.emit('update', this.pathsToNames[fullname], fullname);
      });

      this.watcher.on('error', (error): void => {
        // eslint-disable-next-line no-console
        console.log('Watcher error: ' + error);
      });

      this.on('load', (name: string, source): void => {
        this.watcher.add(source.path);
      });
    }
  }


  getSource(name: string): null | ISource {
    // Don't allow file-system traversal
    if ((/^\.?\.?(\/|\\)/).test(name)) {
      return null;
    }
    if ((/^[A-Z]:/i).test(name)) {
      return null;
    }

    let fullpath: string | number | Buffer | URL;

    try {
      fullpath = require.resolve(name);
    } catch (e) {
      return null;
    }

    this.pathsToNames[fullpath] = name;

    const source: ISource = {
      src: fs.readFileSync(fullpath, 'utf-8'),
      path: fullpath,
      noCache: this.noCache,
    };

    this.emit('load', name, source);
    return source;
  }
}


