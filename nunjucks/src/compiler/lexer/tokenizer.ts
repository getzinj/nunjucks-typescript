import { indexOf } from '../../lib';
import { Token } from './token';
import { TokenType } from './tokenType';
import { ITokenizerOptions } from '../../interfaces/ITokenizerOptions';
import { Tag } from './tag';
import { IRegexTokenValue } from '../../interfaces/IRegexTokenValue';
import { ITags } from '../../interfaces/ITags';
import { ITokenizer } from '../../interfaces/ITokenizer';


export class Tokenizer implements ITokenizer {
  private readonly whitespaceChars: string = ' \n\t\r\u00A0';
  private readonly delimChars: string = '()[]{}%*-+~/#,:|.<>=!';
  private readonly intChars: string = '0123456789';

  /**
   * The possible flags are according to https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/RegExp)
   */
  private static readonly regexFlags: string[] = [ 'g', 'i', 'm', 'y' ];

  index: number;
  private readonly str: string;
  private readonly len: number;
  lineno: number;
  colno: number;
  in_code: boolean;
  public readonly tags: Record<string, string>;
  readonly trimBlocks: boolean;
  readonly lstripBlocks: boolean;
  private readonly src: string;
  currentLine_: string = '';

  public get currentLine(): string { return this.currentLine_; }


  constructor(str: string, opts: ITokenizerOptions = { }) {
    this.str = str;
    this.index = 0;
    this.len = str.length;
    this.lineno = 0;
    this.colno = 0;

    this.in_code = false;

    const tags: ITags = opts.tags || {};
    this.tags = {
      BLOCK_START: tags.blockStart || Tag.BLOCK_START,
      BLOCK_END: tags.blockEnd || Tag.BLOCK_END,
      VARIABLE_START: tags.variableStart || Tag.VARIABLE_START,
      VARIABLE_END: tags.variableEnd || Tag.VARIABLE_END,
      COMMENT_START: tags.commentStart || Tag.COMMENT_START,
      COMMENT_END: tags.commentEnd || Tag.COMMENT_END
    };

    this.trimBlocks = !!opts.trimBlocks;
    this.lstripBlocks = !!opts.lstripBlocks;
  }


