"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Obj = void 0;
const object_1 = require("./object");
class Obj {
    constructor(...args) {
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
exports.Obj = Obj;
//# sourceMappingURL=obj.js.map