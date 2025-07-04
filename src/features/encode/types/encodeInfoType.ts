export type ModeIndicatorBitsType = "0001" | "0100" | "0010";

export interface EncodeInfoType {
  mode: "Byte" | "Numeric" | "Alphanumeric";
  length: number;
  modeIndicatorBits: ModeIndicatorBitsType;
}
