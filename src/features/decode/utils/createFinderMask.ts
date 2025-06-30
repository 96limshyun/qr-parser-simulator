import { getVersionByMatrixSize } from "./getVersionByMatrixSize";

import { ALIGNMENT_PATTERN_LOCATIONS } from "@/constants/alignmentPattern";
import { FINDER_PATTERN } from "@/constants/finderPattern";

export function detectAlignmentPositions(
  version: number,
  matrixSize: number,
): Array<{ row: number; col: number }> {
  const centers = ALIGNMENT_PATTERN_LOCATIONS[version] || [];
  const positions: Array<{ row: number; col: number }> = [];

  for (const row of centers) {
    for (const col of centers) {
      if (
        (row <= 8 && col <= 8)
        || (row <= 8 && col >= matrixSize - 8)
        || (row >= matrixSize - 8 && col <= 8)
      ) {
        continue;
      }
      positions.push({ row, col });
    }
  }

  return positions;
}

export function detectFinderPositions(
  qrMatrix: number[][],
): Array<{ rowStart: number; colStart: number }> {
  const matrixSize = qrMatrix.length;
  const positions: Array<{ rowStart: number; colStart: number }> = [];

  for (let rowStart = 0; rowStart <= matrixSize - 7; rowStart++) {
    for (let colStart = 0; colStart <= matrixSize - 7; colStart++) {
      let matched = true;
      outer: for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          if (qrMatrix[rowStart + y][colStart + x] !== FINDER_PATTERN[y][x]) {
            matched = false;
            break outer;
          }
        }
      }
      if (matched) positions.push({ rowStart, colStart });
    }
  }
  return positions;
}

export function createFinderMask(qrMatrix: number[][]) {
  const version = getVersionByMatrixSize(qrMatrix.length);
  const finderPositions = detectFinderPositions(qrMatrix);
  const alignmentPositions = detectAlignmentPositions(version!, qrMatrix.length);

  return (rowIndex: number, columnIndex: number) => {
    const inFinder = finderPositions.some(({ rowStart, colStart }) => {
      return (
        rowIndex >= rowStart
        && rowIndex < rowStart + 7
        && columnIndex >= colStart
        && columnIndex < colStart + 7
      );
    });
    if (inFinder) return true;

    const inAlignment = alignmentPositions.some(({ row, col }) => {
      return (
        rowIndex >= row - 2
        && rowIndex <= row + 2
        && columnIndex >= col - 2
        && columnIndex <= col + 2
      );
    });
    return inAlignment;
  };
}
