import { Loader } from './loader';
import { ISource } from './ISource';
import { ILoaderOptions } from './ILoaderOptions';
export { PrecompiledLoader } from './precompiled-loader';



export class WebLoader extends Loader {
  private readonly useCache: boolean;
  private readonly baseURL: string;
  private readonly async: boolean;


  constructor(baseURL: string, opts?: ILoaderOptions) {
    super();
    this.baseURL = baseURL || '.';
    opts = opts || {};

    // By default, the cache is turned off because there's no way
    // to "watch" templates over HTTP, so they are re-downloaded
    // and compiled each time. (Remember, PRECOMPILE YOUR
    // TEMPLATES in production!)
    this.useCache = !!opts.useCache;

    // We default `async` to false so that the simple synchronous
    // API can be used when you aren't doing anything async in
    // your templates (which is most of the time). This performs a
    // sync ajax request, but that's ok because it should *only*
    // happen in development. PRECOMPILE YOUR TEMPLATES.
    this.async = !!opts.async;
  }


  resolve(from, to): string {
    throw new Error('relative templates not support in the browser yet');
  }


  getSource(name: string, cb): ISource | null {
    const useCache: boolean = this.useCache;
    let result: ISource;
    this.fetch(this.baseURL + '/' + name, (err, src) => {
      if (err) {
        if (cb) {
          cb(err.content);
        } else if (err.status === 404) {
          result = null;
        } else {
          throw err.content;
        }
      } else {
        result = {
          src: src,
          path: name,
          noCache: !useCache
        };
        this.emit('load', name, result);
        if (cb) {
          cb(null, result);
        }
      }
    });

    // if this WebLoader isn't running asynchronously, the
    // fetch above would actually run sync and we'll have a
    // result here
    return result;
  }


  fetch(url: string, cb): void {
    // Only in the browser please
    if (typeof window === 'undefined') {
      throw new Error('WebLoader can only by used in a browser');
    }

    const ajax: XMLHttpRequest = new XMLHttpRequest();
    let loading: boolean = true;

    ajax.onreadystatechange = () => {
      if (ajax.readyState === 4 && loading) {
        loading = false;
        if (ajax.status === 0 || ajax.status === 200) {
          cb(null, ajax.responseText);
        } else {
          cb({
            status: ajax.status,
            content: ajax.responseText
          });
        }
      }
    };

    url += (url.indexOf('?') === -1 ? '?' : '&') + 's=' +
    (new Date().getTime());

    ajax.open('GET', url, this.async);
    ajax.send();
  }
}
