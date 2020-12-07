import * as connect from 'connect';
import * as http from 'http';
import { RequestListener, Server } from 'http';
import * as express from 'express';


const app: RequestListener = connect.default()
    .use(express.static('/node_modules'))
    .use(express.static('.'));
const server: Server = http.createServer(app);
server.listen(59662, (): void => {
  console.log(`Test server listening on port ${ 59662 }`); // eslint-disable-line no-console
});
