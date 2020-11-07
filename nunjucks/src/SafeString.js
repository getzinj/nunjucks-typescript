"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeString = void 0;
class SafeString extends String {
    constructor(val) {
        super(val);
        if (typeof val === 'string') {
            this.val = val;
            this.length_ = (val !== null && val !== void 0 ? val : '').length;
        }
        else if (val instanceof SafeString) {
            this.val = val.val;
            this.length_ = val.length;
        }
        else {
            throw Error(`Unknown type of val: ${typeof val}`);
        }
    }
    get length() { return this.length_; }
    ;
    set length(value) { this.length_ = value; }
    valueOf() {
        return this.val;
    }
    toString() {
        return this.val;
    }
}
exports.SafeString = SafeString;
//# sourceMappingURL=SafeString.js.map