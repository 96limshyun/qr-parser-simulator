export interface QRDecodeResult {
  matrix: number[][];
  size: number;
  version: number;

  finderPositions: Array<{ rowStart: number; colStart: number }>;
  alignmentPositions: Array<{ row: number; col: number }>;

  formatPositions: Array<{ row: number; col: number; value: number }>;
  rawFormatBits: string;
  unmaskedFormatBits: string;
  eccLevel: string;
  maskPattern: number;

  timingPositions: Array<{ row: number; col: number; value: number }>;

  dataPositions: Array<{ row: number; col: number }>;
  maskedDataBits: string;
  unmaskedDataBits: string;
  mode: string;
  modeBits: string;
  characterCount: number;
  decodedText: string;

  eccCorrected: number[];
  eccErrorCount: number;

  totalDataCodewords?: number;
  totalECCCodewords?: number;
  totalCodewords?: number;
  dataBits?: string;
  dataCodewords?: number[];
  eccBytes?: number[];
  correctedDataCodewords?: number[];
  correctedECCCodewords?: number[];
  correctionSuccess?: boolean;
}
