export interface FormatInfo {
  rawBits: string;
  unmaskedBits: string;
  eccLevel: string;
  maskPattern: number;

  version: number;
  size: number;

  mode: string;
  modeBits: string;
  characterCount: number;

  dataBits: string;
  decodedText: string;
  decodedBytes: number[];

  errorCorrection?: {
    totalCodewords: number;
    ecCodewordsPerBlock: number;
    numBlocks: number;
  };
}
