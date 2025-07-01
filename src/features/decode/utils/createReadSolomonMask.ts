import { getECCInfo } from "./getECCInfo";

import type { FormatInfo } from "../types/formatInfo";

import { createReservedMap } from "@/features/decode/utils/createDataMask";
import { getDataModuleCoordinates } from "@/features/decode/utils/createDataMask";

export function parseECCBits(matrix: number[][], formatInfo: FormatInfo): string {
  const eccCoords = createReadSolomonMask(matrix, formatInfo);

  if (!Array.isArray(eccCoords) || eccCoords.length === 0) {
    return "";
  }

  let bits = "";
  for (const { row, col } of eccCoords) {
    bits += matrix[row][col];
  }
  return bits;
}

export const createReadSolomonMask = (matrix: number[][], formatInfo: FormatInfo) => {
  const reservedMap = createReservedMap(matrix);
  const dataCoords = getDataModuleCoordinates(matrix, reservedMap);
  const eccLevel = formatInfo.eccLevel.split(" ")[0];
  const eccInfo = getECCInfo(formatInfo.version, eccLevel as "L" | "M" | "Q" | "H");

  if (!eccInfo) {
    console.error(
      `ECC info not found for version ${formatInfo.version} / level ${formatInfo.eccLevel}`,
    );
    return () => false;
  }

  const eccStartBit = eccInfo.totalDataCodewords * 8;
  const eccCoords = dataCoords.slice(eccStartBit);

  return eccCoords;
};
