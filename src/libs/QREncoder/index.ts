import GenericGF from "@zxing/library/esm/core/common/reedsolomon/GenericGF";
import ReedSolomonEncoder from "@zxing/library/esm/core/common/reedsolomon/ReedSolomonEncoder";

import { MODE_DETECTION_RULES } from "./constants/modeDetectionRules";
import { MaskPatternSelector } from "./MaskPatternSelector";
import { QREncodingStrategy } from "./QREncodingStrategy";

import type { QREncoderResult } from "./types/QREncoderResult";
import type { ECLevel } from "@/types/ECCTable";
import type { Mode, ErrorCorrectionLevel } from "@/types/versionCapacityTableType";

import { ALIGNMENT_PATTERN_LOCATIONS } from "@/constants/alignmentPattern";
import { ECC_TABLE } from "@/constants/eccTable";
import { FINDER_PATTERN } from "@/constants/finderPattern";
import { FORMAT_INFORMATION_STRINGS } from "@/constants/formatMask";
import { VERSION_CAPACITY_TABLE } from "@/constants/versionCapacityTable";
export class QREncoder {
  private text: string;
  private mode: string;
  private modeIndicatorBits: string;
  private length: number;
  private errorCorrectionLevel: string;
  private smallestVersion: number;
  private qrEncodingStrategy: QREncodingStrategy;

  constructor(text: string, errorCorrectionLevel: string) {
    this.text = text;
    this.mode = this.getMode(this.text).mode;
    this.modeIndicatorBits = this.getMode(this.text).modeIndicatorBits;
    this.length = this.text.length;
    this.errorCorrectionLevel = errorCorrectionLevel;
    this.smallestVersion = this.getSmallestVersion();
    this.qrEncodingStrategy = new QREncodingStrategy();
  }

  /**
   * 모드 검출 규칙(MODE_DETECTION_RULES)에 따라 모드와 모드 인디케이터 비트를 반환합니다.
   * @param text - 인코딩할 텍스트
   * @returns 모드와 모드 인디케이터 비트
   */
  public getMode(text: string): { mode: string; modeIndicatorBits: string } {
    const foundMode = MODE_DETECTION_RULES.find(({ regex }) => regex.test(text));
    const mode = foundMode ? foundMode.mode : "Byte";
    const modeIndicatorBits = foundMode ? foundMode.modeIndicatorBits : "0100";

    return { mode, modeIndicatorBits };
  }

  /**
   * 최소 버전을 반환합니다.
   * 버전 용량 테이블(VERSION_CAPACITY_TABLE)에 따라 최소 버전을 반환합니다.
   * @returns 최소 버전
   */
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

  /**
   * 문자 수 비트 길이를 반환합니다.
   * @param version - 버전(1~40)
   * @param mode - 모드(Numeric, Alphanumeric, Byte, Kanji)
   * @param data - 인코딩할 텍스트
   * @returns 문자 수 비트(문자 수 비트 길이)
   */
  private getCharCountBitLength(version: number, mode: Mode, data: string): string {
    const charCountBitsTable: Record<Mode, [number, number, number]> = {
      Numeric: [10, 12, 14],
      Alphanumeric: [9, 11, 13],
      Byte: [8, 16, 16],
    };
    const idx =
      version <= 9 ? 0
      : version <= 26 ? 1
      : 2;
    const charCountBitLength = charCountBitsTable[mode]?.[idx] ?? 0;
    return data.length.toString(2).padStart(charCountBitLength, "0");
  }

  /**
   * 버전과 에러레벨에 맞는 총 비트 수를 반환합니다.
   * @param version - 버전(1~40)
   * @param ecLevel - 에러레벨(L, M, Q, H)
   * @returns 총 비트 수
   */
  private getTotalBits(version: number, ecLevel: ECLevel): number {
    const eccInfo = ECC_TABLE[version]?.[ecLevel];
    return eccInfo.totalDataCodewords * 8;
  }

