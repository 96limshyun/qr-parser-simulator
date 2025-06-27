import { FINDER_PATTERN } from "@/constants/finderPattern";

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
  const finderPositions = detectFinderPositions(qrMatrix);

  return (rowIndex: number, columnIndex: number) => {
    return finderPositions.some(({ rowStart, colStart }) => {
      const insideRow = rowIndex >= rowStart && rowIndex < rowStart + 7;
      const insideCol = columnIndex >= colStart && columnIndex < colStart + 7;
      return insideRow && insideCol;
    });
  };
}
