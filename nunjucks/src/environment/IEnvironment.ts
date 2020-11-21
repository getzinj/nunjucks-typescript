import { IExtension } from '../compiler/parser/IExtension';
import { IEnvironmentOptions } from './IEnvironmentOptions';
import { IFilterFunction } from './IFilterFunction';



export interface IEnvironment {
  extensionsList: IExtension[];
  asyncFilters: string[];
  opts: IEnvironmentOptions;
  globals;

  addFilter(name: string | number, filter: IFilterFunction, async?: boolean): void;

  addExtension(name: string | number, extension: IExtension): void;
}
