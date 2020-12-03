export interface IPromiseRejectFn<T> {
  (reason: any): T;
}
