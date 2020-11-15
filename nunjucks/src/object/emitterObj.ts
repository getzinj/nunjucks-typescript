import { EventEmitter } from 'events';
import { extendClass } from './object';



export class EmitterObj extends EventEmitter {
  constructor(...args) {
    super();
    // Unfortunately necessary for backwards compatibility
    this.init(...args);
  }

  init(...args) {
  }


  get typename(): string {
    return this.constructor.name;
  }


  static extend(name, props) {
    if (typeof name === 'object') {
      props = name;
      name = 'anonymous';
    }
    return extendClass(this, name, props);
  }
}
