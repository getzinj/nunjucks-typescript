import { IExtension } from './IExtension';
import { IEnvironmentOptions } from './IEnvironmentOptions';
import { IFilterFunction } from './IFilterFunction';
import { ILoader } from './ILoader';



export interface IEnvironment {
  loaders: ILoader[];
  extensionsList: IExtension[];
  asyncFilters: string[];
  opts: IEnvironmentOptions;
  globals;

  addFilter(name: string, filter: IFilterFunction, async?: boolean): void;
  addExtension(name: string, extension: IExtension): void;
}