  nextToken(): Token<string | IRegexTokenValue> | null {
    const lineno: number = this.lineno;
    const colno: number = this.colno;
    let tok: string;

    if (this.in_code) {
      // Otherwise, if we are in a block parse it as code
      let cur: string = this.current();

      if (this.isFinished()) {
        // We have nothing else to parse
        return null;
      } else if (cur === '"' || cur === '\'') {
        // We've hit a string
        return new Token(TokenType.TOKEN_STRING, this._parseString(cur), lineno, colno);
      } else if ((tok = this._extract(this.whitespaceChars))) {
        // We hit some whitespace
        return new Token(TokenType.TOKEN_WHITESPACE, tok, lineno, colno);
      } else if ((tok = this._extractString(this.tags.BLOCK_END)) ||
          (tok = this._extractString('-' + this.tags.BLOCK_END))) {
        // Special check for the block end tag
        //
        // It is a requirement that start and end tags are composed of
        // delimiter characters (%{}[] etc), and our code always
        // breaks on delimiters so we can assume the token parsing
        // doesn't consume these elsewhere
        this.in_code = false;
        if (this.trimBlocks) {
          cur = this.current();
          if (cur === '\n') {
            // Skip newline
            this.forward();
          } else if (cur === '\r') {
            // Skip CRLF newline
            this.forward();
            cur = this.current();
            if (cur === '\n') {
              this.forward();
            } else {
              // Was not a CRLF, so go back
              this.back();
            }
          }
        }
        return new Token(TokenType.TOKEN_BLOCK_END, tok, lineno, colno);
      } else if ((tok = this._extractString(this.tags.VARIABLE_END)) ||
          (tok = this._extractString('-' + this.tags.VARIABLE_END))) {
        // Special check for variable end tag (see above)
        this.in_code = false;
        return new Token(TokenType.TOKEN_VARIABLE_END, tok, lineno, colno);
      } else if (cur === 'r' && this.str.charAt(this.index + 1) === '/') {
        return this.getRegex(lineno, colno);
      } else if (this.delimChars.indexOf(cur) !== -1) {
        // We've hit a delimiter (a special char like a bracket)
        this.forward();
        const complexOps: string[] = [ '==', '===', '!=', '!==', '<=', '>=', '//', '**' ];
        const curComplex: string = cur + this.current();
        let type: TokenType;

        if (indexOf(complexOps, curComplex) !== -1) {
          this.forward();
          cur = curComplex;

          // See if this is a strict equality/inequality comparator
          if (indexOf(complexOps, curComplex + this.current()) !== -1) {
            cur = curComplex + this.current();
            this.forward();
          }
        }

        switch (cur) {
          case '(':
            type = TokenType.TOKEN_LEFT_PAREN;
            break;
          case ')':
            type = TokenType.TOKEN_RIGHT_PAREN;
            break;
          case '[':
            type = TokenType.TOKEN_LEFT_BRACKET;
            break;
          case ']':
            type = TokenType.TOKEN_RIGHT_BRACKET;
            break;
          case '{':
            type = TokenType.TOKEN_LEFT_CURLY;
            break;
          case '}':
            type = TokenType.TOKEN_RIGHT_CURLY;
            break;
          case ',':
            type = TokenType.TOKEN_COMMA;
            break;
          case ':':
            type = TokenType.TOKEN_COLON;
            break;
          case '~':
            type = TokenType.TOKEN_TILDE;
            break;
          case '|':
            type = TokenType.TOKEN_PIPE;
            break;
          default:
            type = TokenType.TOKEN_OPERATOR;
        }

        return new Token(type, cur, lineno, colno);
      } else {
        // We are not at whitespace or a delimiter, so extract the
        // text and parse it
        tok = this._extractUntil(this.whitespaceChars + this.delimChars);

        if (tok.match(/^[-+]?[0-9]+$/)) {
          return this.getNumber(tok, lineno, colno);
        } else if (tok.match(/^(true|false)$/)) {
          return new Token(TokenType.TOKEN_BOOLEAN, tok, lineno, colno);
        } else if (tok === 'none') {
          return new Token(TokenType.TOKEN_NONE, tok, lineno, colno);
          /*
           * Added to make the test `null is null` evaluate truthily.
           * Otherwise, Nunjucks will look up null in the context and
           * return `undefined`, which is not what we want. This *may* have
           * consequences is someone is using null in their templates as a
           * variable.
           */
        } else if (tok === 'null') {
          return new Token(TokenType.TOKEN_NONE, tok, lineno, colno);
        } else if (tok) {
          return new Token(TokenType.TOKEN_SYMBOL, tok, lineno, colno);
        } else {
          throw new Error('Unexpected value while parsing: ' + tok);
        }
      }
    } else {
      // Parse out the template text, breaking on tag
      // delimiters because we need to look for block/variable start
      // tags (don't use the full delimChars for optimization)
      const beginChars: string = (this.tags.BLOCK_START.charAt(0) +
          this.tags.VARIABLE_START.charAt(0) +
          this.tags.COMMENT_START.charAt(0) +
          this.tags.COMMENT_END.charAt(0));

      if (this.isFinished()) {
        return null;
      } else if ((tok = this._extractString(this.tags.BLOCK_START + '-')) ||
          (tok = this._extractString(this.tags.BLOCK_START))) {
        this.in_code = true;
        return new Token(TokenType.TOKEN_BLOCK_START, tok, lineno, colno);
      } else if ((tok = this._extractString(this.tags.VARIABLE_START + '-')) ||
          (tok = this._extractString(this.tags.VARIABLE_START))) {
        this.in_code = true;
        return new Token(TokenType.TOKEN_VARIABLE_START, tok, lineno, colno);
      } else {
        tok = '';
        let data: string;
        let inComment: boolean = false;

        if (this._matches(this.tags.COMMENT_START)) {
          inComment = true;
          tok = this._extractString(this.tags.COMMENT_START);
        }

        // Continually consume text, breaking on the tag delimiter
        // characters and checking to see if it's a start tag.
        //
        // We could hit the end of the template in the middle of
        // our looping, so check for the null return value from
        // _extractUntil
        while ((data = this._extractUntil(beginChars)) !== null) {
          tok += data;

          if ((this._matches(this.tags.BLOCK_START) ||
              this._matches(this.tags.VARIABLE_START) ||
              this._matches(this.tags.COMMENT_START)) &&
              !inComment) {
            if (this.lstripBlocks &&
                this._matches(this.tags.BLOCK_START) &&
                this.colno > 0 &&
                this.colno <= tok.length) {
              const lastLine: string = tok.slice(-this.colno);
              if (/^\s+$/.test(lastLine)) {
                // Remove block leading whitespace from beginning of the string
                tok = tok.slice(0, -this.colno);
                if (!tok.length) {
                  // All data removed, collapse to avoid unnecessary nodes
                  // by returning next token (block start)
                  return this.nextToken();
                }
              }
            }
            // If it is a start tag, stop looping
            break;
          } else if (this._matches(this.tags.COMMENT_END)) {
            if (!inComment) {
              throw new Error('unexpected end of comment');
            }
            tok += this._extractString(this.tags.COMMENT_END);
            break;
          } else {
            // It does not match any tag, so add the character and
            // carry on
            tok += this.current();
            this.forward();
          }
        }

        if (data === null && inComment) {
          throw new Error('expected end of comment, got end of file');
        }

        return new Token(inComment ? TokenType.TOKEN_COMMENT : TokenType.TOKEN_DATA, tok, lineno, colno);
      }
    }
  }


  private getNumber(tok: string, lineno: number, colno: number): Token<any> {
    if (this.current() === '.') {
      this.forward();
      const dec: string = this._extract(this.intChars);
      return new Token(TokenType.TOKEN_FLOAT, tok + '.' + dec, lineno, colno);
    } else {
      return new Token(TokenType.TOKEN_INT, tok, lineno, colno);
    }
  }


