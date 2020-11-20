import * as fs from 'fs';
import * as path from 'path';

import { globalchokidar } from '../environment/globals';
import { Loader } from './loader';



export class FileSystemLoader extends Loader {
  private readonly pathsToNames: any;
  private readonly noCache: boolean;
  private readonly searchPaths: string[];


  constructor(searchPaths, opts?) {
    super();
    if (typeof opts === 'boolean') {
      console.log(
          '[nunjucks] Warning: you passed a boolean as the second ' +
          'argument to FileSystemLoader, but it now takes an options ' +
          'object. See http://mozilla.github.io/nunjucks/api.html#filesystemloader'
      );
    }

    opts = opts || {};
    this.pathsToNames = {};
    this.noCache = !!opts.noCache;

    if (searchPaths) {
      searchPaths = Array.isArray(searchPaths) ? searchPaths : [searchPaths];
      // For windows, convert to forward slashes
      this.searchPaths = searchPaths.map(path.normalize);
    } else {
      this.searchPaths = ['.'];
    }

    if (opts.watch) {
      // Watch all the templates in the paths and fire an event when
      // they change
      try {
        globalchokidar.chokidar = require('chokidar'); // eslint-disable-line global-require
      } catch (e) {
        throw new Error('watch requires chokidar to be installed');
      }
      const paths = this.searchPaths.filter(fs.existsSync);
      const watcher = globalchokidar.chokidar.watch(paths);
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


  getSource(name: string): null | { path: string; noCache: boolean; src: string } {
    let fullpath: string = null;
    const paths: string[] = this.searchPaths;

    for (let i = 0; i < paths.length; i++) {
      const basePath: string = path.resolve(paths[i]);
      const p: string = path.resolve(paths[i], name);

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

    const source: { path: string; noCache: boolean; src: string } = {
      src: fs.readFileSync(fullpath, 'utf-8'),
      path: fullpath,
      noCache: this.noCache
    };
    this.emit('load', name, source);
    return source;
  }
}
