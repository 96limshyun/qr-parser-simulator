import type { ECBlockInfo, ECLevel } from "@/types/ECCTable";

export const ECC_TABLE: {
  [version: number]: {
    [_LEVEL in ECLevel]: ECBlockInfo;
  };
} = {
  1: {
    L: {
      totalDataCodewords: 19,
      ecCodewordsPerBlock: 7,
      numBlocksGroup1: 1,
      dataCodewordsGroup1: 19,
      numBlocksGroup2: 0,
      dataCodewordsGroup2: 0,
    },
    M: {
      totalDataCodewords: 16,
      ecCodewordsPerBlock: 10,
      numBlocksGroup1: 1,
      dataCodewordsGroup1: 16,
      numBlocksGroup2: 0,
      dataCodewordsGroup2: 0,
    },
    Q: {
      totalDataCodewords: 13,
      ecCodewordsPerBlock: 13,
      numBlocksGroup1: 1,
      dataCodewordsGroup1: 13,
      numBlocksGroup2: 0,
      dataCodewordsGroup2: 0,
    },
    H: {
      totalDataCodewords: 9,
      ecCodewordsPerBlock: 17,
      numBlocksGroup1: 1,
      dataCodewordsGroup1: 9,
      numBlocksGroup2: 0,
      dataCodewordsGroup2: 0,
    },
  },
  2: {
    L: {
      totalDataCodewords: 34,
      ecCodewordsPerBlock: 10,
      numBlocksGroup1: 1,
      dataCodewordsGroup1: 34,
      numBlocksGroup2: 0,
      dataCodewordsGroup2: 0,
    },
    M: {
      totalDataCodewords: 28,
      ecCodewordsPerBlock: 16,
      numBlocksGroup1: 1,
      dataCodewordsGroup1: 28,
      numBlocksGroup2: 0,
      dataCodewordsGroup2: 0,
    },
    Q: {
      totalDataCodewords: 22,
      ecCodewordsPerBlock: 22,
      numBlocksGroup1: 1,
      dataCodewordsGroup1: 22,
      numBlocksGroup2: 0,
      dataCodewordsGroup2: 0,
    },
    H: {
      totalDataCodewords: 16,
      ecCodewordsPerBlock: 28,
      numBlocksGroup1: 1,
      dataCodewordsGroup1: 16,
      numBlocksGroup2: 0,
      dataCodewordsGroup2: 0,
    },
  },
};