  private getRegex(lineno: number, colno: number): Token<IRegexTokenValue> {
    // Skip past 'r/'.
    this.forwardN(2);

    // Extract until the end of the regex -- / ends it, \/ does not.
    let regexBody: string = '';
    while (!this.isFinished()) {
      if (this.current() === '/' && this.previous() !== '\\') {
        this.forward();
        break;
      } else {
        regexBody += this.current();
        this.forward();
      }
    }

    // Check for flags.
    const POSSIBLE_FLAGS: string[] = Tokenizer.regexFlags;
    let regexFlags: string = '';
    while (!this.isFinished()) {
      const isCurrentAFlag: boolean = POSSIBLE_FLAGS.indexOf(this.current()) !== -1;
      if (isCurrentAFlag) {
        regexFlags += this.current();
        this.forward();
      } else {
        break;
      }
    }

    return new Token<IRegexTokenValue>(TokenType.TOKEN_REGEX, {
      body: regexBody,
      flags: regexFlags
    }, lineno, colno);
  }

  
  _parseString(delimiter: string): string {
    this.forward();

    let str: string = '';

    while (!this.isFinished() && this.current() !== delimiter) {
      const cur: string = this.current();

      if (cur === '\\') {
        this.forward();
        switch (this.current()) {
          case 'n':
            str += '\n';
            break;
          case 't':
            str += '\t';
            break;
          case 'r':
            str += '\r';
            break;
          default:
            str += this.current();
        }
        this.forward();
      } else {
        str += cur;
        this.forward();
      }
    }

    this.forward();
    return str;
  }


  _matches(str: string): null | boolean {
    return (this.index + str.length) > this.len
        ? null
        : (this.str.slice(this.index, this.index + str.length) === str);
  }


  _extractString(str: string): string | null {
    if (this._matches(str)) {
      this.forwardN(str.length);
      return str;
    }
    return null;
  }


  _extractUntil(charString: string): string {
    // Extract all non-matching chars, with the default matching set
    // to everything
    return this._extractMatching(true, charString || '');
  }


  _extract(charString: string): string {
    // Extract all matching chars (no default, so charString must be
    // explicit)
    return this._extractMatching(false, charString);
  }


  _extractMatching(breakOnMatch: boolean, charString: string): string | null {
    // Pull out characters until a breaking char is hit.
    // If breakOnMatch is false, a non-matching char stops it.
    // If breakOnMatch is true, a matching char stops it.

    if (this.isFinished()) {
      return null;
    }

    const first: number = charString.indexOf(this.current());

    // Only proceed if the first character doesn't meet our condition
    if ((breakOnMatch && first === -1) || (!breakOnMatch && first !== -1)) {
      let t: string = this.current();
      this.forward();

      // And pull out all the chars one at a time until we hit a
      // breaking char
      let idx: number = charString.indexOf(this.current());

      while (((breakOnMatch && idx === -1) ||
          (!breakOnMatch && idx !== -1)) && !this.isFinished()) {
        t += this.current();
        this.forward();

        idx = charString.indexOf(this.current());
      }

      return t;
    }

    return '';
  }


  _extractRegex(regex: RegExp): null | RegExpMatchArray {
    const matches: RegExpMatchArray | null = this.currentStr().match(regex);
    if (matches) {
      // Move forward whatever was matched
      this.forwardN(matches[0].length);

      return matches;
    } else {
      return null;
    }
  }


  isFinished(): boolean {
    return this.index >= this.len;
  }


  forwardN(n: number): void {
    for (let i: number = 0; i < n; i++) {
      this.forward();
    }
  }


  forward(): void {
    if (this.currentLine_ === '') {
      const nextNewlineIndex: number = this.str.indexOf('\n');
      this.currentLine_ = this.str.substring(this.index, (nextNewlineIndex === -1) ? undefined : nextNewlineIndex);
    }
    this.index++;


    if (this.previous() === '\n') {
      this.lineno++;
      this.colno = 0;

      const nextNewlineIndex: number = this.str.indexOf('\n');
      this.currentLine_ = this.str.substring(this.index, (nextNewlineIndex === -1) ? undefined : nextNewlineIndex);
    } else {
      this.colno++;
    }
  }


  backN(n: number): void {
    for (let i: number = 0; i < n; i++) {
      this.back();
    }
  }


  back(): void {
    this.index--;

    if (this.current() === '\n') {
      this.lineno--;

      const previousNewlineIndex: number = this.src.lastIndexOf('\n', this.index - 1);

      this.currentLine_ = this.str.substring(previousNewlineIndex, this.index);
      this.colno = (previousNewlineIndex === -1) ? this.index : this.index - previousNewlineIndex;
    } else {
      this.colno--;
    }
  }


  // current returns current character
  current(): string {
    if (!this.isFinished()) {
      return this.str.charAt(this.index);
    }
    return '';
  }


  // currentStr returns what's left of the unparsed string
  currentStr(): string {
    if (!this.isFinished()) {
      return this.str.substr(this.index);
    }
    return '';
  }


  previous(): string {
    return this.str.charAt(this.index - 1);
  }
}
