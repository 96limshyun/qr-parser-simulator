export function detectTimingPositions(matrix: number[][]) {
  const size = matrix.length;
  const positions: { row: number; col: number; value: number }[] = [];

  for (let col = 8; col <= size - 9; col++) {
    positions.push({
      row: 6,
      col,
      value: matrix[6][col],
    });
  }

  for (let row = 8; row <= size - 9; row++) {
    positions.push({
      row,
      col: 6,
      value: matrix[row][6],
    });
  }

  return positions;
}

export const createTimingMask = (qrMatrix: number[][]) => {
  const size = qrMatrix.length;
  const maskPositions: Array<{ row: number; col: number }> = [];

  for (let col = 8; col <= size - 9; col++) {
    maskPositions.push({ row: 6, col });
  }

  for (let row = 8; row <= size - 9; row++) {
    maskPositions.push({ row, col: 6 });
  }

  return maskPositions;
};
