export interface IPromiseResolveFn<T> {
  (... args: any[]): T;
}
