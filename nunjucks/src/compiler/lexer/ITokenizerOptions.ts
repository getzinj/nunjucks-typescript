export interface ITokenizerOptions {
  lstripBlocks?: boolean;
  trimBlocks?: boolean;
  tags?: {
    blockStart?: string;
    blockEnd?: string;
    variableStart?: string;
    variableEnd?: string;
    commentStart?: string;
    commentEnd?: string;
  };
}
