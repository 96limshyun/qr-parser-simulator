import { ALIGNMENT_PATTERN_LOCATIONS } from "@/constants/alignmentPattern";
import { FINDER_PATTERN } from "@/constants/finderPattern";

export class QRDecoder {
  getVersionByMatrixSize(matrixSize: number) {
    const version = (matrixSize - 21) / 4 + 1;
    return version;
  }
  detectFinderPositions(matrix: number[][]) {
    const positions: { row: number; col: number }[] = [];

    for (let rowStart = 0; rowStart <= matrix.length - 7; rowStart++) {
      for (let colStart = 0; colStart <= matrix.length - 7; colStart++) {
        let matched = true;
        outer: for (let y = 0; y < 7; y++) {
          for (let x = 0; x < 7; x++) {
            if (matrix[rowStart + y][colStart + x] !== FINDER_PATTERN[y][x]) {
              matched = false;
              break outer;
            }
          }
        }
        if (matched) positions.push({ row: rowStart, col: colStart });
      }
    }
    return positions;
  }

  detectAlignmentPositions(matrix: number[][]) {
    const version = this.getVersionByMatrixSize(matrix.length);
    const centers = ALIGNMENT_PATTERN_LOCATIONS[version] || [];
    const positions = [];

    for (const row of centers) {
      for (const col of centers) {
        if (
          (row <= 8 && col <= 8)
          || (row <= 8 && col >= matrix.length - 8)
          || (row >= matrix.length - 8 && col <= 8)
        ) {
          continue;
        }
        positions.push({ row, col });
      }
    }
    return positions;
  }

  detectTimingPositions(matrix: number[][]) {
    const positions = [];

    for (let col = 8; col <= matrix.length - 9; col++) {
      positions.push({
        row: 6,
        col,
        value: matrix[6][col],
      });
    }

    for (let row = 8; row <= matrix.length - 9; row++) {
      positions.push({
        row,
        col: 6,
        value: matrix[row][6],
      });
    }

    return positions;
  }

  detectFormatPositions(matrix: number[][]) {
    const positions = [];

    for (let col = 0; col <= 5; col++) {
      positions.push([8, col]);
    }

    positions.push([8, 7], [8, 8]);
    positions.push([7, 8]);

    for (let row = 5; row >= 0; row--) {
      positions.push([row, 8]);
    }

    for (let row = matrix.length - 1; row >= matrix.length - 7; row--) {
      positions.push([row, 8]);
    }

    for (let col = matrix.length - 8; col <= matrix.length - 1; col++) {
      positions.push([8, col]);
    }

    return positions.map(([row, col]) => ({
      row,
      col,
      value: matrix[row][col],
    }));
  }

  detectSeparatorPositions(matrix: number[][]) {
    const positions: { row: number; col: number }[] = [];

    for (let col = 0; col <= 7; col++) {
      positions.push({ row: 7, col });
    }
    for (let row = 6; row >= 0; row--) {
      positions.push({ row, col: 7 });
    }

    for (let col = matrix.length - 8; col <= matrix.length - 1; col++) {
      positions.push({ row: 7, col });
    }
    for (let row = 6; row >= 0; row--) {
      positions.push({ row, col: matrix.length - 8 });
    }

    for (let col = 0; col <= 7; col++) {
      positions.push({ row: matrix.length - 8, col });
    }
    for (let row = matrix.length - 7; row <= matrix.length - 1; row++) {
      positions.push({ row, col: 7 });
    }

    return positions;
  }

  detectDarkModulePosition(matrix: number[][]) {
    const version = this.getVersionByMatrixSize(matrix.length);
    const darkModuleRow = 4 * version + 9;
    const darkModuleCol = 8;

    return {
      row: darkModuleRow,
      col: darkModuleCol,
      value: matrix[darkModuleRow][darkModuleCol],
    };
  }

  detectDataPositions(matrix: number[][]) {
    const positions = [];

    let col = matrix.length - 1;
    let upwards = true;

    while (col > 0) {
      if (col === 6) col--;

      const right = col;
      const left = col - 1;

      if (upwards) {
        for (let row = matrix.length - 1; row >= 0; row--) {
          for (const c of [right, left]) {
            if (!this.isReserved(row, c, matrix))
              positions.push({ row, col: c, value: matrix[row][c] });
          }
        }
      } else {
        for (let row = 0; row < matrix.length; row++) {
          for (const c of [right, left]) {
            if (!this.isReserved(row, c, matrix))
              positions.push({ row, col: c, value: matrix[row][c] });
          }
        }
      }

      col -= 2;
      if (col === 6) col--;
      upwards = !upwards;
    }

    return positions;
  }

  isReserved(row: number, col: number, matrix: number[][]) {
    const finderPositions = this.detectFinderPositions(matrix);
    const inFinder = finderPositions.some(({ row: finderRow, col: finderCol }) => {
      return row >= finderRow && row < finderRow + 7 && col >= finderCol && col < finderCol + 7;
    });
    if (inFinder) return true;

    const alignmentPositions = this.detectAlignmentPositions(matrix);
    const inAlignment = alignmentPositions.some(({ row: alignRow, col: alignCol }) => {
      return (
        row >= alignRow - 2 && row <= alignRow + 2 && col >= alignCol - 2 && col <= alignCol + 2
      );
    });
    if (inAlignment) return true;

    const timingPositions = this.detectTimingPositions(matrix);
    const inTiming = timingPositions.some(({ row: timingRow, col: timingCol }) => {
      return row === timingRow && col === timingCol;
    });
    if (inTiming) return true;

    const separatorPositions = this.detectSeparatorPositions(matrix);
    const inSeparator = separatorPositions.some(({ row: separatorRow, col: separatorCol }) => {
      return row === separatorRow && col === separatorCol;
    });
    if (inSeparator) return true;

    const formatPositions = this.detectFormatPositions(matrix);
    const inFormat = formatPositions.some(({ row: formatRow, col: formatCol }) => {
      return row === formatRow && col === formatCol;
    });
    if (inFormat) return true;

    const darkModule = this.detectDarkModulePosition(matrix);
    const inDarkModule = darkModule.row === row && darkModule.col === col;
    if (inDarkModule) return true;

    return false;
  }
}
