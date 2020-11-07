"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callbackAsap = void 0;
const asap_1 = __importDefault(require("asap"));
// If the user is using the async API, *always* call it
// asynchronously even if the template was synchronous.
function callbackAsap(cb, err, res) {
    asap_1.default(() => {
        cb(err, res);
    });
}
exports.callbackAsap = callbackAsap;
//# sourceMappingURL=callbackAsap.js.map