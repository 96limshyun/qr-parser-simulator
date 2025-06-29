export function detectFormatPositions(matrix: number[][]) {
  const size = matrix.length;

  const coords: [number, number][] = [];

  for (let col = 0; col <= 5; col++) {
    coords.push([8, col]);
  }
  coords.push([8, 7]);
  coords.push([8, 8]);

  for (let row = 0; row <= 5; row++) {
    coords.push([row, 8]);
  }
  coords.push([7, 8]);

  for (let col = size - 1; col >= size - 7; col--) {
    coords.push([8, col]);
  }

  for (let row = size - 1; row >= size - 7; row--) {
    coords.push([row, 8]);
  }

  return coords.map(([row, col]) => ({
    row,
    col,
    value: matrix[row][col],
  }));
}

export const createFormatMask = (matrix: number[][]) => {
  const size = matrix.length;

  const formatCoords = new Set<string>();

  for (let col = 0; col <= 5; col++) {
    formatCoords.add(`8,${col}`);
  }
  formatCoords.add(`8,7`);
  formatCoords.add(`8,8`);

  for (let row = 0; row <= 5; row++) {
    formatCoords.add(`${row},8`);
  }
  formatCoords.add(`7,8`);

  for (let col = size - 1; col >= size - 7; col--) {
    formatCoords.add(`8,${col}`);
  }

  for (let row = size - 1; row >= size - 7; row--) {
    formatCoords.add(`${row},8`);
  }

  return (row: number, col: number) => {
    return formatCoords.has(`${row},${col}`);
  };
};
