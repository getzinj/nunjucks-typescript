"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMainModule = void 0;
function isMainModule() {
    // generate a stack trace
    const stack = (new Error()).stack;
    // the third line refers to our caller
    const stackLine = stack.split('\n')[2];
    // extract the module name from that line
    const callerModuleName = /\((.*):\d+:\d+\)$/.exec(stackLine)[1];
    return require.main.filename === callerModuleName;
}
exports.isMainModule = isMainModule;
//# sourceMappingURL=is-main-module.js.map