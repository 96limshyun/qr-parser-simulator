export type ECLevel = "L" | "M" | "Q" | "H";

export interface ECBlockInfo {
  totalDataCodewords: number;
  ecCodewordsPerBlock: number;
  numBlocksGroup1: number;
  dataCodewordsGroup1: number;
  numBlocksGroup2: number;
  dataCodewordsGroup2: number;
}
