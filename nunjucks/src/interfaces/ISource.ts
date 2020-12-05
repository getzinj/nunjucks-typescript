import { ISourceDetails } from './ISourceDetails';



export interface ISource {
  path: string;
  src: ISourceDetails | string;
  noCache?: boolean;
}
