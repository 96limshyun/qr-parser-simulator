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

  const size = qrMatrix.length;
  const maskPositions: Array<{ row: number; col: number }> = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const inFinder = finderPositions.some(({ rowStart, colStart }) => {
        return row >= rowStart && row < rowStart + 7 && col >= colStart && col < colStart + 7;
      });

      if (inFinder) {
        maskPositions.push({ row, col });
        continue;
      }

      const inAlignment = alignmentPositions.some(({ row: alignRow, col: alignCol }) => {
        return (
          row >= alignRow - 2 && row <= alignRow + 2 && col >= alignCol - 2 && col <= alignCol + 2
        );
      });

      if (inAlignment) {
        maskPositions.push({ row, col });
      }
    }
  }

  return maskPositions;
}
