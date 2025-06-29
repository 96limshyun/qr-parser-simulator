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

export const createTimingMask = (matrix: number[][]) => {
  const size = matrix.length;
  const timingCoords = new Set<string>();

  for (let col = 8; col <= size - 9; col++) {
    timingCoords.add(`6,${col}`);
  }

  for (let row = 8; row <= size - 9; row++) {
    timingCoords.add(`${row},6`);
  }

  return (row: number, col: number) => {
    return timingCoords.has(`${row},${col}`);
  };
};
