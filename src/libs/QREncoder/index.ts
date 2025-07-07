import GenericGF from "@zxing/library/esm/core/common/reedsolomon/GenericGF";
import ReedSolomonEncoder from "@zxing/library/esm/core/common/reedsolomon/ReedSolomonEncoder";

import { MODE_DETECTION_RULES } from "./constants/modeDetectionRules";

import type { QREncoderResult } from "./types/QREncoderResult";
import type { ECLevel } from "@/types/ECCTable";
import type { Mode, ErrorCorrectionLevel } from "@/types/versionCapacityTableType";

import { ALIGNMENT_PATTERN_LOCATIONS } from "@/constants/alignmentPattern";
import { ALPHANUMERIC_TABLE } from "@/constants/alphanumericTable";
import { ECC_TABLE } from "@/constants/eccTable";
import { FORMAT_MASK } from "@/constants/formatMask";
import { VERSION_CAPACITY_TABLE } from "@/constants/versionCapacityTable";

export class QREncoder {
  private text: string;
  private mode: string;
  private modeIndicatorBits: string;
  private length: number;
  private errorCorrectionLevel: string;

  constructor(text: string, errorCorrectionLevel: string) {
    this.text = text;
    this.mode = this.getMode(this.text).mode;
    this.modeIndicatorBits = this.getMode(this.text).modeIndicatorBits;
    this.length = this.text.length;
    this.errorCorrectionLevel = errorCorrectionLevel;
  }

  public getMode(text: string): { mode: string; modeIndicatorBits: string } {
    const foundMode = MODE_DETECTION_RULES.find(({ regex }) => regex.test(text));
    const mode = foundMode ? foundMode.mode : "Byte";
    const modeIndicatorBits = foundMode ? foundMode.modeIndicatorBits : "0100";

    return { mode, modeIndicatorBits };
  }

  public getSmallestVersion(): number {
    const ecLevel = this.errorCorrectionLevel.split(" ")[0] as ErrorCorrectionLevel;

    for (let version = 1; version <= 40; version++) {
      const capacity = VERSION_CAPACITY_TABLE[version]?.[ecLevel]?.[this.mode as Mode];
      if (capacity !== undefined && this.length <= capacity) {
        return version;
      }
    }
    return 1;
  }

  private getCharCountBitLength(version: number, mode: Mode, data: string): string {
    let charCountBitLength = 0;

    if (version <= 9) {
      if (mode === "Numeric") charCountBitLength = 10;
      if (mode === "Alphanumeric") charCountBitLength = 9;
      if (mode === "Byte") charCountBitLength = 8;
      if (mode === "Kanji") charCountBitLength = 8;
    } else if (version <= 26) {
      if (mode === "Numeric") charCountBitLength = 12;
      if (mode === "Alphanumeric") charCountBitLength = 11;
      if (mode === "Byte") charCountBitLength = 16;
      if (mode === "Kanji") charCountBitLength = 10;
    } else {
      if (mode === "Numeric") charCountBitLength = 14;
      if (mode === "Alphanumeric") charCountBitLength = 13;
      if (mode === "Byte") charCountBitLength = 16;
      if (mode === "Kanji") charCountBitLength = 12;
    }

    return data.length.toString(2).padStart(charCountBitLength, "0");
  }

  private encodeAlphanumeric(data: string): string {
    let bits = "";

    for (let i = 0; i < data.length; i += 2) {
      if (i + 1 < data.length) {
        const first = ALPHANUMERIC_TABLE.indexOf(data[i]);
        const second = ALPHANUMERIC_TABLE.indexOf(data[i + 1]);
        const value = 45 * first + second;
        bits += value.toString(2).padStart(11, "0");
      } else {
        const first = ALPHANUMERIC_TABLE.indexOf(data[i]);
        bits += first.toString(2).padStart(6, "0");
      }
    }

    return bits;
  }

  private encodeNumeric(data: string): string {
    let bits = "";
    let i = 0;

    while (i < data.length) {
      if (i + 3 <= data.length) {
        const chunk = data.substr(i, 3);
        bits += parseInt(chunk, 10).toString(2).padStart(10, "0");
        i += 3;
      } else if (i + 2 <= data.length) {
        const chunk = data.substr(i, 2);
        bits += parseInt(chunk, 10).toString(2).padStart(7, "0");
        i += 2;
      } else {
        const chunk = data.substr(i, 1);
        bits += parseInt(chunk, 10).toString(2).padStart(4, "0");
        i += 1;
      }
    }

    return bits;
  }