  /**
   * 비트 스트림을 생성합니다.
   * 비트스트림은 모드 인디케이터 비트, 문자 수 비트, 데이터 비트로 구성됩니다.
   * 데이터 비트는 선택된 모드에 따라 인코딩됩니다.
   * 데이터 비트 뒤에는 종료 비트(0000)가 추가됩니다.
   * 데이터 비트 뒤에는 패딩 비트(11101100)가 추가됩니다.
   * 패딩 비트 뒤에는 종료 비트(00010001)가 추가됩니다.
   * @returns 비트 스트림
   */
  public buildBitStream(): string {
    const ecLevel = this.errorCorrectionLevel.split(" ")[0] as ECLevel;

    let bitstream =
      this.modeIndicatorBits
      + this.getCharCountBitLength(this.smallestVersion, this.mode as Mode, this.text)
      + this.qrEncodingStrategy.encodeUsingSelectedMode(this.text, this.mode as Mode);

    const totalBits = this.getTotalBits(this.smallestVersion, ecLevel);
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

  /**
   * 비트 스트림을 코드워드로 변환합니다.
   * 코드워드란 8비트로 구성된 데이터 비트 묶음입니다.
   * @param bits - 비트 스트림
   * @returns 코드워드
   */
  private toCodewords(bits: string): number[] {
    const out: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      out.push(parseInt(bits.slice(i, i + 8), 2));
    }
    return out;
  }

  /**
   * 에러 정정 비트를 생성합니다.
   * @returns 에러 정정 비트
   */
  public generateECC(bitStream: string): {
    dataCodewords: number[];
    eccCodewords: number[];
    finalCodewords: number[];
    finalBits: string;
  } {
    const dataCw = this.toCodewords(bitStream);

    const version = this.smallestVersion;
    const ecLevel = this.errorCorrectionLevel.split(" ")[0] as ECLevel;
    const eccInfo = ECC_TABLE[version][ecLevel];

    const shardLen = eccInfo.dataCodewordsGroup1;
    const eccLen = eccInfo.ecCodewordsPerBlock;

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
    const version = this.smallestVersion;
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

          if (FINDER_PATTERN[i][j] === 1) {
            coordinates.push({ row: pixelRow, col: pixelCol });
          }
        }
      }
    });

    return coordinates;
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

  public findFormatInformationWithMask(maskNumber: number): { row: number; col: number }[] {
    const version = this.getSmallestVersion();
    const matrixSize = version * 4 + 17;
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

    const rightBottomPositions = this.getRightBottomFormatPositions(matrixSize);
    rightBottomPositions.forEach((pos, index) => {
      if (index < 15 && ((formatInformation >> (14 - index)) & 1) === 1) {
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
    const eccResult = this.generateECC(bitStream);
    const fullBitStream = bitStream + eccResult.finalBits;
    const dataPositions = this.getDataModulePositions(matrixSize);

    dataPositions.forEach((pos, index) => {
      if (index < fullBitStream.length && fullBitStream[index] === "1") {
        coordinates.push({ row: pos.row, col: pos.col });
      }
    });

    return coordinates;
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

  public encode(): QREncoderResult {
    const bitStream = this.buildBitStream();
    const eccResult = this.generateECC(bitStream);

    const finderPattern = this.findFinderPattern();
    const alignmentPattern = this.findAlignmentPattern();
    const timingPattern = this.findTimingPattern();
    const darkModule = this.findDarkModule();
    const dataModules = this.findDataModules();

    const basePattern = [
      ...finderPattern,
      ...alignmentPattern,
      ...timingPattern,
      ...darkModule,
      ...dataModules,
    ];

    const matrixSize = this.smallestVersion * 4 + 17;
    const dataEccPositions = this.getDataModulePositions(matrixSize);
    const maskSelector = new MaskPatternSelector(matrixSize);
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
      text: this.text,
      mode: this.mode,
      modeIndicatorBits: this.modeIndicatorBits,
      length: this.length,
      errorCorrectionLevel: this.errorCorrectionLevel,
      bitStream,
      smallestVersion: this.smallestVersion,
      dataCodewords: eccResult.dataCodewords,
      eccCodewords: eccResult.eccCodewords,
      finalCodewords: eccResult.finalCodewords,
      finalBits: eccResult.finalBits,
      basePattern,
      maskedMatrixPositions,
      maskNumber,
      formatPosition,
    };
  }
}
