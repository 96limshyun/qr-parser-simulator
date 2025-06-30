import { createFinderMask } from "@/features/decode/utils/createFinderMask";
import { createFormatMask } from "@/features/decode/utils/createFormatMask";
import { createTimingMask } from "@/features/decode/utils/createTimingMask";
import { getVersionByMatrixSize } from "@/features/decode/utils/getVersionByMatrixSize";

function isSeparator(r: number, c: number, size: number) {
  if (r === 7 && c <= 7) return true;
  if (c === 7 && r <= 7) return true;

  if (r === 7 && c >= size - 8) return true;
  if (c === size - 8 && r <= 7) return true;

  if (r === size - 8 && c <= 7) return true;
  if (c === 7 && r >= size - 8) return true;
  return false;
}

function isVersionInfo(row: number, col: number, size: number, version: number): boolean {
  if (version < 7) return false;
  if (row <= 5 && col >= size - 11 && col <= size - 9) return true;
  if (row >= size - 11 && row <= size - 9 && col <= 5) return true;
  return false;
}

function isDarkModule(row: number, col: number, version: number): boolean {
  if (version < 1) return false;
  return row === 4 * version + 9 && col === 8;
}

export function createReservedMap(matrix: number[][]) {
  const size = matrix.length;
  const version = getVersionByMatrixSize(size)!;

  const isTiming = createTimingMask(matrix);
  const isFormat = createFormatMask(matrix);
  const isFinderOrAlignment = createFinderMask(matrix);

  const reservedMap: boolean[][] = [];

  for (let row = 0; row < size; row++) {
    reservedMap[row] = [];
    for (let col = 0; col < size; col++) {
      const reserved =
        isTiming(row, col)
        || isFormat(row, col)
        || isFinderOrAlignment(row, col)
        || isSeparator(row, col, size)
        || isDarkModule(row, col, version)
        || isVersionInfo(row, col, size, version);
      reservedMap[row][col] = reserved;
    }
  }
  return reservedMap;
}

export function getDataModuleCoordinates(matrix: number[][], reservedMap: boolean[][]) {
  const size = matrix.length;
  const coords: { row: number; col: number }[] = [];

  let col = size - 1;
  let upwards = true;

  while (col > 0) {
    if (col === 6) col--;

    const right = col;
    const left = col - 1;

    if (upwards) {
      for (let row = size - 1; row >= 0; row--) {
        for (const c of [right, left]) {
          if (!reservedMap[row][c]) coords.push({ row, col: c });
        }
      }
    } else {
      for (let row = 0; row < size; row++) {
        for (const c of [right, left]) {
          if (!reservedMap[row][c]) coords.push({ row, col: c });
        }
      }
    }
    col -= 2;
    upwards = !upwards;
  }
  return coords;
}

function getMaskBit(row: number, col: number, pattern: number) {
  switch (pattern) {
    case 0:
      return (row + col) % 2 === 0 ? 1 : 0;
    case 1:
      return row % 2 === 0 ? 1 : 0;
    case 2:
      return col % 3 === 0 ? 1 : 0;
    case 3:
      return (row + col) % 3 === 0 ? 1 : 0;
    case 4:
      return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0 ? 1 : 0;
    case 5:
      return ((row * col) % 2) + ((row * col) % 3) === 0 ? 1 : 0;
    case 6:
      return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0 ? 1 : 0;
    case 7:
      return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0 ? 1 : 0;
    default:
      throw new Error("Invalid mask pattern");
  }
}

export function unmaskDataMatrix(matrix: number[][], maskPattern: number) {
  const reservedMap = createReservedMap(matrix);
  return matrix.map((row, r) =>
    row.map((bit, c) => (reservedMap[r][c] ? bit : bit ^ getMaskBit(r, c, maskPattern))),
  );
}

export function parseDataBits(maskedMatrix: number[][], maskPattern: number): string {
  const unmasked = unmaskDataMatrix(maskedMatrix, maskPattern);
  const reservedMap = createReservedMap(unmasked);
  const coords = getDataModuleCoordinates(unmasked, reservedMap);

  return coords.map(({ row, col }) => unmasked[row][col]).join("");
}

export function createDataMask(qrMatrix: number[][]) {
  const reservedMap = createReservedMap(qrMatrix);
  const dataModules = getDataModuleCoordinates(qrMatrix, reservedMap);

  return (row: number, col: number) => dataModules.some((p) => p.row === row && p.col === col);
}
