import { ISource } from '../loaders/ISource';

export interface ILoader {
  cache;

  getSource(tmplName: string, cb?): ISource | null;
}
