import { TokenType } from './tokenType';



export class Token {
  constructor(public readonly type: TokenType,
              public readonly value,
              public readonly lineno: number,
              public readonly colno: number) { }
}
