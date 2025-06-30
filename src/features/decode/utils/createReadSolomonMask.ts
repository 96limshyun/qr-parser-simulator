import { getECCInfo } from "./getECCInfo";

import type { FormatInfo } from "../types/formatInfo";

import { createReservedMap } from "@/features/decode/utils/createDataMask";
import { getDataModuleCoordinates } from "@/features/decode/utils/createDataMask";

export const bitsToBytes = (bitsStr: string): number[] => {
  const bytes: number[] = [];
  for (let i = 0; i < bitsStr.length; i += 8) {
    const byteStr = bitsStr.slice(i, i + 8);
    if (byteStr.length < 8) break;
    bytes.push(parseInt(byteStr, 2));
  }
  return bytes;
};

export function parseECCBits(matrix: number[][], formatInfo: FormatInfo): string {
  const eccMaskFn = createReadSolomonMask(matrix, formatInfo);
  let bits = "";

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix.length; col++) {
      if (eccMaskFn(row, col)) {
        bits += matrix[row][col];
      }
    }
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
  return (row: number, col: number) => eccCoords.some((p) => p.row === row && p.col === col);
};
