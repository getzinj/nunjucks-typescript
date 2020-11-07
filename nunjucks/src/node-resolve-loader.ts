import { Loader } from './loader';
import { globalchokidar } from './globals';
import * as fs from 'fs';



export class NodeResolveLoader extends Loader {
  private readonly pathsToNames: any;
  private readonly noCache: boolean;
  private watcher: any;


  constructor(opts) {
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
    } catch (e) {
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
