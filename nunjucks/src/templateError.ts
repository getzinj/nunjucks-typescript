import { repeat } from './lib';



export class TemplateError extends Error {
  private firstUpdate: boolean = true;
  public cause: Error;


  get getStack(): () => string {
    let returnValue: () => string;

    if (this.cause) {
      const stackDescriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(this.cause, 'stack');
      returnValue = stackDescriptor && (stackDescriptor.get || (() => stackDescriptor.value));
      if (!returnValue) {
        returnValue = (): string => this.cause.stack;
      }
    } else {
      const stack: string = (new Error(this.message)).stack;
      returnValue = (): string => stack;
    }

    return returnValue;
  }


  get stack(): string { return this.getStack.call(this); }


  constructor(message, public readonly lineno?: number, public readonly colno?: number, public readonly line?: string) {
    super(message);

    if (message instanceof Error) {
      this.cause = message;
      this.message = `${this.cause.name}: ${this.cause.message}`;
    }

    this.name = 'Template render error';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }


  public Update(path): TemplateError {
    let msg: string = '(' + (path || 'unknown path') + ')';

    // only show lineno + colno next to path of template
    // where error occurred
    if (this.firstUpdate) {
      if (this.lineno && this.colno) {
        msg += ` [Line ${this.lineno}, Column ${this.colno}]`;
      } else if (this.lineno) {
        msg += ` [Line ${this.lineno}]`;
      }
    }

    msg += '\n ';
    if (this.firstUpdate) {
      if (this.line) {
        msg += this.line;
        msg += '\n';
        if (this.colno) {
          msg += repeat(' ', this.colno);
          msg += '^';
          msg += '\n';
        }
      }

      msg += ' ';
    }

    this.message = msg + (this.message || '');
    this.firstUpdate = false;

    return this;
  }
}
