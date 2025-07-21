import { MaskPatternSelector } from "./MaskPatternSelector";

import { ALIGNMENT_PATTERN_LOCATIONS } from "@/constants/alignmentPattern";
import { FINDER_PATTERN } from "@/constants/finderPattern";
import { FORMAT_INFORMATION_STRINGS } from "@/constants/formatMask";

export class QRMatrixBuilder {
  private version: number;
  private errorCorrectionLevel: string;
  private matrixSize: number;

  constructor(version: number, errorCorrectionLevel: string) {
    this.version = version;
    this.errorCorrectionLevel = errorCorrectionLevel;
    this.matrixSize = version * 4 + 17;
  }

  findFinderPattern(): { row: number; col: number }[] {
    const finderPatterns = [
      { row: 0, col: 0 },
      { row: 0, col: this.matrixSize - 7 },
      { row: this.matrixSize - 7, col: 0 },
    ];

    const coordinates: { row: number; col: number }[] = [];

    finderPatterns.forEach((pattern) => {
      const { row, col } = pattern;

      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          const pixelRow = row + i;
          const pixelCol = col + j;

          if (FINDER_PATTERN[i][j] === 1) {
            coordinates.push({ row: pixelRow, col: pixelCol });
          }
        }
      }
    });

    return coordinates;
  }

  findTimingPattern(): { row: number; col: number }[] {
    const coordinates: { row: number; col: number }[] = [];

    for (let col = 8; col < this.matrixSize - 8; col++) {
      if ((col - 8) % 2 === 0) {
        coordinates.push({ row: 6, col });
      }
    }

    for (let row = 8; row < this.matrixSize - 8; row++) {
      if ((row - 8) % 2 === 0) {
        coordinates.push({ row, col: 6 });
      }
    }

    return coordinates;
  }

  findSeparators(): { row: number; col: number }[] {
    const coordinates: { row: number; col: number }[] = [];

    for (let row = 0; row < 8; row++) {
      coordinates.push({ row, col: 7 });
    }
    for (let col = 0; col < 8; col++) {
      coordinates.push({ row: 7, col });
    }

    for (let row = 0; row < 8; row++) {
      coordinates.push({ row, col: this.matrixSize - 8 });
    }
    for (let col = this.matrixSize - 8; col < this.matrixSize; col++) {
      coordinates.push({ row: 7, col });
    }

    for (let row = this.matrixSize - 8; row < this.matrixSize; row++) {
      coordinates.push({ row, col: 7 });
    }
    for (let col = 0; col < 8; col++) {
      coordinates.push({ row: this.matrixSize - 8, col });
    }

    return coordinates;
  }

  findDarkModule(): { row: number; col: number }[] {
    const darkModuleRow = 4 * this.version + 9;
    return [{ row: darkModuleRow, col: 8 }];
  }

  findAlignmentPattern(): { row: number; col: number }[] {
    const coordinates: { row: number; col: number }[] = [];

    if (this.version < 2) return coordinates;

    const alignmentPositions = this.getAlignmentPositions();

    alignmentPositions.forEach(({ row, col }) => {
      if (!this.isOverlappingFinderPattern(row, col)) {
        for (let i = -2; i <= 2; i++) {
          for (let j = -2; j <= 2; j++) {
            const pixelRow = row + i;
            const pixelCol = col + j;

            if (
              pixelRow >= 0
              && pixelRow < this.matrixSize
              && pixelCol >= 0
              && pixelCol < this.matrixSize
            ) {
              if (this.isAlignmentPatternPixel(i, j)) {
                coordinates.push({ row: pixelRow, col: pixelCol });
              }
            }
          }
        }
      }
    });

    return coordinates;
  }

  private getAlignmentPositions(): { row: number; col: number }[] {
    const positions: { row: number; col: number }[] = [];
    const alignmentLocations = ALIGNMENT_PATTERN_LOCATIONS[this.version] || [];

    for (let i = 0; i < alignmentLocations.length; i++) {
      for (let j = 0; j < alignmentLocations.length; j++) {
        const row = alignmentLocations[i];
        const col = alignmentLocations[j];

        if (!this.isOverlappingFinderPattern(row, col)) {
          positions.push({ row, col });
        }
      }
    }

    return positions;
  }

  private isOverlappingFinderPattern(row: number, col: number): boolean {
    const finderAreas = [
      { row: 0, col: 0, width: 7, height: 7 },
      { row: 0, col: this.matrixSize - 7, width: 7, height: 7 },
      { row: this.matrixSize - 7, col: 0, width: 7, height: 7 },
    ];

    return finderAreas.some(
      (area) =>
        row >= area.row - 2
        && row <= area.row + area.height + 1
        && col >= area.col - 2
        && col <= area.col + area.width + 1,
    );
  }

  private isAlignmentPatternPixel(row: number, col: number): boolean {
    const pattern = [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ];
    return pattern[row + 2][col + 2] === 1;
  }

  findFormatInformationWithMask(maskNumber: number): { row: number; col: number }[] {
    const coordinates: { row: number; col: number }[] = [];
    const ecLevel = this.errorCorrectionLevel.split(" ")[0];

    const formatInformation =
      FORMAT_INFORMATION_STRINGS[ecLevel as keyof typeof FORMAT_INFORMATION_STRINGS][
        maskNumber as keyof (typeof FORMAT_INFORMATION_STRINGS)[keyof typeof FORMAT_INFORMATION_STRINGS]
      ];

    const leftTopPositions = this.getFormatInformationPositions();
    leftTopPositions.forEach((pos, index) => {
      if (index < 15 && ((formatInformation >> (14 - index)) & 1) === 1) {
        coordinates.push(pos);
      }
    });

    const rightBottomPositions = this.getRightBottomFormatPositions();
    rightBottomPositions.forEach((pos, index) => {
      if (index < 15 && ((formatInformation >> (14 - index)) & 1) === 1) {
        coordinates.push(pos);
      }
    });

    return coordinates;
  }

  private getFormatInformationPositions(): { row: number; col: number }[] {
    const positions: { row: number; col: number }[] = [];

    for (let col = 0; col <= 5; col++) {
      positions.push({ row: 8, col });
    }
    positions.push({ row: 8, col: 7 }, { row: 8, col: 8 });
    positions.push({ row: 7, col: 8 });

    for (let row = 5; row >= 0; row--) {
      positions.push({ row, col: 8 });
    }

    return positions;
  }

  // Format Information 위치 (우하단)
  private getRightBottomFormatPositions(): { row: number; col: number }[] {
    const positions: { row: number; col: number }[] = [];

    for (let row = this.matrixSize - 1; row >= this.matrixSize - 7; row--) {
      positions.push({ row, col: 8 });
    }
    for (let col = this.matrixSize - 8; col <= this.matrixSize - 1; col++) {
      positions.push({ row: 8, col });
    }

    return positions;
  }

  findDataModules(bitStream: string, finalBits: string): { row: number; col: number }[] {
    const coordinates: { row: number; col: number }[] = [];
    const fullBitStream = bitStream + finalBits;
    const dataPositions = this.getDataModulePositions();

    dataPositions.forEach((pos, index) => {
      if (index < fullBitStream.length && fullBitStream[index] === "1") {
        coordinates.push({ row: pos.row, col: pos.col });
      }
    });

    return coordinates;
  }

  private getDataModulePositions(): { row: number; col: number }[] {
    const positions: { row: number; col: number }[] = [];

    let col = this.matrixSize - 1;
    let upwards = true;

    while (col > 0) {
      if (col === 6) col--;

      const right = col;
      const left = col - 1;

      if (upwards) {
        for (let row = this.matrixSize - 1; row >= 0; row--) {
          for (const c of [right, left]) {
            const rowPos = row;
            const colPos = c;

            if (this.isInFinderPatternArea(rowPos, colPos)) continue;
            if (rowPos === 6 || colPos === 6) continue;
            if (this.isInFormatInformationArea(rowPos, colPos)) continue;
            if (this.isInAlignmentPatternArea(rowPos, colPos)) continue;
            if (this.isInSeparatorArea(rowPos, colPos)) continue;
            if (this.isInDarkModuleArea(rowPos, colPos)) continue;

            positions.push({ row: rowPos, col: colPos });
          }
        }
      } else {
        for (let row = 0; row < this.matrixSize; row++) {
          for (const c of [right, left]) {
            const rowPos = row;
            const colPos = c;

            if (this.isInFinderPatternArea(rowPos, colPos)) continue;
            if (rowPos === 6 || colPos === 6) continue;
            if (this.isInFormatInformationArea(rowPos, colPos)) continue;
            if (this.isInAlignmentPatternArea(rowPos, colPos)) continue;
            if (this.isInSeparatorArea(rowPos, colPos)) continue;
            if (this.isInDarkModuleArea(rowPos, colPos)) continue;

            positions.push({ row: rowPos, col: colPos });
          }
        }
      }

      col -= 2;
      if (col === 6) col--;
      upwards = !upwards;
    }

    return positions;
  }

  private isInFinderPatternArea(row: number, col: number): boolean {
    return this.isOverlappingFinderPattern(row, col);
  }

  private isInFormatInformationArea(row: number, col: number): boolean {
    if (row === 8 && col < 8) return true;
    if (row === 8 && col >= this.matrixSize - 8) return true;
    if (col === 8 && row < 8) return true;
    if (col === 8 && row >= this.matrixSize - 8) return true;
    return false;
  }

  private isInAlignmentPatternArea(row: number, col: number): boolean {
    const alignmentPositions = this.getAlignmentPositions();

    return alignmentPositions.some((pos) => {
      const centerRow = pos.row;
      const centerCol = pos.col;

      return (
        row >= centerRow - 2 && row <= centerRow + 2 && col >= centerCol - 2 && col <= centerCol + 2
      );
    });
  }

  private isInSeparatorArea(row: number, col: number): boolean {
    if (col === 7 && row < 8) return true;
    if (row === 7 && col < 8) return true;

    if (col === this.matrixSize - 8 && row < 8) return true;
    if (row === 7 && col >= this.matrixSize - 8) return true;

    if (col === 7 && row >= this.matrixSize - 8) return true;
    if (row === this.matrixSize - 8 && col < 8) return true;

    return false;
  }

  private isInDarkModuleArea(row: number, col: number): boolean {
    const darkModuleRow = 4 * this.version + 9;
    return col === 8 && row === darkModuleRow;
  }

  applyMaskPattern(basePattern: { row: number; col: number }[]) {
    const dataEccPositions = this.getDataModulePositions();
    const maskSelector = new MaskPatternSelector(this.matrixSize);
    const { maskedMatrix, maskNumber } = maskSelector.findBestMaskPattern(
      dataEccPositions,
      basePattern,
    );

    const maskedMatrixPositions = maskedMatrix
      .map((row, rowIndex) =>
        row.map((value, colIndex) => ({ row: rowIndex, col: colIndex, value: value ? 1 : 0 })),
      )
      .flat();

    const formatPosition = this.findFormatInformationWithMask(maskNumber);

    return {
      maskedMatrixPositions,
      maskNumber,
      formatPosition,
    };
  }
}
