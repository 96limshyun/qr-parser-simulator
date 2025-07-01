export const detectFormatPositionsTopLeft = (matrix: number[][]) => {
  const coords: [number, number][] = [];

  for (let col = 0; col <= 5; col++) coords.push([8, col]);
  coords.push([8, 7], [8, 8]);
  coords.push([7, 8]);
  for (let row = 5; row >= 0; row--) coords.push([row, 8]);

  return coords.map(([row, col]) => ({
    row,
    col,
    value: matrix[row][col],
  }));
};

export const createFormatMask = (matrix: number[][]) => {
  const size = matrix.length;
  const maskPositions: Array<{ row: number; col: number }> = [];

  for (let col = 0; col <= 5; col++) maskPositions.push({ row: 8, col });
  maskPositions.push({ row: 8, col: 7 });
  maskPositions.push({ row: 8, col: 8 });
  for (let row = 0; row <= 5; row++) maskPositions.push({ row, col: 8 });
  maskPositions.push({ row: 7, col: 8 });
  for (let col = size - 1; col >= size - 8; col--) maskPositions.push({ row: 8, col });
  for (let row = size - 1; row >= size - 8; row--) maskPositions.push({ row, col: 8 });

  return maskPositions;
};
