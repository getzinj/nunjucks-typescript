import { EventEmitter } from 'events';
import { extendClass } from './object';



export class EmitterObj extends EventEmitter {
  constructor(...args) {
    super();
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
