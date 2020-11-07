"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Capture = void 0;
const nunjucksNode_1 = require("./nunjucksNode");
class Capture extends nunjucksNode_1.NunjucksNode {
    constructor(lineno, colno, body) {
        super(lineno, colno, body);
    }
    get typename() { return 'Capture'; }
    get fields() {
        return ['body'];
    }
}
exports.Capture = Capture;
//# sourceMappingURL=capture.js.map