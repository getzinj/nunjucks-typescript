'use strict';

// A simple class system, more documentation to come
import { keys, _assign } from '../lib';

export function parentWrap(parent, prop) {
  if (typeof parent !== 'function' || typeof prop !== 'function') {
    return prop;
  } else {
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


export function extendClass(cls, name, props) {
  props = props || {};

  keys(props).forEach(k => {
    props[k] = parentWrap(cls.prototype[k], props[k]);
  });

  class subclass extends cls {
    get typename(): string {
      return name;
    }
  }

  _assign(subclass.prototype, props);

  return subclass;
}
