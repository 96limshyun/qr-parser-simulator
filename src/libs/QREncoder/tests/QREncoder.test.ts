import { describe, it, expect } from "vitest";

import { qr } from "@/libs/QR";

const NUMERIC_TEXT = "1234567890";
const ALPHANUMERIC_TEXT = "HELLO1234 ";
const BYTE_TEXT = "Hello!@#한글";

describe("Numeric 모드", () => {
  it("Numeric 모드의 모드 인디케이터 비트는 0001이 되어야 한다", () => {
    const { modeIndicatorBits } = qr.qrEncoder.getMode(NUMERIC_TEXT);
    expect(modeIndicatorBits).toBe("0001");
  });

  it("Numeric 모드의 mode는 Numeric이 되어야 한다", () => {
    const { mode } = qr.qrEncoder.getMode(NUMERIC_TEXT);
    expect(mode).toBe("Numeric");
  });

  it("Numeric 모드의 최소 버전은 1이 되어야 한다", () => {
    const version = qr.qrEncoder.getSmallestVersion(NUMERIC_TEXT, "L");
    expect(version).toBe(1);
  });
  it("Numeric 모드의 문자 수 비트 길이는 10자 이하인 경우 10비트가 되어야 한다", () => {
    const charCountBitLength = qr.qrEncoder.getCharCountBitLength(1, "Numeric", NUMERIC_TEXT);
    expect(charCountBitLength).toBe("0000001010");
  });

  it("버전 1 L 에러레벨의 총 비트 수는 152가 되어야 한다", () => {
    const totalBits = qr.qrEncoder.getTotalBits(1, "L");
    expect(totalBits).toBe(152);
  });

  it("버전 1 L 에러레벨의 비트스트림은 000100000010100001111011011100100011000101010000 이 되어야 한다", () => {
    const bitStream = qr.qrEncoder.createInitialBitStream(NUMERIC_TEXT, "Numeric", "0001", 1);
    expect(bitStream).toBe("000100000010100001111011011100100011000101010000");
  });

  it("버전 1 L 에러레벨의 비트스트림은 모자란 터미네이터 비트를 추가해야 한다", () => {
    const bitStream = qr.qrEncoder.createInitialBitStream(NUMERIC_TEXT, "Numeric", "0001", 1);
    const totalBits = qr.qrEncoder.getTotalBits(1, "L");
    const bitStreamWithTerminator = qr.qrEncoder.addTerminatorBits(bitStream, totalBits);
    expect(bitStreamWithTerminator).toBe("0001000000101000011110110111001000110001010100000000");
  });

  it("비트스트림 길이가 8의 배수가 아니면 모자란 만큼 패딩 비트를 추가해야 한다", () => {
    const bitStream = qr.qrEncoder.createInitialBitStream(NUMERIC_TEXT, "Numeric", "0001", 1);
    const totalBits = qr.qrEncoder.getTotalBits(1, "L");
    const bitStreamWithTerminator = qr.qrEncoder.addTerminatorBits(bitStream, totalBits);
    const bitStreamWithPadding = qr.qrEncoder.addBytePadding(bitStreamWithTerminator);

    expect(bitStreamWithPadding).toBe("00010000001010000111101101110010001100010101000000000000");
  });

  it("비트스트림이 최대 용량보다 작으면 패딩 비트를 추가해 최대 용량을 채워야 한다", () => {
    const bitStream = qr.qrEncoder.createInitialBitStream(NUMERIC_TEXT, "Numeric", "0001", 1);
    const totalBits = qr.qrEncoder.getTotalBits(1, "L");
    const bitStreamWithTerminator = qr.qrEncoder.addTerminatorBits(bitStream, totalBits);
    const bitStreamWithPadding = qr.qrEncoder.addBytePadding(bitStreamWithTerminator);
    const bitStreamWithPaddingBytes = qr.qrEncoder.addPaddingBytes(bitStreamWithPadding, totalBits);

    expect(bitStreamWithPaddingBytes.length).toBe(totalBits);
  });

  it("버전 1 L 에러레벨의 최종 비트스트림은 00010000001010000111101101110010001100010101000000000000111011000001000111101100000100011110110000010001111011000001000111101100000100011110110000010001이 되어야 한다", () => {
    const bitStream = qr.qrEncoder.buildBitStream(NUMERIC_TEXT, "L");
    expect(bitStream).toBe(
      "00010000001010000111101101110010001100010101000000000000111011000001000111101100000100011110110000010001111011000001000111101100000100011110110000010001",
    );
  });
});