  private encodeByte(data: string): string {
    let bits = "";

    const encoder = new TextEncoder();
    const encoded = encoder.encode(data);

    for (let i = 0; i < encoded.length; i++) {
      bits += encoded[i].toString(2).padStart(8, "0");
    }

    return bits;
  }

  private getTotalBits(version: number, ecLevel: ECLevel): number {
    const eccInfo = ECC_TABLE[version]?.[ecLevel];
    if (!eccInfo) {
      throw new Error(`ECC info not found for version ${version} / level ${ecLevel}`);
    }
    return eccInfo.totalDataCodewords * 8;
  }

  public buildBitStream(): string {
    const version = this.getSmallestVersion();
    const ecLevel = this.errorCorrectionLevel.split(" ")[0] as ECLevel;

    let bitstream =
      this.modeIndicatorBits + this.getCharCountBitLength(version, this.mode as Mode, this.text);

    let dataBits = "";
    if (this.mode === "Alphanumeric") {
      dataBits = this.encodeAlphanumeric(this.text);
    } else if (this.mode === "Numeric") {
      dataBits = this.encodeNumeric(this.text);
    } else if (this.mode === "Byte") {
      dataBits = this.encodeByte(this.text);
    } else {
      throw new Error(`Mode ${this.mode} not implemented yet.`);
    }

    bitstream += dataBits;

    const totalBits = this.getTotalBits(version, ecLevel);
    const remaining = totalBits - bitstream.length;
    const terminatorLength = Math.min(4, remaining);
    bitstream += "0".repeat(terminatorLength);

    const extraBits = bitstream.length % 8;
    if (extraBits !== 0) {
      bitstream += "0".repeat(8 - extraBits);
    }

    const padBytes = ["11101100", "00010001"];
    let i = 0;
    while (bitstream.length + 8 <= totalBits) {
      bitstream += padBytes[i % 2];
      i++;
    }

    const remainingBits = totalBits - bitstream.length;
    if (remainingBits > 0) {
      bitstream += padBytes[i % 2].slice(0, remainingBits);
    }

    if (bitstream.length > totalBits) {
      bitstream = bitstream.slice(0, totalBits);
    }
    return bitstream;
  }

