import { Template } from '../environment/template';
import { IContext } from './IContext';



export interface ITemplate {
  name: string;
  template: Template;

  render(ctx: IContext, cb?: (err, res) => void): string;
}
