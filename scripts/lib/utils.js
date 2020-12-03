"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
var path = require("path");
var fs = require("fs");
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.lookup = function (relPath, isExecutable) {
        for (var i = 0; i < module.paths.length; i++) {
            var absPath = path.join(module.paths[i], relPath);
            if (isExecutable && process.platform === 'win32') {
                absPath += '.cmd';
            }
            if (fs.existsSync(absPath)) {
                return absPath;
            }
        }
        return undefined;
    };
    Utils.promiseSequence = function (promises) {
        return new Promise(function (resolve, reject) {
            var results = [];
            function iterator(prev, curr) {
                return prev.then(function (result) {
                    results.push(result);
                    return curr(result, results);
                }).catch(function (err) {
                    reject(err);
                });
            }
            promises.push(function () { return Promise.resolve(); });
            promises.reduce(iterator, Promise.resolve(false)).then(function (res) { return resolve(res); });
        });
    };
    return Utils;
}());
exports.Utils = Utils;
