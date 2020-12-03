export class SafeString extends String {
  val: string;
  length_: number;

  get length(): number { return this.length_; }
  set length(value: number) { this.length_ = value; }


  constructor(val: string | SafeString) {
    super(val);
    if (typeof val === 'string') {
      this.val = val;
      this.length_ = (val ?? '').length;
    } else if (val instanceof SafeString) {
      this.val = val.val;
      this.length_ = val.length;
    } else {
      throw Error(`Unknown type of val: ${ typeof val }`);
    }
  }


  valueOf(): string {
    return this.val;
  }


  toString(): string {
    return this.val;
  }
}
