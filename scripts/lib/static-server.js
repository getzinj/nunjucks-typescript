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
exports.getStaticServer = void 0;
const connect = __importStar(require("connect"));
const getPort = __importStar(require("get-port"));
const serveStatic = __importStar(require("serve-static"));
const http = __importStar(require("http"));
const path = __importStar(require("path"));
function getStaticServer(port) {
    const staticRoot = path.join(__dirname, '../..');
    const portPromise = (typeof port === 'undefined') ? getPort.default() : Promise.resolve(port);
    return portPromise.then((port) => {
        return new Promise((resolve, reject) => {
            try {
                const app = connect.default().use(serveStatic.default(staticRoot));
                const server = http.createServer(app);
                server.listen(port, () => {
                    console.log(`Test server listening on port ${port}`); // eslint-disable-line no-console
                    resolve([server, port]);
                });
            }
            catch (e) {
                reject(e);
            }
        });
    });
}
exports.getStaticServer = getStaticServer;
//# sourceMappingURL=static-server.js.map