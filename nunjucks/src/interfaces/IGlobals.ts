import { ICyclerObj } from './ICyclerObj';



export interface IGlobals {
  range(start: number, stop: number, step: number): number[];

  cycler<T>(): ICyclerObj<T>;

  joiner(sep: string): () => string;
}
