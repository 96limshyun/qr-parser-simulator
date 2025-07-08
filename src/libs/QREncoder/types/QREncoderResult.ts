export interface QREncoderResult {
  text: string;
  mode: string;
  modeIndicatorBits: string;
  length: number;
  errorCorrectionLevel: string;
  bitStream: string;
  smallestVersion: number;
  dataCodewords: number[];
  eccCodewords: number[];
  finalCodewords: number[];
  finalBits: string;
  basePattern: { row: number; col: number }[];
  maskedMatrixPositions: { row: number; col: number; value: number }[];
  maskNumber: number;
  formatPosition: { row: number; col: number }[];
}
