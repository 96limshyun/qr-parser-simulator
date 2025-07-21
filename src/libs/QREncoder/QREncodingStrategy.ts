import type { Mode } from "@/types/versionCapacityTableType";

import { ALPHANUMERIC_TABLE } from "@/constants/alphanumericTable";

export class QREncodingStrategy {
  /**
   * 대문자 특수문자 알파벳 문자열을 인코딩합니다.
   * @param data - 인코딩할 문자열
   * @returns 인코딩된 문자열
   */
  public encodeAlphanumeric(data: string): string {
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

  /**
   * 숫자 문자열을 인코딩합니다.
   * @param data - 인코딩할 문자열
   * @returns 인코딩된 문자열
   */
  public encodeNumeric(data: string): string {
    let bits = "";
    for (let i = 0; i < data.length; i += 3) {
      const chunk = data.slice(i, i + 3);
      if (chunk.length === 3) {
        bits += parseInt(chunk, 10).toString(2).padStart(10, "0");
      } else if (chunk.length === 2) {
        bits += parseInt(chunk, 10).toString(2).padStart(7, "0");
      } else {
        bits += parseInt(chunk, 10).toString(2).padStart(4, "0");
      }
    }
    return bits;
  }
  // 123 456 789 0
  /**
   * 바이트 문자열을 인코딩합니다.
   * @param data - 인코딩할 문자열
   * @returns 인코딩된 문자열
   */
  public encodeByte(data: string): string {
    let bits = "";
    const encoder = new TextEncoder();
    const encoded = encoder.encode(data);
    for (let i = 0; i < encoded.length; i++) {
      bits += encoded[i].toString(2).padStart(8, "0");
    }
    return bits;
  }

  /**
   * 선택된 모드에 따라 문자열을 인코딩합니다.
   * @param data - 인코딩할 문자열
   * @param mode - 인코딩할 모드
   * @returns 인코딩된 문자열
   */
  public encodeUsingSelectedMode(data: string, mode: Mode) {
    switch (mode) {
      case "Numeric":
        return this.encodeNumeric(data);
      case "Alphanumeric":
        return this.encodeAlphanumeric(data);
      case "Byte":
        return this.encodeByte(data);
    }
  }
}
