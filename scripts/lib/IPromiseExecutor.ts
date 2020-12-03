import { IPromiseResolveFn } from './IPromiseResolveFn';
import { IPromiseRejectFn } from './IPromiseRejectFn';



export interface IPromiseExecutor<T> {
  (resolve: IPromiseResolveFn<T>, reject: IPromiseRejectFn<T>): T | Promise<T>;
}
