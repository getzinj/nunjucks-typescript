const connect = require('connect');
const getPort = require('get-port');
const serveStatic = require('serve-static');
const http = require('http');
const path = require('path');

import { Server, RequestListener } from 'http';


export function getStaticServer(port?: number): Promise<[Server, number]> {
  const staticRoot: string = path.join(__dirname, '../..');
  const portPromise: Promise<number> = (typeof port === 'undefined') ? getPort() : Promise.resolve(port);

  return portPromise.then( (port: number): Promise<[Server, number]> => { // eslint-disable-line no-shadow
    return new Promise<[ Server, number ]>(
        (resolve: (result: [ Server, number ]) => void, reject: (reason: any) => void): void => {
            try {
              const app: RequestListener = connect().use(serveStatic(staticRoot));
              const server: Server = http.createServer(app);
              server.listen(port, (): void => {
                console.log(`Test server listening on port ${ port }`); // eslint-disable-line no-console
                resolve([ server, port ]);
              });
            } catch (e) {
              reject(e);
            }
          }
    );
  } );
}
