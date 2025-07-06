export type ModeIndicatorBitsType = "0001" | "0100" | "0010";
export type ErrorCorrectionLevelType =
  | "L (7% 복원)"
  | "M (15% 복원)"
  | "Q (25% 복원)"
  | "H (30% 복원)";
export interface EncodeInfoType {
  text: string;
  mode: "Byte" | "Numeric" | "Alphanumeric";
  length: number;
  modeIndicatorBits: ModeIndicatorBitsType;
  errorCorrectionLevel: ErrorCorrectionLevelType;
  smallestVersion: null | number;
  bitStream: string;
}
