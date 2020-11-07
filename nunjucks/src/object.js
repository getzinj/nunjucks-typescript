'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendClass = exports.parentWrap = void 0;
// A simple class system, more documentation to come
const lib_1 = require("./lib");
function parentWrap(parent, prop) {
    if (typeof parent !== 'function' || typeof prop !== 'function') {
        return prop;
    }
    else {
        return function wrap() {
            // Save the current parent method
            const tmp = this.parent;
            // Set parent to the previous method, call, and restore
            this.parent = parent;
            const res = prop.apply(this, arguments);
            this.parent = tmp;
            return res;
        };
    }
}
exports.parentWrap = parentWrap;
function extendClass(cls, name, props) {
    props = props || {};
    lib_1.keys(props).forEach(k => {
        props[k] = parentWrap(cls.prototype[k], props[k]);
    });
    class subclass extends cls {
        get typename() {
            return name;
        }
    }
    lib_1._assign(subclass.prototype, props);
    return subclass;
}
exports.extendClass = extendClass;
//# sourceMappingURL=object.js.map