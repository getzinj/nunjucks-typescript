"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmitterObj = void 0;
const events_1 = require("events");
const object_1 = require("./object");
class EmitterObj extends events_1.EventEmitter {
    constructor(...args) {
        super();
        // Unfortunately necessary for backwards compatibility
        this.init(...args);
    }
    init(...args) {
    }
    get typename() {
        return this.constructor.name;
    }
    static extend(name, props) {
        if (typeof name === 'object') {
            props = name;
            name = 'anonymous';
        }
        return object_1.extendClass(this, name, props);
    }
}
exports.EmitterObj = EmitterObj;
//# sourceMappingURL=emitterObj.js.map