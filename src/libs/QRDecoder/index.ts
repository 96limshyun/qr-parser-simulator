import GenericGF from "@zxing/library/esm/core/common/reedsolomon/GenericGF";
import ReedSolomonDecoder from "@zxing/library/esm/core/common/reedsolomon/ReedSolomonDecoder";

import type { QRDecodeResult } from "@/libs/QRDecoder/types/QRDecodeResult";
import type { ECLevel } from "@/types/ECCTable";

import { ALIGNMENT_PATTERN_LOCATIONS } from "@/constants/alignmentPattern";
import { ALPHANUMERIC_TABLE } from "@/constants/alphanumericTable";
import { CHARACTER_COUNT_BITS_MAP } from "@/constants/characterCountBitsMap";
import { ECC_TABLE } from "@/constants/eccTable";
import { FINDER_PATTERN } from "@/constants/finderPattern";
import { DATA_MASK_PATTERNS } from "@/constants/maskPatterns";
import { MODE_MAP } from "@/constants/modeMap";

export class QRDecoder {
  private matrix: number[][];
  private size: number;
  private version: number;

  constructor(matrix: number[][]) {
    this.matrix = matrix;
    this.size = matrix.length;
    this.version = this.getVersionByMatrixSize();
  }

  /**
   * QR 코드 크기에 따라 버전을 결정합니다.
   * @returns 버전 번호 (1~40)
   */
  public getVersionByMatrixSize(): number {
    if ((this.size - 21) % 4 !== 0) {
      throw new Error("Invalid QR matrix size");
    }
    const version = (this.size - 21) / 4 + 1;
    if (version < 1 || version > 40) {
      throw new Error("Invalid QR version");
    }
    return version;
  }

  /**
   * 파인더 패턴의 위치를 검출합니다.
   * @returns 파인더 패턴의 위치 배열
   */
  public detectFinderPositions(): Array<{ rowStart: number; colStart: number }> {
    const positions: Array<{ rowStart: number; colStart: number }> = [];

    for (let rowStart = 0; rowStart <= this.size - 7; rowStart++) {
      for (let colStart = 0; colStart <= this.size - 7; colStart++) {
        let matched = true;
        outer: for (let y = 0; y < 7; y++) {
          for (let x = 0; x < 7; x++) {
            if (this.matrix[rowStart + y][colStart + x] !== FINDER_PATTERN[y][x]) {
              matched = false;
              break outer;
            }
          }
        }
        if (matched) positions.push({ rowStart, colStart });
      }
    }
    return positions;
  }

  /**
   * 알리멘테이션 패턴의 위치를 검출합니다.
   * @returns 알리멘테이션 패턴의 위치 배열
   */
  public detectAlignmentPositions(): Array<{ row: number; col: number }> {
    const centers = ALIGNMENT_PATTERN_LOCATIONS[this.version] || [];
    const positions: Array<{ row: number; col: number }> = [];

    for (const row of centers) {
      for (const col of centers) {
        if (
          (row <= 8 && col <= 8)
          || (row <= 8 && col >= this.size - 8)
          || (row >= this.size - 8 && col <= 8)
        ) {
          continue;
        }
        positions.push({ row, col });
      }
    }
    return positions;
  }

  /**
   * 포맷 정보의 위치를 검출합니다.
   * @returns 포맷 정보의 위치 배열
   */
  public detectFormatPositions(): Array<{ row: number; col: number; value: number }> {
    const coords: [number, number][] = [];

    for (let col = 0; col <= 5; col++) {
      coords.push([8, col]);
    }

    coords.push([8, 7], [8, 8]);
    coords.push([7, 8]);

    for (let row = 5; row >= 0; row--) {
      coords.push([row, 8]);
    }

    for (let row = this.size - 1; row >= this.size - 8; row--) {
      coords.push([row, 8]);
    }

    for (let col = this.size - 1; col >= this.size - 8; col--) {
      coords.push([8, col]);
    }

    return coords.map(([row, col]) => ({
      row,
      col,
      value: this.matrix[row][col],
    }));
  }

  /**
   * 포맷 정보를 디코딩합니다.
   * @returns 포맷 정보 디코딩 결과
   */
  public decodeFormatInfo(): {
    rawBits: string;
    unmaskedBits: string;
    eccLevel: string;
    maskPattern: number;
  } {
    const positions = this.detectFormatPositions();
    const rawBitsStr = positions
      .slice(0, 15)
      .map((pos) => pos.value)
      .join("");

    const formatMask = "101010000010010";
    const unmaskedBits = rawBitsStr
      .split("")
      .map((bit, i) => (parseInt(bit) ^ parseInt(formatMask[i])).toString())
      .join("");

    const eccLevelBits = unmaskedBits.slice(0, 2);
    const maskPatternBits = unmaskedBits.slice(2, 5);

    const eccLevelMap: Record<string, string> = {
      "00": "L",
      "01": "M",
      "10": "Q",
      "11": "H",
    };

    const eccLevel = eccLevelMap[eccLevelBits] || "알 수 없음";
    const maskPattern = parseInt(maskPatternBits, 2);

    return {
      rawBits: rawBitsStr,
      unmaskedBits,
      eccLevel,
      maskPattern,
    };
  }

