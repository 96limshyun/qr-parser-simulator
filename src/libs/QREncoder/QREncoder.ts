import { MODE_DETECTION_RULES } from "./constants/modeDetectionRules";

import type { ErrorCorrectionLevel, Mode } from "@/types/versionCapacityTableType";

import { ECC_TABLE } from "@/constants/eccTable";
import { VERSION_CAPACITY_TABLE } from "@/constants/versionCapacityTable";
import { QREncodingStrategy } from "@/libs/QREncoder/QREncodingStrategy";

export class QREncoder {
  private qrEncodingStrategy: QREncodingStrategy;

  constructor() {
    this.qrEncodingStrategy = new QREncodingStrategy();
  }
  getMode(text: string) {
    const foundMode = MODE_DETECTION_RULES.find(({ regex }) => regex.test(text));
    const mode = foundMode ? foundMode.mode : "Byte";
    const modeIndicatorBits = foundMode ? foundMode.modeIndicatorBits : "0100";

    return { mode, modeIndicatorBits };
  }

  getSmallestVersion(text: string, errorCorrectionLevel: ErrorCorrectionLevel) {
    const { mode } = this.getMode(text);

    for (let version = 1; version <= 40; version++) {
      const capacity = VERSION_CAPACITY_TABLE[version]?.[errorCorrectionLevel]?.[mode as Mode];
      if (capacity !== undefined && text.length <= capacity) {
        return version;
      }
    }
    return 1;
  }

  getCharCountBitLength(version: number, mode: Mode, text: string) {
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
    return text.length.toString(2).padStart(charCountBitLength, "0");
  }

  getTotalBits(version: number, errorCorrectionLevel: ErrorCorrectionLevel) {
    const eccInfo = ECC_TABLE[version]?.[errorCorrectionLevel];
    return eccInfo.totalDataCodewords * 8;
  }

  createInitialBitStream(
    text: string,
    mode: string,
    modeIndicatorBits: string,
    version: number,
  ): string {
    return (
      modeIndicatorBits
      + this.getCharCountBitLength(version, mode as Mode, text)
      + this.qrEncodingStrategy.encodeUsingSelectedMode(text, mode as Mode)
    );
  }

  addTerminatorBits(bitstream: string, totalBits: number): string {
    const remaining = totalBits - bitstream.length;

    if (remaining < 0) {
      throw new Error(
        `비트스트림 길이(${bitstream.length})가 총 용량(${totalBits})을 초과합니다. 더 높은 버전이나 더 낮은 에러 정정 레벨이 필요합니다.`,
      );
    }

    const terminatorLength = Math.min(4, remaining);
    return bitstream + "0".repeat(terminatorLength);
  }

  addBytePadding(bitstream: string): string {
    const extraBits = bitstream.length % 8;
    if (extraBits !== 0) {
      return bitstream + "0".repeat(8 - extraBits);
    }
    return bitstream;
  }

  addPaddingBytes(bitstream: string, totalBits: number): string {
    const padBytes = ["11101100", "00010001"];
    let result = bitstream;
    let i = 0;

    while (result.length + 8 <= totalBits) {
      result += padBytes[i % 2];
      i++;
    }

    const remainingBits = totalBits - result.length;
    if (remainingBits > 0) {
      result += padBytes[i % 2].slice(0, remainingBits);
    }

    return result;
  }

  adjustBitStreamLength(bitstream: string, totalBits: number): string {
    if (bitstream.length > totalBits) {
      return bitstream.slice(0, totalBits);
    }
    return bitstream;
  }

  buildBitStream(text: string, errorCorrectionLevel: ErrorCorrectionLevel): string {
    const { mode, modeIndicatorBits } = this.getMode(text);
    const version = this.getSmallestVersion(text, errorCorrectionLevel);
    const totalBits = this.getTotalBits(version, errorCorrectionLevel);

    let bitstream = this.createInitialBitStream(text, mode, modeIndicatorBits, version);
    bitstream = this.addTerminatorBits(bitstream, totalBits);
    bitstream = this.addBytePadding(bitstream);
    bitstream = this.addPaddingBytes(bitstream, totalBits);
    bitstream = this.adjustBitStreamLength(bitstream, totalBits);

    return bitstream;
  }
}
