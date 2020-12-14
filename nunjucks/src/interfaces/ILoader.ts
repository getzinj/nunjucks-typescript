import { ISource } from './ISource';



export interface ILoader {
  on: (event: 'load' | 'update', cb: (name: string, arg: string) => void) => void;
  cache;

  getSource(tmplName: string, cb?): ISource | null;
}