  /**
   * 타이밍 패턴의 위치를 검출합니다.
   * @returns 타이밍 패턴의 위치 배열
   */
  public detectTimingPositions(): Array<{ row: number; col: number; value: number }> {
    const positions: { row: number; col: number; value: number }[] = [];

    for (let col = 8; col <= this.size - 9; col++) {
      positions.push({
        row: 6,
        col,
        value: this.matrix[6][col],
      });
    }

    for (let row = 8; row <= this.size - 9; row++) {
      positions.push({
        row,
        col: 6,
        value: this.matrix[row][6],
      });
    }

    return positions;
  }

  /**
   * 예약된 위치를 만듭니다.
   * 예약된 위치는 데이터 모듈이 아닌 위치입니다.
   * @returns 예약된 위치 배열
   */
  private createReservedMap(): boolean[][] {
    const reservedMap: boolean[][] = [];

    for (let row = 0; row < this.size; row++) {
      reservedMap[row] = [];
      for (let col = 0; col < this.size; col++) {
        const reserved = this.isReserved(row, col);
        reservedMap[row][col] = reserved;
      }
    }

    return reservedMap;
  }

  /**
   * 예약된 위치인지 확인합니다.
   * @param row 행 번호
   * @param col 열 번호
   * @returns 예약된 위치인지 여부
   */
  private isReserved(row: number, col: number): boolean {
    if (row === 7 && col <= 7) return true;
    if (col === 7 && row <= 7) return true;
    if (row === 7 && col >= this.size - 8) return true;
    if (col === this.size - 8 && row <= 7) return true;
    if (row === this.size - 8 && col <= 7) return true;
    if (col === 7 && row >= this.size - 8) return true;

    if (this.version >= 7) {
      if (row <= 5 && col >= this.size - 11 && col <= this.size - 9) return true;
      if (row >= this.size - 11 && row <= this.size - 9 && col <= 5) return true;
    }

    if (this.version >= 1) {
      if (row === 4 * this.version + 9 && col === 8) return true;
    }

    const finderPositions = this.detectFinderPositions();
    const inFinder = finderPositions.some(({ rowStart, colStart }) => {
      return row >= rowStart && row < rowStart + 7 && col >= colStart && col < colStart + 7;
    });
    if (inFinder) return true;

    const alignmentPositions = this.detectAlignmentPositions();
    const inAlignment = alignmentPositions.some(({ row: alignRow, col: alignCol }) => {
      return (
        row >= alignRow - 2 && row <= alignRow + 2 && col >= alignCol - 2 && col <= alignCol + 2
      );
    });
    if (inAlignment) return true;
    const formatPositions = this.detectFormatPositions();
    const inFormat = formatPositions.some(({ row: formatRow, col: formatCol }) => {
      return row === formatRow && col === formatCol;
    });
    if (inFormat) return true;

    const timingPositions = this.detectTimingPositions();
    const inTiming = timingPositions.some(({ row: timingRow, col: timingCol }) => {
      return row === timingRow && col === timingCol;
    });
    if (inTiming) return true;

    return false;
  }

  /**
   * 데이터 모듈의 위치를 검출합니다.
   * @returns 데이터 모듈의 위치 배열
   */
  private getDataModuleCoordinates(): Array<{ row: number; col: number }> {
    const reservedMap = this.createReservedMap();
    const coords: { row: number; col: number }[] = [];

    let col = this.size - 1;
    let upwards = true;

    while (col > 0) {
      if (col === 6) col--;

      const right = col;
      const left = col - 1;

      if (upwards) {
        for (let row = this.size - 1; row >= 0; row--) {
          for (const c of [right, left]) {
            if (!reservedMap[row][c]) coords.push({ row, col: c });
          }
        }
      } else {
        for (let row = 0; row < this.size; row++) {
          for (const c of [right, left]) {
            if (!reservedMap[row][c]) coords.push({ row, col: c });
          }
        }
      }

      col -= 2;
      if (col === 6) col--;
      upwards = !upwards;
    }

    return coords;
  }

  /**
   * 알파벳 문자열을 디코딩합니다.
   * @param dataBits 데이터 비트
   * @param characterCount 문자 개수
   * @returns 디코딩된 문자열
   */
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

