"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Frame = void 0;
// Frames keep track of scoping both at compile-time and run-time so
// we know how to access variables. Block tags can introduce special
// variables, for example.
class Frame {
    constructor(parent, isolateWrites) {
        this.variables = {};
        this.parent = parent;
        this.topLevel = false;
        // if this is true, writes (set) should never propagate upwards past
        // this frame to its parent (though reads may).
        this.isolateWrites = isolateWrites;
    }
    set(name, val, resolveUp) {
        // Allow variables with dots by automatically creating the
        // nested structure
        if (!name) {
            debugger;
        }
        var parts = name.split('.');
        var obj = this.variables;
        var frame = this;
        if (resolveUp) {
            if ((frame = this.resolve(parts[0], true))) {
                frame.set(name, val);
                return;
            }
        }
        for (let i = 0; i < parts.length - 1; i++) {
            const id = parts[i];
            if (!obj[id]) {
                obj[id] = {};
            }
            obj = obj[id];
        }
        obj[parts[parts.length - 1]] = val;
    }
    get(name) {
        var val = this.variables[name];
        if (val !== undefined) {
            return val;
        }
        return null;
    }
    lookup(name) {
        var p = this.parent;
        var val = this.variables[name];
        if (val !== undefined) {
            return val;
        }
        return p && p.lookup(name);
    }
    resolve(name, forWrite) {
        var p = (forWrite && this.isolateWrites) ? undefined : this.parent;
        var val = this.variables[name];
        if (val !== undefined) {
            return this;
        }
        return p && p.resolve(name);
    }
    push(isolateWrites) {
        return new Frame(this, isolateWrites);
    }
    pop() {
        return this.parent;
    }
}
exports.Frame = Frame;
//# sourceMappingURL=frame.js.map