export function getVersionByMatrixSize(matrixSize: number): number | undefined {
  if ((matrixSize - 21) % 4 !== 0) {
    return undefined;
  }

  const version = (matrixSize - 21) / 4 + 1;

  if (version < 1 || version > 40) {
    return undefined;
  }

  return version;
}
