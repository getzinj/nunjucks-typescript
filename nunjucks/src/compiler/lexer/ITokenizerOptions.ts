export interface ITokenizerOptions {
  lstripBlocks?: boolean;
  trimBlocks?: boolean;
  tags?: ITags;
}


export interface ITags {
  blockStart?: string;
  blockEnd?: string;
  variableStart?: string;
  variableEnd?: string;
  commentStart?: string;
  commentEnd?: string;
}
