export interface ICyclerObj<T> {
  current: T | null;

  reset(): void;

  next(): T;
}
