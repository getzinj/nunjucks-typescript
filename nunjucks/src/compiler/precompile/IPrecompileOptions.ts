import { Environment } from '../../environment/environment';



export interface IPrecompileOptions {
  force?: boolean;
  name?: string;
  wrapper?: (templates, opts) => string;
  include?;
  exclude?;
  isString?: boolean;
  env?: Environment;
}
