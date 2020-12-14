export interface IFrame {
  parent?: IFrame;
  topLevel: boolean;

  push(b?: boolean): IFrame;

  resolve(name: string, forWrite?: boolean): IFrame | undefined;

  lookup<T>(name: string): T;

  set(name: string, val: string, resolveUp?: boolean): void;

  pop(): IFrame | undefined;
}
