import { TokenType } from './tokenType';



export class Token<T> {
  constructor(public readonly type: TokenType,
              public readonly value: T,
              public readonly lineno: number,
              public readonly colno: number) { }
}
