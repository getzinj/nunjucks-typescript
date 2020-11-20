import { extendClass } from './object';



export class Obj {
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
