export class SafeString {
  val: string;
  length_: number;

  /** Returns the length of a String object. */
  get length(): number { return this.length_; }
  set length(value: number) { this.length_ = value; }


  constructor(val: string | SafeString) {
    if (val instanceof SafeString) {
      this.val = val.val;
      this.length_ = val.length;
    } else if (typeof val === 'string') {
      this.val = val;
      this.length_ = (val ?? '').length;
    } else {
      throw Error(`Unknown type of val: ${ typeof val }`);
    }
  }


  /** Returns the primitive value of the specified object. */
  valueOf(): string {
    return this.val;
  }


  /** Returns a string representation of a string. */
  toString(): string {
    return this.val;
  }


  /**
   * Returns the character at the specified index.
   * @param pos The zero-based index of the desired character.
   */
  charAt(pos: number): string {
    return this.val?.charAt?.(pos);
  }

  /**
   * Returns the Unicode value of the character at the specified location.
   * @param index The zero-based index of the desired character. If there is no character at the specified index, NaN is returned.
   */
  charCodeAt(index: number): number {
    return this.val?.charCodeAt?.(index);
  }

  /**
   * Returns a string that contains the concatenation of two or more strings.
   * @param strings The strings to append to the end of the string.
   */
  concat(...strings: string[]): string {
    return this.val?.concat?.(... strings);
  }

  /**
   * Returns the position of the first occurrence of a substring.
   * @param searchString The substring to search for in the string
   * @param position The index at which to begin searching the String object. If omitted, search starts at the beginning of the string.
   */
  indexOf(searchString: string, position?: number): number {
    return this.val?.indexOf?.(searchString, position);
  }

  /**
   * Returns the last occurrence of a substring in the string.
   * @param searchString The substring to search for.
   * @param position The index at which to begin searching. If omitted, the search begins at the end of the string.
   */
  lastIndexOf(searchString: string, position?: number): number {
    return this.val?.lastIndexOf?.(searchString, position);
  }

  /**
   * Determines whether two strings are equivalent in the current locale.
   * @param that String to compare to target string
   */
  localeCompare(that: string): number {
    return this.val?.localeCompare?.(that);
  }

  /**
   * Matches a string with a regular expression, and returns an array containing the results of that search.
   * @param regexp A variable name or string literal containing the regular expression pattern and flags.
   */
  match(regexp: string | RegExp): RegExpMatchArray | null {
    return this.val?.match?.(regexp);
  }

  /**
   * Replaces text in a string, using a regular expression or search string.
   * @param searchValue A string to search for.
   * @param replaceValue A string containing the text to replace for every successful match of searchValue in this string.
   */
  replace(searchValue: string | RegExp, replaceValue: string): string;

  /**
   * Replaces text in a string, using a regular expression or search string.
   * @param searchValue A string to search for.
   * @param replacer A function that returns the replacement text.
   */
  replace(searchValue: string | RegExp, replacer: (substring: string, ...args: any[]) => string): string;
  replace(searchValue: string | RegExp, replacer: string | ((substring: string, ...args: any[]) => string)): string {
    return this.val?.replace?.(searchValue, replacer as any);
  }

  /**
   * Finds the first substring match in a regular expression search.
   * @param regexp The regular expression pattern and applicable flags.
   */
  search(regexp: string | RegExp): number {
    return this.val?.search?.(regexp);
  }

  /**
   * Returns a section of a string.
   * @param start The index to the beginning of the specified portion of stringObj.
   * @param end The index to the end of the specified portion of stringObj. The substring includes the characters up to, but not including, the character indicated by end.
   * If this value is not specified, the substring continues to the end of stringObj.
   */
  slice(start?: number, end?: number): string {
    return this.val?.slice?.(start, end);
  }

  /**
   * Split a string into substrings using the specified separator and return them as an array.
   * @param separator A string that identifies character or characters to use in separating the string. If omitted, a single-element array containing the entire string is returned.
   * @param limit A value used to limit the number of elements returned in the array.
   */
  split(separator: string | RegExp, limit?: number): string[] {
    return this.val?.split?.(separator, limit);
  }

  /**
   * Returns the substring at the specified location within a String object.
   * @param start The zero-based index number indicating the beginning of the substring.
   * @param end Zero-based index number indicating the end of the substring. The substring includes the characters up to, but not including, the character indicated by end.
   * If end is omitted, the characters from start through the end of the original string are returned.
   */
  substring(start: number, end?: number): string {
    return this.val?.substring?.(start, end);
  }

  /** Converts all the alphabetic characters in a string to lowercase. */
  toLowerCase(): string {
    return this.val?.toLowerCase?.();
  }

  /** Converts all alphabetic characters to lowercase, taking into account the host environment's current locale. */
  toLocaleLowerCase(locales?: string | string[]): string {
    return this.val?.toLocaleLowerCase?.(locales);
  }

  /** Converts all the alphabetic characters in a string to uppercase. */
  toUpperCase(): string {
    return this.val?.toUpperCase?.();
  }

  /** Returns a string where all alphabetic characters have been converted to uppercase, taking into account the host environment's current locale. */
  toLocaleUpperCase(locales?: string | string[]): string {
    return this.val?.toLocaleUpperCase?.(locales);
  }

  /** Removes the leading and trailing white space and line terminator characters from a string. */
  trim(): string {
    return this.val?.trim?.();
  }


  // IE extensions
  /**
   * Gets a substring beginning at the specified location and having the specified length.
   * @param from The starting position of the desired substring. The index of the first character in the string is zero.
   * @param length The number of characters to include in the returned substring.
   */
  substr(from: number, length?: number): string {
    return this.val?.substr?.(from, length);
  }
}