describe("Alphanumeric 모드", () => {
  it("Alphanumeric 모드의 모드 인디케이터 비트는 0010이 되어야 한다", () => {
    const { modeIndicatorBits } = qr.qrEncoder.getMode(ALPHANUMERIC_TEXT);
    expect(modeIndicatorBits).toBe("0010");
  });

  it("Alphanumeric 모드의 mode는 Alphanumeric이 되어야 한다", () => {
    const { mode } = qr.qrEncoder.getMode(ALPHANUMERIC_TEXT);
    expect(mode).toBe("Alphanumeric");
  });

  it("Alphanumeric 모드의 최소 버전은 1이 되어야 한다", () => {
    const version = qr.qrEncoder.getSmallestVersion(ALPHANUMERIC_TEXT, "L");
    expect(version).toBe(1);
  });

  it("Alphanumeric 모드의 문자 수 비트 길이는 10자 이하인 경우 9비트가 되어야 한다", () => {
    const charCountBitLength = qr.qrEncoder.getCharCountBitLength(
      1,
      "Alphanumeric",
      ALPHANUMERIC_TEXT,
    );
    expect(charCountBitLength).toBe("000001010");
  });

  it("버전 1 M 에러레벨의 총 비트 수는 152가 되어야 한다", () => {
    const totalBits = qr.qrEncoder.getTotalBits(1, "M");
    expect(totalBits).toBe(128);
  });

  it("버전 1 H 에러레벨의 비트스트림은 00100000010100110000101101111000110100001110010000101110100011011000 이 되어야 한다", () => {
    const bitStream = qr.qrEncoder.createInitialBitStream(
      ALPHANUMERIC_TEXT,
      "Alphanumeric",
      "0010",
      1,
    );
    expect(bitStream).toBe("00100000010100110000101101111000110100001110010000101110100011011000");
  });

  it("버전 1 H 에러레벨의 비트스트림은 모자란 터미네이터 비트를 추가해야 한다", () => {
    const bitStream = qr.qrEncoder.createInitialBitStream(
      ALPHANUMERIC_TEXT,
      "Alphanumeric",
      "0010",
      1,
    );
    const totalBits = qr.qrEncoder.getTotalBits(1, "H");
    const bitStreamWithTerminator = qr.qrEncoder.addTerminatorBits(bitStream, totalBits);
    expect(bitStreamWithTerminator).toBe(
      "001000000101001100001011011110001101000011100100001011101000110110000000",
    );
  });

  it("버전 1 H 에러레벨의 비트스트림은 8의 배수이므로 패딩 비트를 추가하지 않아야 한다", () => {
    const bitStream = qr.qrEncoder.createInitialBitStream(
      ALPHANUMERIC_TEXT,
      "Alphanumeric",
      "0010",
      1,
    );
    const totalBits = qr.qrEncoder.getTotalBits(1, "H");
    const bitStreamWithTerminator = qr.qrEncoder.addTerminatorBits(bitStream, totalBits);
    const bitStreamWithPadding = qr.qrEncoder.addBytePadding(bitStreamWithTerminator);

    expect(bitStreamWithPadding).toBe(
      "001000000101001100001011011110001101000011100100001011101000110110000000",
    );
  });

  it("비트스트림이 최대 용량보다 작으면 패딩 비트를 추가해 최대 용량을 채워야 한다", () => {
    const bitStream = qr.qrEncoder.createInitialBitStream(
      ALPHANUMERIC_TEXT,
      "Alphanumeric",
      "0010",
      1,
    );
    const totalBits = qr.qrEncoder.getTotalBits(1, "H");
    const bitStreamWithTerminator = qr.qrEncoder.addTerminatorBits(bitStream, totalBits);
    const bitStreamWithPadding = qr.qrEncoder.addBytePadding(bitStreamWithTerminator);
    const bitStreamWithPaddingBytes = qr.qrEncoder.addPaddingBytes(bitStreamWithPadding, totalBits);

    expect(bitStreamWithPaddingBytes.length).toBe(totalBits);
  });

  it("버전 1 H 에러레벨의 최종 비트스트림은 001000000101001100001011011110001101000011100100001011101000110110000000이 되어야 한다", () => {
    const bitStream = qr.qrEncoder.buildBitStream(ALPHANUMERIC_TEXT, "H");
    expect(bitStream).toBe(
      "001000000101001100001011011110001101000011100100001011101000110110000000",
    );
  });
});