  private toCodewords(bits: string): number[] {
    const out: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      out.push(parseInt(bits.slice(i, i + 8), 2));
    }
    return out;
  }

  public generateECC(): {
    dataCodewords: number[];
    eccCodewords: number[];
    finalCodewords: number[];
    finalBits: string;
  } {
    const bitStream = this.buildBitStream();

    const dataCw = this.toCodewords(bitStream);

    const version = this.getSmallestVersion();
    const ecLevel = this.errorCorrectionLevel.split(" ")[0] as ECLevel;
    const eccInfo = ECC_TABLE[version][ecLevel];

    const shardLen = eccInfo.dataCodewordsGroup1;
    const eccLen = eccInfo.ecCodewordsPerBlock;

    if (!dataCw.length) {
      return {
        dataCodewords: [],
        eccCodewords: [],
        finalCodewords: [],
        finalBits: "",
      };
    }

    const encoder = new ReedSolomonEncoder(GenericGF.QR_CODE_FIELD_256);
    const buffer = new Int32Array(shardLen + eccLen);

    dataCw.slice(0, shardLen).forEach((v, i) => (buffer[i] = v));
    encoder.encode(buffer, eccLen);

    const eccCw = Array.from(buffer.slice(-eccLen));
    const finalCw = [...dataCw.slice(0, shardLen), ...eccCw];
    const finalBits = finalCw.map((b) => b.toString(2).padStart(8, "0")).join("");

    return {
      dataCodewords: dataCw.slice(0, shardLen),
      eccCodewords: eccCw,
      finalCodewords: finalCw,
      finalBits,
    };
  }

  public findFinderPattern(): { row: number; col: number }[] {
    const version = this.getSmallestVersion();
    const matrixSize = version * 4 + 17;

    const finderPatterns = [
      { row: 0, col: 0 },
      { row: 0, col: matrixSize - 7 },
      { row: matrixSize - 7, col: 0 },
    ];

    const coordinates: { row: number; col: number }[] = [];

    finderPatterns.forEach((pattern) => {
      const { row, col } = pattern;

      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          const pixelRow = row + i;
          const pixelCol = col + j;

          if (this.isFinderPatternPixel(i, j)) {
            coordinates.push({ row: pixelRow, col: pixelCol });
          }
        }
      }
    });

    return coordinates;
  }

  private isFinderPatternPixel(row: number, col: number): boolean {
    const pattern = [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ];

    return pattern[row][col] === 1;
  }

  public findTimingPattern(): { row: number; col: number }[] {
    const version = this.getSmallestVersion();
    const matrixSize = version * 4 + 17;

    const coordinates: { row: number; col: number }[] = [];

    for (let col = 8; col < matrixSize - 8; col++) {
      if ((col - 8) % 2 === 0) {
        coordinates.push({ row: 6, col });
      }
    }

    for (let row = 8; row < matrixSize - 8; row++) {
      if ((row - 8) % 2 === 0) {
        coordinates.push({ row, col: 6 });
      }
    }

    return coordinates;
  }

  public findSeparators(): { row: number; col: number }[] {
    const version = this.getSmallestVersion();
    const matrixSize = version * 4 + 17;
    const coordinates: { row: number; col: number }[] = [];

    for (let row = 0; row < 8; row++) {
      coordinates.push({ row, col: 7 });
    }
    for (let col = 0; col < 8; col++) {
      coordinates.push({ row: 7, col });
    }

    for (let row = 0; row < 8; row++) {
      coordinates.push({ row, col: matrixSize - 8 });
    }
    for (let col = matrixSize - 8; col < matrixSize; col++) {
      coordinates.push({ row: 7, col });
    }

    for (let row = matrixSize - 8; row < matrixSize; row++) {
      coordinates.push({ row, col: 7 });
    }
    for (let col = 0; col < 8; col++) {
      coordinates.push({ row: matrixSize - 8, col });
    }

    return coordinates;
  }

  public findDarkModule(): { row: number; col: number }[] {
    const version = this.getSmallestVersion();
    const darkModuleRow = 4 * version + 9;

    return [{ row: darkModuleRow, col: 8 }];
  }

  public findAlignmentPattern(): { row: number; col: number }[] {
    const version = this.getSmallestVersion();
    const matrixSize = version * 4 + 17;
    const coordinates: { row: number; col: number }[] = [];

    if (version < 2) return coordinates;

    const alignmentPositions = this.getAlignmentPositions(version);

    alignmentPositions.forEach(({ row, col }) => {
      if (!this.isOverlappingFinderPattern(row, col, matrixSize)) {
        for (let i = -2; i <= 2; i++) {
          for (let j = -2; j <= 2; j++) {
            const pixelRow = row + i;
            const pixelCol = col + j;

            if (pixelRow >= 0 && pixelRow < matrixSize && pixelCol >= 0 && pixelCol < matrixSize) {
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

  private getAlignmentPositions(version: number): { row: number; col: number }[] {
    const positions: { row: number; col: number }[] = [];

    const alignmentLocations = ALIGNMENT_PATTERN_LOCATIONS[version] || [];

    for (let i = 0; i < alignmentLocations.length; i++) {
      for (let j = 0; j < alignmentLocations.length; j++) {
        const row = alignmentLocations[i];
        const col = alignmentLocations[j];

        if (!this.isOverlappingFinderPattern(row, col, version * 4 + 17)) {
          positions.push({ row, col });
        }
      }
    }

    return positions;
  }

  private isOverlappingFinderPattern(row: number, col: number, matrixSize: number): boolean {
    const finderAreas = [
      { row: 0, col: 0, width: 7, height: 7 },
      { row: 0, col: matrixSize - 7, width: 7, height: 7 },
      { row: matrixSize - 7, col: 0, width: 7, height: 7 },
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

  public findFormatInformation(): { row: number; col: number }[] {
    const version = this.getSmallestVersion();
    const matrixSize = version * 4 + 17;
    const coordinates: { row: number; col: number }[] = [];

    const ecLevel = this.errorCorrectionLevel.split(" ")[0];
    const ecLevelBits = this.getErrorCorrectionLevelBits(ecLevel);
    const maskPattern = "000";
    const formatBits = ecLevelBits + maskPattern;

    const encodedFormat = this.encodeFormatInformation(formatBits);
    const maskedFormat = encodedFormat ^ FORMAT_MASK;
    console.log(maskedFormat.toString(2).padStart(15, "0"));
    const leftTopPositions = this.getFormatInformationPositions();
    leftTopPositions.forEach((pos, index) => {
      if (index < 15 && ((maskedFormat >> (14 - index)) & 1) === 1) {
        coordinates.push(pos);
      }
    });

    const rightBottomPositions = this.getRightBottomFormatPositions(matrixSize);
    rightBottomPositions.forEach((pos, index) => {
      if (index < 15 && ((maskedFormat >> (14 - index)) & 1) === 1) {
        coordinates.push(pos);
      }
    });

    return coordinates;
  }

  private getErrorCorrectionLevelBits(ecLevel: string): string {
    switch (ecLevel) {
      case "L":
        return "01";
      case "M":
        return "00";
      case "Q":
        return "11";
      case "H":
        return "10";
      default:
        return "01";
    }
  }

  private encodeFormatInformation(formatBits: string): number {
    const generator = 0b10100110111;
    let data = parseInt(formatBits.padEnd(15, "0"), 2);
    for (let i = 0; i < 10; i++) {
      if ((data >> (14 - i)) & 1) {
        data ^= generator << (10 - i);
      }
    }

    return data & 0x7fff;
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

  private getRightBottomFormatPositions(matrixSize: number): { row: number; col: number }[] {
    const positions: { row: number; col: number }[] = [];

    for (let row = matrixSize - 1; row >= matrixSize - 7; row--) {
      positions.push({ row, col: 8 });
    }
    for (let col = matrixSize - 8; col <= matrixSize - 1; col++) {
      positions.push({ row: 8, col });
    }

    return positions;
  }

  public findDataModules(): { row: number; col: number }[] {
    const version = this.getSmallestVersion();
    const matrixSize = version * 4 + 17;
    const coordinates: { row: number; col: number }[] = [];
    const bitStream = this.buildBitStream();
    const eccResult = this.generateECC();
    const fullBitStream = bitStream + eccResult.finalBits;
    const dataPositions = this.getDataModulePositions(matrixSize);

    dataPositions.forEach((pos, index) => {
      if (index < fullBitStream.length && fullBitStream[index] === "1") {
        coordinates.push({ row: pos.row, col: pos.col });
      }
    });

    return coordinates;
  }

  private getDataBitCount(): number {
    return this.buildBitStream().length;
  }

  private getDataModulePositions(matrixSize: number): { row: number; col: number }[] {
    const positions: { row: number; col: number }[] = [];

    let col = matrixSize - 1;
    let upwards = true;

    while (col > 0) {
      if (col === 6) col--;

      const right = col;
      const left = col - 1;

      if (upwards) {
        for (let row = matrixSize - 1; row >= 0; row--) {
          for (const c of [right, left]) {
            const rowPos = row;
            const colPos = c;

            if (this.isInFinderPatternArea(rowPos, colPos, matrixSize)) continue;
            if (rowPos === 6 || colPos === 6) continue;
            if (this.isInFormatInformationArea(rowPos, colPos, matrixSize)) continue;
            if (this.isInAlignmentPatternArea(rowPos, colPos)) continue;
            if (this.isInSeparatorArea(rowPos, colPos, matrixSize)) continue;
            if (this.isInDarkModuleArea(rowPos, colPos)) continue;

            positions.push({ row: rowPos, col: colPos });
          }
        }
      } else {
        for (let row = 0; row < matrixSize; row++) {
          for (const c of [right, left]) {
            const rowPos = row;
            const colPos = c;

            if (this.isInFinderPatternArea(rowPos, colPos, matrixSize)) continue;
            if (rowPos === 6 || colPos === 6) continue;
            if (this.isInFormatInformationArea(rowPos, colPos, matrixSize)) continue;
            if (this.isInAlignmentPatternArea(rowPos, colPos)) continue;
            if (this.isInSeparatorArea(rowPos, colPos, matrixSize)) continue;
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

  private isInFinderPatternArea(row: number, col: number, matrixSize: number): boolean {
    return this.isOverlappingFinderPattern(row, col, matrixSize);
  }

  private isInFormatInformationArea(row: number, col: number, matrixSize: number): boolean {
    if (row === 8 && col < 8) return true;
    if (row === 8 && col >= matrixSize - 8) return true;
    if (col === 8 && row < 8) return true;
    if (col === 8 && row >= matrixSize - 8) return true;
    return false;
  }

  private isInAlignmentPatternArea(row: number, col: number): boolean {
    const alignmentPositions = this.getAlignmentPositions(this.getSmallestVersion());

    return alignmentPositions.some((pos) => {
      const centerRow = pos.row;
      const centerCol = pos.col;

      return (
        row >= centerRow - 2 && row <= centerRow + 2 && col >= centerCol - 2 && col <= centerCol + 2
      );
    });
  }

  private isInSeparatorArea(row: number, col: number, matrixSize: number): boolean {
    if (col === 7 && row < 8) return true;
    if (row === 7 && col < 8) return true;

    if (col === matrixSize - 8 && row < 8) return true;
    if (row === 7 && col >= matrixSize - 8) return true;

    if (col === 7 && row >= matrixSize - 8) return true;
    if (row === matrixSize - 8 && col < 8) return true;

    return false;
  }

  private isInDarkModuleArea(row: number, col: number): boolean {
    const version = this.getSmallestVersion();
    const darkModuleRow = 4 * version + 9;

    return col === 8 && row === darkModuleRow;
  }

  private applyMaskPattern0(
    pattern: { row: number; col: number }[],
  ): { row: number; col: number }[] {
    const version = this.getSmallestVersion();
    const matrixSize = version * 4 + 17;
    const maskedPattern: { row: number; col: number }[] = [];

    const matrix: boolean[][] = Array(matrixSize)
      .fill(null)
      .map(() => Array(matrixSize).fill(false));

    pattern.forEach((pos) => {
      matrix[pos.row][pos.col] = true;
    });

    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        if (
          this.isInFinderPatternArea(row, col, matrixSize)
          || this.isInFormatInformationArea(row, col, matrixSize)
          || this.isInAlignmentPatternArea(row, col)
          || this.isInSeparatorArea(row, col, matrixSize)
          || this.isInDarkModuleArea(row, col)
          || row === 6
          || col === 6
        ) {
          continue;
        }

        const shouldFlip = (row + col) % 2 === 0;

        if (shouldFlip) {
          matrix[row][col] = !matrix[row][col];
        }
      }
    }

    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        if (matrix[row][col]) {
          maskedPattern.push({ row, col });
        }
      }
    }

    return maskedPattern;
  }

  public encode(): QREncoderResult {
    const smallestVersion = this.getSmallestVersion();
    const bitStream = this.buildBitStream();
    const eccResult = this.generateECC();
    const finderPattern = this.findFinderPattern();

    const alignmentPattern = this.findAlignmentPattern();
    const timingPattern = this.findTimingPattern();
    const darkModule = this.findDarkModule();
    const formatInformation = this.findFormatInformation();
    const dataModules = this.findDataModules();

    const pattern = [
      ...finderPattern,
      ...alignmentPattern,
      ...timingPattern,
      ...darkModule,
      ...formatInformation,
      ...dataModules,
    ];

    const maskedPattern = this.applyMaskPattern0(pattern);

    return {
      text: this.text,
      mode: this.mode,
      modeIndicatorBits: this.modeIndicatorBits,
      length: this.length,
      errorCorrectionLevel: this.errorCorrectionLevel,
      bitStream,
      smallestVersion,
      dataCodewords: eccResult.dataCodewords,
      eccCodewords: eccResult.eccCodewords,
      finalCodewords: eccResult.finalCodewords,
      finalBits: eccResult.finalBits,
      pattern,
      maskedPattern,
    };
  }
}
