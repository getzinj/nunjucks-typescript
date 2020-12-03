import { ICallExtension } from './ICallExtension';
import { INunjucksNodeList } from './INunjucksNodeList';
import { NunjucksNode} from './nunjucksNode';
import { NunjucksNodeList } from './nunjucksNodeList';



export class CallExtension extends NunjucksNode implements ICallExtension {
  get typename(): string {
    return 'CallExtension';
  }

  public extName;
  public prop;
  public args: INunjucksNodeList;
  public contentArgs;
  public autoescape;


  constructor(ext, prop: string, args: INunjucksNodeList, contentArgs) {
    super(undefined, undefined);

    this.extName = ext.__name || ext;
    this.prop = prop;
    this.args = args ?? new NunjucksNodeList(undefined, undefined, undefined);
    this.contentArgs = contentArgs || [];
    this.autoescape = ext.autoescape;
  }


  get fields(): string[] {
    return [ 'extName', 'prop', 'args', 'contentArgs' ];
  }
}
