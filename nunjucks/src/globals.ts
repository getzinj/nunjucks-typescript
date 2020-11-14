'use strict';

interface CyclerObj<T> {
  current: T | null;
  reset(): void;
  next(): T;
}


export function cycler<T>(items: T[]): CyclerObj<T> {
  let index: number = -1;

  return {
    current: null,

    reset(): void {
      index = -1;
      this.current = null;
    },

    next(): T {
      index++;
      if (index >= items.length) {
        index = 0;
      }

      this.current = items[index];
      return this.current;
    }
  };
}


export function joiner(sep: string): () => string {
  sep = sep ?? ',';
  let first: boolean = true;

  return (): string => {
    const val: string = first ? '' : sep;
    first = false;
    return val;
  };
}


// Making this a function instead so it returns a new object
// each time it's called. That way, if something like an environment
// uses it, they will each have their own copy.
export function globals() {
  return {
    range(start, stop, step: number) {
      if (typeof stop === 'undefined') {
        stop = start;
        start = 0;
        step = 1;
      } else if (!step) {
        step = 1;
      }

      const arr: number[] = [];
      if (step > 0) {
        for (let i: number = start; i < stop; i += step) {
          arr.push(i);
        }
      } else {
        for (let i: number = start; i > stop; i += step) { // eslint-disable-line for-direction
          arr.push(i);
        }
      }
      return arr;
    },


    cycler() {
      return cycler(Array.prototype.slice.call(arguments));
    },


    joiner(sep) {
      return joiner(sep);
    }
  };
}


export const globalchokidar = {
  chokidar: undefined
}
