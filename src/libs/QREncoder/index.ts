import GenericGF from "@zxing/library/esm/core/common/reedsolomon/GenericGF";
import ReedSolomonEncoder from "@zxing/library/esm/core/common/reedsolomon/ReedSolomonEncoder";

import { MODE_DETECTION_RULES } from "./constants/modeDetectionRules";

import type { QREncoderResult } from "./types/QREncoderResult";
import type { ECLevel } from "@/types/ECCTable";
import type { Mode, ErrorCorrectionLevel } from "@/types/versionCapacityTableType";

import { ALPHANUMERIC_TABLE } from "@/constants/alphanumericTable";
import { ECC_TABLE } from "@/constants/eccTable";
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

  public encode(): QREncoderResult {
    const smallestVersion = this.getSmallestVersion();
    const bitStream = this.buildBitStream();
    const eccResult = this.generateECC();

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
    };
  }
}
