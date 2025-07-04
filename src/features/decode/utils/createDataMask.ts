import { ALPHANUMERIC_TABLE } from "@/constants/alphanumericTable";
import { createFinderMask } from "@/features/decode/utils/createFinderMask";
import { createFormatMask } from "@/features/decode/utils/createFormatMask";
import { createTimingMask } from "@/features/decode/utils/createTimingMask";
import { getVersionByMatrixSize } from "@/features/decode/utils/getVersionByMatrixSize";

export const decodeAlphanumeric = (dataBits: string, characterCount: number) => {
  let pointer = 0;
  let result = "";

  while (characterCount >= 2) {
    const bits11 = dataBits.slice(pointer, pointer + 11);
    if (bits11.length < 11) break;

    const value = parseInt(bits11, 2);
    const firstCharIndex = Math.floor(value / 45);
    const secondCharIndex = value % 45;

    result += ALPHANUMERIC_TABLE[firstCharIndex];
    result += ALPHANUMERIC_TABLE[secondCharIndex];

    pointer += 11;
    characterCount -= 2;
  }

  if (characterCount === 1) {
    const bits6 = dataBits.slice(pointer, pointer + 6);
    const value = parseInt(bits6, 2);
    result += ALPHANUMERIC_TABLE[value];
  }

  return result;
};

const isSeparator = (r: number, c: number, size: number) => {
  if (r === 7 && c <= 7) return true;
  if (c === 7 && r <= 7) return true;

  if (r === 7 && c >= size - 8) return true;
  if (c === size - 8 && r <= 7) return true;

  if (r === size - 8 && c <= 7) return true;
  if (c === 7 && r >= size - 8) return true;
  return false;
};

const isVersionInfo = (row: number, col: number, size: number, version: number): boolean => {
  if (version < 7) return false;
  if (row <= 5 && col >= size - 11 && col <= size - 9) return true;
  if (row >= size - 11 && row <= size - 9 && col <= 5) return true;
  return false;
};

const isDarkModule = (row: number, col: number, version: number): boolean => {
  if (version < 1) return false;
  return row === 4 * version + 9 && col === 8;
};

export const createReservedMap = (matrix: number[][]) => {
  const size = matrix.length;
  const version = getVersionByMatrixSize(size)!;

  const timingMask = createTimingMask(matrix);
  const formatMask = createFormatMask(matrix);
  const finderOrAlignmentMask = createFinderMask(matrix);

  const isTiming = (row: number, col: number) =>
    timingMask.some((pos) => pos.row === row && pos.col === col);

  const isFormat = (row: number, col: number) =>
    formatMask.some((pos) => pos.row === row && pos.col === col);

  const isFinderOrAlignment = (row: number, col: number) =>
    finderOrAlignmentMask.some((pos) => pos.row === row && pos.col === col);

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
};

export const getDataModuleCoordinates = (matrix: number[][], reservedMap: boolean[][]) => {
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
    if (col === 6) col--;
    upwards = !upwards;
  }
  return coords;
};

export const DATA_MASKS = [
  (p: { row: number; col: number }) => (p.row + p.col) % 2 === 0,
  (p: { row: number; col: number }) => p.row % 2 === 0,
  (p: { row: number; col: number }) => p.col % 3 === 0,
  (p: { row: number; col: number }) => (p.row + p.col) % 3 === 0,
  (p: { row: number; col: number }) => (Math.floor(p.row / 2) + Math.floor(p.col / 3)) % 2 === 0,
  (p: { row: number; col: number }) => ((p.col * p.row) % 2) + ((p.col * p.row) % 3) === 0,
  (p: { row: number; col: number }) => (((p.row * p.col) % 2) + ((p.row * p.col) % 3)) % 2 === 0,
  (p: { row: number; col: number }) => (((p.row + p.col) % 2) + ((p.row * p.col) % 3)) % 2 === 0,
];

export const createDataMask = (qrMatrix: number[][]) => {
  const reservedMap = createReservedMap(qrMatrix);
  const dataModules = getDataModuleCoordinates(qrMatrix, reservedMap);

  return dataModules;
};