describe("Byte 모드", () => {
  it("Byte 모드의 모드 인디케이터 비트는 0100이 되어야 한다", () => {
    const { modeIndicatorBits } = qr.qrEncoder.getMode(BYTE_TEXT);
    expect(modeIndicatorBits).toBe("0100");
  });

  it("Byte 모드의 mode는 Byte이 되어야 한다", () => {
    const { mode } = qr.qrEncoder.getMode(BYTE_TEXT);
    expect(mode).toBe("Byte");
  });

  it("Byte 모드의 최소 버전은 1이 되어야 한다", () => {
    const version = qr.qrEncoder.getSmallestVersion(BYTE_TEXT, "L");
    expect(version).toBe(1);
  });

  it("Byte 모드의 문자 수 비트 길이는 10자 이하인 경우 8비트가 되어야 한다", () => {
    const charCountBitLength = qr.qrEncoder.getCharCountBitLength(1, "Byte", BYTE_TEXT);
    expect(charCountBitLength).toBe("00001010");
  });

  it("버전 1 L 에러레벨의 총 비트 수는 152가 되어야 한다", () => {
    const totalBits = qr.qrEncoder.getTotalBits(1, "L");
    expect(totalBits).toBe(152);
  });

  it("버전 1 H 에러레벨의 총 비트 수는 152가 되어야 한다", () => {
    const totalBits = qr.qrEncoder.getTotalBits(1, "H");
    expect(totalBits).toBe(72);
  });

  it("버전 1 H 에러레벨의 비트스트림은 0100000010100100100001100101011011000110110001101111001000010100000000100011111011011001010110011100111010101011100010000000 이 되어야 한다", () => {
    const bitStream = qr.qrEncoder.createInitialBitStream(BYTE_TEXT, "Byte", "0100", 1);
    expect(bitStream).toBe(
      "0100000010100100100001100101011011000110110001101111001000010100000000100011111011011001010110011100111010101011100010000000",
    );
  });

  it("버전 1 H 에러레벨의 비트스트림은 용량을 초과하므로 에러가 발생해야 한다", () => {
    const bitStream = qr.qrEncoder.createInitialBitStream(BYTE_TEXT, "Byte", "0100", 1);
    const totalBits = qr.qrEncoder.getTotalBits(1, "H");

    expect(() => {
      qr.qrEncoder.addTerminatorBits(bitStream, totalBits);
    }).toThrow("비트스트림 길이");
  });

  it("버전 1 L 에러레벨에서는 비트스트림이 모자란 터미네이터 비트를 추가해야 한다", () => {
    const bitStream = qr.qrEncoder.createInitialBitStream(BYTE_TEXT, "Byte", "0100", 1);
    const totalBits = qr.qrEncoder.getTotalBits(1, "L");
    const bitStreamWithTerminator = qr.qrEncoder.addTerminatorBits(bitStream, totalBits);

    expect(bitStreamWithTerminator.length).toBeGreaterThan(bitStream.length);
    expect(bitStreamWithTerminator.startsWith(bitStream)).toBe(true);
  });

  it("버전 1 L 에러레벨의 비트스트림은 8의 배수이므로 패딩 비트를 추가하지 않아야 한다", () => {
    const bitStream = qr.qrEncoder.createInitialBitStream(BYTE_TEXT, "Byte", "0100", 1);
    const totalBits = qr.qrEncoder.getTotalBits(1, "L");
    const bitStreamWithTerminator = qr.qrEncoder.addTerminatorBits(bitStream, totalBits);
    const bitStreamWithPadding = qr.qrEncoder.addBytePadding(bitStreamWithTerminator);

    expect(bitStreamWithPadding).toBe(
      "01000000101001001000011001010110110001101100011011110010000101000000001000111110110110010101100111001110101010111000100000000000",
    );
  });

  it("비트스트림이 최대 용량보다 작으면 패딩 비트를 추가해야 한다", () => {
    const bitStream = qr.qrEncoder.createInitialBitStream(BYTE_TEXT, "Byte", "0100", 1);
    const totalBits = qr.qrEncoder.getTotalBits(1, "L");
    const bitStreamWithTerminator = qr.qrEncoder.addTerminatorBits(bitStream, totalBits);
    const bitStreamWithPadding = qr.qrEncoder.addBytePadding(bitStreamWithTerminator);
    const bitStreamWithPaddingBytes = qr.qrEncoder.addPaddingBytes(bitStreamWithPadding, totalBits);

    expect(bitStreamWithPaddingBytes.length).toBe(totalBits);
    expect(bitStreamWithPaddingBytes.startsWith(bitStream)).toBe(true);
  });
});

describe("ECC 관련 함수", () => {
  it("convertToCodewords: 8비트 단위로 코드워드 변환해야한다.", () => {
    const bits = "1100110001010101";
    const codewords = qr.qrEncoder.convertToCodewords(bits);
    expect(codewords).toEqual([204, 85]);
  });

  it("prepareDataAndECCInfo: 데이터 코드워드와 ECC 정보 반환해야한다.", () => {
    const bits = "1100110001010101";
    const version = 1;
    const ecLevel = "L";
    const { dataCw, shardLen, eccLen } = qr.qrEncoder.prepareDataAndECCInfo(bits, version, ecLevel);
    expect(dataCw).toEqual([204, 85]);
    expect(shardLen).toBe(19);
    expect(eccLen).toBe(7);
  });

  it("generateECCCodewords: ECC 코드워드 생성해야한다.", () => {
    const dataCw = Array(19).fill(1);
    const shardLen = 19;
    const eccLen = 7;
    const eccCw = qr.qrEncoder.generateECCCodewords(dataCw, shardLen, eccLen);
    expect(eccCw.length).toBe(eccLen);
  });

  it("combineFinalCodewords: 데이터+ECC 코드워드 결합해야한다.", () => {
    const dataCw = [1, 2, 3];
    const eccCw = [4, 5];
    const shardLen = 3;
    const finalCw = qr.qrEncoder.combineFinalCodewords(dataCw, eccCw, shardLen);
    expect(finalCw).toEqual([1, 2, 3, 4, 5]);
  });

  it("createFinalBitStream: 코드워드 배열을 비트스트림으로 변환해야한다.", () => {
    const finalCw = [2, 255];
    const bits = qr.qrEncoder.createFinalBitStream(finalCw);
    expect(bits).toBe("0000001011111111");
  });
});
