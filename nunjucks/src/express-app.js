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
exports.express = void 0;
const path = __importStar(require("path"));
function express(env, app) {
    function NunjucksView(name, opts) {
        this.name = name;
        this.path = name;
        this.defaultEngine = opts.defaultEngine;
        this.ext = path.extname(name);
        if (!this.ext && !this.defaultEngine) {
            throw new Error('No default engine was specified and no extension was provided.');
        }
        if (!this.ext) {
            this.name += (this.ext = (this.defaultEngine[0] !== '.' ? '.' : '') + this.defaultEngine);
        }
    }
    NunjucksView.prototype.render = function render(opts, cb) {
        env.render(this.name, opts, cb);
    };
    app.set('view', NunjucksView);
    app.set('nunjucksEnv', env);
    return env;
}
exports.express = express;
//# sourceMappingURL=express-app.js.map