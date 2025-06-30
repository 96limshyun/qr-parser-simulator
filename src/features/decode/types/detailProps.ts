import type { FormatInfo } from "./formatInfo";
import type { Dispatch, SetStateAction } from "react";

export interface DetailProps {
  matrix: number[][];
  color?: string | undefined;
  formatInfo: FormatInfo;
  setFormatInfo: Dispatch<SetStateAction<FormatInfo>>;
}