  /**
   * 비트 문자열을 바이트 배열로 변환합니다.
   * @param bits 비트 문자열
   * @param characterCount 문자 개수
   * @returns 바이트 배열
   */
  private bitsToBytes(bits: string, characterCount: number): number[] {
    const bytes = [];
    for (let i = 0; i < characterCount; i++) {
      const byteBits = bits.slice(i * 8, i * 8 + 8);
      if (byteBits.length < 8) break;
      bytes.push(parseInt(byteBits, 2));
    }
    return bytes;
  }

  /**
   * 바이트 배열을 텍스트로 변환합니다.
   * @param bytes 바이트 배열
   * @returns 텍스트
   */
  private bytesToText(bytes: number[]): string {
    try {
      return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
    } catch {
      return String.fromCharCode(...bytes);
    }
  }

  /**
   * 파인더 마스크를 생성합니다.
   * @returns 파인더 마스크 배열
   */
  public createFinderMask(): Array<{ row: number; col: number }> {
    const finderPositions = this.detectFinderPositions();
    const alignmentPositions = this.detectAlignmentPositions();
    const maskPositions: Array<{ row: number; col: number }> = [];

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const inFinder = finderPositions.some(({ rowStart, colStart }) => {
          return row >= rowStart && row < rowStart + 7 && col >= colStart && col < colStart + 7;
        });

        if (inFinder) {
          maskPositions.push({ row, col });
          continue;
        }

        const inAlignment = alignmentPositions.some(({ row: alignRow, col: alignCol }) => {
          return (
            row >= alignRow - 2 && row <= alignRow + 2 && col >= alignCol - 2 && col <= alignCol + 2
          );
        });

        if (inAlignment) {
          maskPositions.push({ row, col });
        }
      }
    }

    return maskPositions;
  }

  /**
   * 타이밍 마스크를 생성합니다.
   * @returns 타이밍 마스크 배열
   */
  public createTimingMask(): Array<{ row: number; col: number }> {
    const maskPositions: Array<{ row: number; col: number }> = [];

    for (let col = 8; col <= this.size - 9; col++) {
      maskPositions.push({ row: 6, col });
    }

    for (let row = 8; row <= this.size - 9; row++) {
      maskPositions.push({ row, col: 6 });
    }

    return maskPositions;
  }

  /**
   * 포맷 마스크를 생성합니다.
   * @returns 포맷 마스크 배열
   */
  public createFormatMask(): Array<{ row: number; col: number }> {
    const maskPositions: Array<{ row: number; col: number }> = [];

    for (let col = 0; col <= 5; col++) maskPositions.push({ row: 8, col });
    maskPositions.push({ row: 8, col: 7 });
    maskPositions.push({ row: 8, col: 8 });
    for (let row = 0; row <= 5; row++) maskPositions.push({ row, col: 8 });
    maskPositions.push({ row: 7, col: 8 });
    for (let col = this.size - 1; col >= this.size - 8; col--) maskPositions.push({ row: 8, col });
    for (let row = this.size - 1; row >= this.size - 8; row--) maskPositions.push({ row, col: 8 });

    return maskPositions;
  }

  /**
   * 데이터 마스크를 생성합니다.
   * @returns 데이터 마스크 배열
   */
  public createDataMask(): Array<{ row: number; col: number }> {
    return this.getDataModuleCoordinates();
  }

  /**
   * ECC 마스크를 생성합니다.
   * @returns ECC 마스크 배열
   */
  public createECCMask(): Array<{ row: number; col: number }> {
    const dataCoords = this.getDataModuleCoordinates();

    const { eccLevel } = this.decodeFormatInfo();
    const eccLevelShort = eccLevel.split(" ")[0] as ECLevel;
    const eccInfo = ECC_TABLE[this.version]?.[eccLevelShort];

    const totalDataCodewords = eccInfo.totalDataCodewords;

    const totalDataBits = totalDataCodewords * 8;
    const eccCoords = dataCoords.slice(totalDataBits);

    return eccCoords;
  }

  /**
   * ECC 상세 정보를 가져옵니다.
   * @param unmaskedDataBits 데이터 비트
   * @returns ECC 상세 정보
   */
  public getECCDetail(unmaskedDataBits?: string) {
    const { eccLevel } = this.decodeFormatInfo();
    const eccLevelShort = eccLevel.split(" ")[0] as ECLevel;
    const eccInfo = ECC_TABLE[this.version]?.[eccLevelShort];
    if (!eccInfo) return undefined;

    const totalDataCodewords = eccInfo.totalDataCodewords;
    const totalECCCodewords =
      eccInfo.ecCodewordsPerBlock * (eccInfo.numBlocksGroup1 + eccInfo.numBlocksGroup2);
    const totalCodewords = totalDataCodewords + totalECCCodewords;

    const totalDataBits = totalDataCodewords * 8;
    const totalECCBits = totalECCCodewords * 8;

    let fullBits = unmaskedDataBits;
    if (!fullBits) {
      const dataPositions = this.getDataModuleCoordinates();
      const { maskPattern } = this.decodeFormatInfo();
      const dataMask = DATA_MASK_PATTERNS[maskPattern];
      fullBits = dataPositions
        .map(({ row, col }) =>
          dataMask(row, col) ? this.matrix[row][col] ^ 1 : this.matrix[row][col],
        )
        .join("");
    }

    const dataBits = fullBits.slice(0, totalDataBits);
    const eccBitsStr = fullBits.slice(totalDataBits, totalDataBits + totalECCBits);

    const dataBytes = dataBits.match(/.{1,8}/g)?.map((byte) => parseInt(byte, 2) & 0xff) || [];
    const dataCodewords = dataBytes.slice(0, totalDataCodewords);
    const eccBytes = eccBitsStr.match(/.{1,8}/g)?.map((byte) => parseInt(byte, 2) & 0xff) || [];

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
      eccInfo,
      totalDataCodewords,
      totalECCCodewords,
      totalCodewords,
      totalDataBits,
      totalECCBits,
      dataBits,
      eccBitsStr,
      dataBytes,
      dataCodewords,
      eccBytes,
      correctedDataCodewords,
      correctedECCCodewords,
      errorCount,
      correctionSuccess,
    };
  }

  /**
   * QR 코드를 디코딩합니다.
   * @returns 디코딩 결과
   */
  public decode(): QRDecodeResult {
    const finderPositions = this.detectFinderPositions();
    const alignmentPositions = this.detectAlignmentPositions();

    const formatPositions = this.detectFormatPositions();
    const formatInfo = this.decodeFormatInfo();
    const rawFormatBits = formatInfo.rawBits;
    const unmaskedFormatBits = formatInfo.unmaskedBits;
    const eccLevel = formatInfo.eccLevel;
    const maskPattern = formatInfo.maskPattern;

    const timingPositions = this.detectTimingPositions();

    const dataPositions = this.getDataModuleCoordinates();
    const maskedDataBits = dataPositions.map(({ row, col }) => this.matrix[row][col]).join("");

    const dataMask = DATA_MASK_PATTERNS[maskPattern];
    const unmaskedDataBits = dataPositions
      .map(({ row, col }) => {
        const originalValue = this.matrix[row][col];
        const shouldMask = dataMask(row, col);
        const maskedValue = shouldMask ? originalValue ^ 1 : originalValue;
        return maskedValue;
      })
      .join("");

    const eccDetail = this.getECCDetail(unmaskedDataBits);
    const eccCorrected = eccDetail?.correctedDataCodewords || [];
    const eccErrorCount = eccDetail?.errorCount || 0;

    let mode = "(Unknown)";
    let modeBits = "";
    let characterCount = 0;
    let decodedText = "(없음)";

    let dataToDecode = unmaskedDataBits;
    if (eccDetail?.correctionSuccess && eccDetail.correctedDataCodewords) {
      const correctedBits = eccDetail.correctedDataCodewords
        .map((codeword) => codeword.toString(2).padStart(8, "0"))
        .join("");
      dataToDecode = correctedBits;
    }

    if (dataToDecode && dataToDecode.length >= 4) {
      modeBits = dataToDecode.slice(0, 4);
      mode = MODE_MAP[modeBits] || "(Unknown)";

      const charCountBitsLen = CHARACTER_COUNT_BITS_MAP[mode]?.[this.version] || 0;

      if (charCountBitsLen > 0 && dataToDecode.length >= 4 + charCountBitsLen) {
        const countBits = dataToDecode.slice(4, 4 + charCountBitsLen);
        characterCount = parseInt(countBits, 2);

        const dataBitsStart = 4 + charCountBitsLen;
        const dataBits = dataToDecode.slice(dataBitsStart);

        if (mode === "Byte" && characterCount > 0) {
          const bytes = this.bitsToBytes(dataBits, characterCount);
          decodedText = this.bytesToText(bytes);
        } else if (mode === "Alphanumeric" && characterCount > 0) {
          decodedText = this.decodeAlphanumeric(dataBits, characterCount);
        }
      }
    }

    return {
      matrix: this.matrix,
      size: this.size,
      version: this.version,
      finderPositions,
      alignmentPositions,
      formatPositions,
      rawFormatBits,
      unmaskedFormatBits,
      eccLevel,
      maskPattern,
      timingPositions,
      dataPositions,
      maskedDataBits,
      unmaskedDataBits,
      mode,
      modeBits,
      characterCount,
      decodedText,
      eccCorrected,
      eccErrorCount,
      ...eccDetail,
    };
  }
}
