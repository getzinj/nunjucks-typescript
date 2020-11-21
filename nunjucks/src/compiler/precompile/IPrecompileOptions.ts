import { IEnvironment } from '../../environment/IEnvironment';



export interface IPrecompileOptions {
  force?: boolean;
  name?: string;
  wrapper?: (templates, opts) => string;
  include?: (string | RegExp)[];
  exclude?: (string | RegExp)[];
  isString?: boolean;
  env?: IEnvironment;
}
