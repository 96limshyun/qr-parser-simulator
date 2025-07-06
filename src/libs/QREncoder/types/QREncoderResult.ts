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
}
