import GenericGF from "@zxing/library/esm/core/common/reedsolomon/GenericGF";
import ReedSolomonDecoder from "@zxing/library/esm/core/common/reedsolomon/ReedSolomonDecoder";

import type { ECLevel } from "@/types/ECCTable";

import { ALIGNMENT_PATTERN_LOCATIONS } from "@/constants/alignmentPattern";
import { ALPHANUMERIC_TABLE } from "@/constants/alphanumericTable";
import { CHARACTER_COUNT_BITS_MAP } from "@/constants/characterCountBitsMap";
import { ECC_MAP } from "@/constants/eccMap";
import { ECC_TABLE } from "@/constants/eccTable";
import { FINDER_PATTERN } from "@/constants/finderPattern";
import { MASK_PATTERN } from "@/constants/formatMask";
import { DATA_MASK_PATTERNS } from "@/constants/maskPatterns";
import { MODE_MAP } from "@/constants/modeMap";

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

    const version = this.getVersionByMatrixSize(matrix.length);
    const eccLevel = this.getECLevel(this.getMaskedFormatBits(matrix));
    const eccInfo = ECC_TABLE[version]?.[eccLevel as ECLevel];
    const totalDataCodewords = eccInfo?.totalDataCodewords ?? 0;
    const maxDataBits = totalDataCodewords * 8;

    let col = matrix.length - 1;
    let upwards = true;

    while (col > 0) {
      if (col === 6) col--;

      const right = col;
      const left = col - 1;

      if (upwards) {
        for (let row = matrix.length - 1; row >= 0; row--) {
          for (const c of [right, left]) {
            if (!this.isReserved(row, c, matrix)) {
              if (positions.length < maxDataBits) {
                positions.push({ row, col: c, value: matrix[row][c] });
              }
            }
          }
        }
      } else {
        for (let row = 0; row < matrix.length; row++) {
          for (const c of [right, left]) {
            if (!this.isReserved(row, c, matrix)) {
              if (positions.length < maxDataBits) {
                positions.push({ row, col: c, value: matrix[row][c] });
              }
            }
          }
        }
      }

      col -= 2;
      if (col === 6) col--;
      upwards = !upwards;
    }

    return positions;
  }

  detectECCPositions(matrix: number[][]) {
    const dataPositions = this.detectDataPositions(matrix);
    const version = this.getVersionByMatrixSize(matrix.length);
    const eccLevel = this.getECLevel(this.getMaskedFormatBits(matrix));
    const eccInfo = ECC_TABLE[version]?.[eccLevel as ECLevel];
    const totalDataCodewords = eccInfo?.totalDataCodewords ?? 0;

    const eccPositions = dataPositions.slice(totalDataCodewords * 8);

    return eccPositions;
  }

  getECCDetail(matrix: number[][]) {
    const version = this.getVersionByMatrixSize(matrix.length);
    const eccLevel = this.getECLevel(this.getMaskedFormatBits(matrix));
    const eccInfo = ECC_TABLE[version]?.[eccLevel as ECLevel];
    const totalDataCodewords = eccInfo?.totalDataCodewords ?? 0;
    const totalECCCodewords =
      eccInfo ?
        eccInfo.ecCodewordsPerBlock * (eccInfo.numBlocksGroup1 + eccInfo.numBlocksGroup2)
      : 0;

    const dataPositions = this.detectDataPositions(matrix);
    const eccPositions = this.detectECCPositions(matrix);
    const dataBits = dataPositions.map(({ value }) => value).join("");
    const eccBits = eccPositions.map(({ value }) => value).join("");

    const dataBytes = dataBits.match(/.{1,8}/g)?.map((byte) => parseInt(byte, 2) & 0xff) || [];
    const dataCodewords = dataBytes.slice(0, totalDataCodewords);
    const eccBytes = eccBits.match(/.{1,8}/g)?.map((byte) => parseInt(byte, 2) & 0xff) || [];

    const allCodewords = [...dataCodewords, ...eccBytes];
    const corrected = Int32Array.from(allCodewords);

    let errorCount = 0;
    let correctionSuccess = true;
    try {
      const decoder = new ReedSolomonDecoder(GenericGF.QR_CODE_FIELD_256);
      decoder.decode(corrected, totalECCCodewords);
      for (let i = 0; i < allCodewords.length; i++) {
        if (allCodewords[i] !== corrected[i]) errorCount++;
      }
    } catch {
      correctionSuccess = false;
    }

    const correctedDataCodewords = Array.from(corrected.slice(0, totalDataCodewords));
    const correctedECCCodewords = Array.from(corrected.slice(totalDataCodewords));

    return {
      dataBits,
      eccBits,
      errorCount,
      correctionSuccess,
      correctedDataCodewords,
      correctedECCCodewords,
    };
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

  getMaskedFormatBits(matrix: number[][]) {
    const formatPositions = this.detectFormatPositions(matrix);
    const maskedFormatBits = formatPositions
      .map(({ value }) => value)
      .join("")
      .slice(0, 15);
    return maskedFormatBits;
  }

  unmaskFormatBits(maskedFormatBits: string) {
    return maskedFormatBits.split("").reduce((acc, curr, index) => {
      return acc + (curr === MASK_PATTERN[index] ? "0" : "1");
    }, "");
  }

  getECLevel(formatBits: string) {
    const unmasked = this.unmaskFormatBits(formatBits);
    const ecBits = unmasked.slice(0, 2);

    return ECC_MAP[ecBits] ?? "Unknown";
  }

  getMaskPattern(formatBits: string) {
    const unmasked = this.unmaskFormatBits(formatBits);
    const maskBits = unmasked.slice(2, 5);
    return parseInt(maskBits, 2);
  }

  unmaskDataBits(matrix: number[][]) {
    const maskedFormatBits = this.getMaskedFormatBits(matrix);
    const maskPattern = this.getMaskPattern(maskedFormatBits);
    const dataPositions = this.detectDataPositions(matrix);
    const dataMaskFn = DATA_MASK_PATTERNS[maskPattern];

    const unmaskedDataBits = dataPositions
      .map(({ row, col }) => {
        const originalValue = matrix[row][col];
        const shouldMask = dataMaskFn(row, col);
        const maskedValue = shouldMask ? originalValue ^ 1 : originalValue;
        return maskedValue;
      })
      .join("");

    return unmaskedDataBits;
  }

  getErrorCorrectionInfo(matrix: number[][]) {
    const maskedFormatBits = this.getMaskedFormatBits(matrix);
    const ecLevel = this.getECLevel(maskedFormatBits);
    const version = this.getVersionByMatrixSize(matrix.length);
    const eccCorrectionInfo = ECC_TABLE[version]?.[ecLevel as ECLevel];
    return eccCorrectionInfo;
  }

  decodeBitToText(matrix: number[][]) {
    const unmaskedDataBits = this.unmaskDataBits(matrix);
    const version = this.getVersionByMatrixSize(matrix.length);
    const modeBits = unmaskedDataBits.slice(0, 4);
    const mode = MODE_MAP[modeBits] || "(Unknown)";

    const charCountBitsLen = CHARACTER_COUNT_BITS_MAP[mode]?.[version] || 0;
    const countBits = unmaskedDataBits.slice(4, 4 + charCountBitsLen);
    const characterCount = parseInt(countBits, 2);

    const dataBitsStart = 4 + charCountBitsLen;
    const dataBits = unmaskedDataBits.slice(dataBitsStart);

    const decodeMap = {
      Byte: (dataBits: string, characterCount: number) => {
        const bytes = this.bitsToBytes(dataBits, characterCount);
        return this.bytesToText(bytes);
      },
      Alphanumeric: (dataBits: string, characterCount: number) => {
        return this.decodeAlphanumeric(dataBits, characterCount);
      },
      Numeric: (dataBits: string, characterCount: number) => {
        return this.decodeNumeric(dataBits, characterCount);
      },
    };

    const decodedText = decodeMap[mode as keyof typeof decodeMap](dataBits, characterCount);
    return decodedText;
  }

  private decodeAlphanumeric(dataBits: string, characterCount: number): string {
    let pointer = 0;
    let result = "";

    while (characterCount >= 2) {
      const bits11 = dataBits.slice(pointer, pointer + 11);
      if (bits11.length < 11) break;

      const value = parseInt(bits11, 2);
      const firstCharIndex = Math.floor(value / 45);
      const secondCharIndex = value % 45;

      result += ALPHANUMERIC_TABLE[firstCharIndex];
      result += ALPHANUMERIC_TABLE[secondCharIndex];

      pointer += 11;
      characterCount -= 2;
    }

    if (characterCount === 1) {
      const bits6 = dataBits.slice(pointer, pointer + 6);
      const value = parseInt(bits6, 2);
      result += ALPHANUMERIC_TABLE[value];
    }

    return result;
  }

  private decodeNumeric(dataBits: string, characterCount: number): string {
    let pointer = 0;
    let result = "";
    let remaining = characterCount;
    while (remaining > 0) {
      if (remaining >= 3) {
        const bits10 = dataBits.slice(pointer, pointer + 10);
        if (bits10.length < 10) break;
        const value = parseInt(bits10, 2).toString().padStart(3, "0");
        result += value;
        pointer += 10;
        remaining -= 3;
      } else if (remaining === 2) {
        const bits7 = dataBits.slice(pointer, pointer + 7);
        if (bits7.length < 7) break;
        const value = parseInt(bits7, 2).toString().padStart(2, "0");
        result += value;
        pointer += 7;
        remaining -= 2;
      } else if (remaining === 1) {
        const bits4 = dataBits.slice(pointer, pointer + 4);
        if (bits4.length < 4) break;
        const value = parseInt(bits4, 2).toString();
        result += value;
        pointer += 4;
        remaining -= 1;
      }
    }
    return result;
  }

  private bitsToBytes(bits: string, characterCount: number): number[] {
    const bytes = [];
    for (let i = 0; i < characterCount; i++) {
      const byteBits = bits.slice(i * 8, i * 8 + 8);
      if (byteBits.length < 8) break;
      bytes.push(parseInt(byteBits, 2));
    }
    return bytes;
  }

  private bytesToText(bytes: number[]): string {
    try {
      return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
    } catch {
      try {
        return new TextDecoder("iso-8859-1").decode(new Uint8Array(bytes));
      } catch {
        return String.fromCharCode(...bytes);
      }
    }
  }
}
