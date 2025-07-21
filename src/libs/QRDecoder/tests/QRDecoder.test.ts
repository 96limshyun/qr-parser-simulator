import { describe, it, expect } from "vitest";

import { TEST_MATRIX_21_BY_21, TEST_MATRIX_25_BY_25 } from "@/constants/testMatrix";
import { qr } from "@/libs/QR";

describe("getVersionByMatrixSize", () => {
  it("다양한 매트릭스 크기에 대한 버전 계산이 올바르게 되어야 한다.", () => {
    expect(qr.qrDecoder.getVersionByMatrixSize(21)).toBe(1);
    expect(qr.qrDecoder.getVersionByMatrixSize(25)).toBe(2);
    expect(qr.qrDecoder.getVersionByMatrixSize(29)).toBe(3);
    expect(qr.qrDecoder.getVersionByMatrixSize(33)).toBe(4);
    expect(qr.qrDecoder.getVersionByMatrixSize(37)).toBe(5);
  });

  it("버전 계산 공식이 1~40 까지 올바르게 작동해야 한다.", () => {
    for (let version = 1; version <= 40; version++) {
      const size = 21 + (version - 1) * 4;
      const calculatedVersion = qr.qrDecoder.getVersionByMatrixSize(size);
      expect(calculatedVersion).toBe(version);
    }
  });
});

describe("21x21 matrix", () => {
  it("21x21 매트릭스의 버전은 1이 되어야 한다.", () => {
    const version = qr.qrDecoder.getVersionByMatrixSize(TEST_MATRIX_21_BY_21.length);
    expect(version).toBe(1);
  });

  it("21x21 매트릭스의 파인더 패턴은 147개가 되어야 한다.", () => {
    const finderPositions = qr.qrDecoder.detectFinderPositions(TEST_MATRIX_21_BY_21);
    expect(finderPositions.length).toBe(147);
  });

  it("21x21 매트릭스의 파인더 패턴 위치가 올바르게 검출되어야 한다.", () => {
    const finderPositions = qr.qrDecoder.detectFinderPositions(TEST_MATRIX_21_BY_21);

    const expectedPositions = [
      { row: 0, col: 0 },
      { row: 0, col: 14 },
      { row: 14, col: 0 },
    ];

    expect(finderPositions).toEqual(expect.arrayContaining(expectedPositions));
  });

  it("21x21 매트릭스의 알리멘테이션 패턴은 0개가 되어야 한다.", () => {
    const alignmentPositions = qr.qrDecoder.detectAlignmentPositions(TEST_MATRIX_21_BY_21);
    expect(alignmentPositions.length).toBe(0);
  });

  it("21x21 매트릭스의 타이밍 패턴은 10개가 되어야 한다.", () => {
    const timingPositions = qr.qrDecoder.detectTimingPositions(TEST_MATRIX_21_BY_21);
    expect(timingPositions.length).toBe(10);
  });

  it("21x21 매트릭스의 타이밍 패턴 위치가 올바르게 검출되어야 한다.", () => {
    const timingPositions = qr.qrDecoder.detectTimingPositions(TEST_MATRIX_21_BY_21);

    expect(timingPositions).toEqual([
      { row: 6, col: 8, value: 1 },
      { row: 6, col: 9, value: 0 },
      { row: 6, col: 10, value: 1 },
      { row: 6, col: 11, value: 0 },
      { row: 6, col: 12, value: 1 },
      { row: 8, col: 6, value: 1 },
      { row: 9, col: 6, value: 0 },
      { row: 10, col: 6, value: 1 },
      { row: 11, col: 6, value: 0 },
      { row: 12, col: 6, value: 1 },
    ]);
  });

  it("21x21 매트릭스의 포맷 패턴은 30개가 되어야 한다.", () => {
    const formatPositions = qr.qrDecoder.detectFormatPositions(TEST_MATRIX_21_BY_21);
    expect(formatPositions.length).toBe(30);
  });

  it("21x21 매트릭스의 포맷 패턴 위치가 올바르게 검출되어야 한다.", () => {
    const formatPositions = qr.qrDecoder.detectFormatPositions(TEST_MATRIX_21_BY_21);
    expect(formatPositions).toEqual([
      { row: 8, col: 0, value: 1 },
      { row: 8, col: 1, value: 1 },
      { row: 8, col: 2, value: 1 },
      { row: 8, col: 3, value: 1 },
      { row: 8, col: 4, value: 1 },
      { row: 8, col: 5, value: 0 },
      { row: 8, col: 7, value: 1 },
      { row: 8, col: 8, value: 1 },
      { row: 7, col: 8, value: 0 },
      { row: 5, col: 8, value: 1 },
      { row: 4, col: 8, value: 0 },
      { row: 3, col: 8, value: 1 },
      { row: 2, col: 8, value: 0 },
      { row: 1, col: 8, value: 1 },
      { row: 0, col: 8, value: 0 },

      { row: 20, col: 8, value: 1 },
      { row: 19, col: 8, value: 1 },
      { row: 18, col: 8, value: 1 },
      { row: 17, col: 8, value: 1 },
      { row: 16, col: 8, value: 1 },
      { row: 15, col: 8, value: 0 },
      { row: 14, col: 8, value: 1 },
      { row: 8, col: 13, value: 1 },
      { row: 8, col: 14, value: 0 },
      { row: 8, col: 15, value: 1 },
      { row: 8, col: 16, value: 0 },
      { row: 8, col: 17, value: 1 },
      { row: 8, col: 18, value: 0 },
      { row: 8, col: 19, value: 1 },
      { row: 8, col: 20, value: 0 },
    ]);
  });

  it("21x21 매트릭스의 separator 패턴은 45개가 되어야 한다.", () => {
    const separatorPositions = qr.qrDecoder.detectSeparatorPositions(TEST_MATRIX_21_BY_21);
    expect(separatorPositions.length).toBe(45);
  });

  it("21x21 매트릭스의 다크 모듈 위치가 13, 8 위치에 검출되어야 한다.", () => {
    const darkModule = qr.qrDecoder.detectDarkModulePosition(TEST_MATRIX_21_BY_21);

    expect(darkModule).toEqual({
      row: 13,
      col: 8,
      value: TEST_MATRIX_21_BY_21[13][8],
    });
  });

  it("21x21 매트릭스의 파인더 패턴 영역은 예약된 영역이여야 한다.", () => {
    expect(qr.qrDecoder.isReserved(0, 0, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(3, 3, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(6, 6, TEST_MATRIX_21_BY_21)).toBe(true);

    expect(qr.qrDecoder.isReserved(0, 14, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(3, 17, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(6, 20, TEST_MATRIX_21_BY_21)).toBe(true);

    expect(qr.qrDecoder.isReserved(14, 0, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(17, 3, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(20, 6, TEST_MATRIX_21_BY_21)).toBe(true);
  });

  it("21x21 매트릭스의 타이밍 패턴 영역은 예약된 영역이여야 한다.", () => {
    expect(qr.qrDecoder.isReserved(6, 8, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(6, 12, TEST_MATRIX_21_BY_21)).toBe(true);

    expect(qr.qrDecoder.isReserved(8, 6, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(12, 6, TEST_MATRIX_21_BY_21)).toBe(true);
  });

  it("21x21 매트릭스의 포맷 패턴 영역은 예약된 영역이여야 한다.", () => {
    expect(qr.qrDecoder.isReserved(8, 0, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(8, 5, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(8, 7, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(8, 8, TEST_MATRIX_21_BY_21)).toBe(true);

    expect(qr.qrDecoder.isReserved(7, 8, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(0, 8, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(20, 8, TEST_MATRIX_21_BY_21)).toBe(true);
  });

  it("21x21 매트릭스의 separator 영역은 예약된 영역이여야 한다.", () => {
    expect(qr.qrDecoder.isReserved(7, 0, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(7, 7, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(0, 7, TEST_MATRIX_21_BY_21)).toBe(true);
    expect(qr.qrDecoder.isReserved(6, 7, TEST_MATRIX_21_BY_21)).toBe(true);
  });

  it("21x21 매트릭스의 다크 모듈은 예약된 영역이여야 한다.", () => {
    const darkModule = qr.qrDecoder.detectDarkModulePosition(TEST_MATRIX_21_BY_21);
    expect(qr.qrDecoder.isReserved(darkModule.row, darkModule.col, TEST_MATRIX_21_BY_21)).toBe(
      true,
    );
  });

  it("21x21 매트릭스의 데이터 영역은 예약되지 않아야 한다.", () => {
    expect(qr.qrDecoder.isReserved(9, 9, TEST_MATRIX_21_BY_21)).toBe(false);
    expect(qr.qrDecoder.isReserved(10, 10, TEST_MATRIX_21_BY_21)).toBe(false);
    expect(qr.qrDecoder.isReserved(11, 11, TEST_MATRIX_21_BY_21)).toBe(false);
    expect(qr.qrDecoder.isReserved(12, 12, TEST_MATRIX_21_BY_21)).toBe(false);
    expect(qr.qrDecoder.isReserved(20, 20, TEST_MATRIX_21_BY_21)).toBe(false);
  });

  it("21x21 매트릭스의 데이터 영역은 우측 하단부터 지그재그로 검출되어야 한다.", () => {
    const dataPositions = qr.qrDecoder.detectDataPositions(TEST_MATRIX_21_BY_21);
    expect(dataPositions[0]).toEqual({ row: 20, col: 20, value: 0 });
    expect(dataPositions[1]).toEqual({ row: 20, col: 19, value: 0 });
    expect(dataPositions[2]).toEqual({ row: 19, col: 20, value: 1 });
    expect(dataPositions[3]).toEqual({ row: 19, col: 19, value: 0 });
    expect(dataPositions[4]).toEqual({ row: 18, col: 20, value: 0 });
    expect(dataPositions[5]).toEqual({ row: 18, col: 19, value: 0 });
    expect(dataPositions[6]).toEqual({ row: 17, col: 20, value: 0 });
    expect(dataPositions[7]).toEqual({ row: 17, col: 19, value: 0 });
    expect(dataPositions[8]).toEqual({ row: 16, col: 20, value: 0 });
    expect(dataPositions[9]).toEqual({ row: 16, col: 19, value: 1 });
  });

  it("21x21 매트릭스의 포맷 비트는 15개가 되어야 한다.", () => {
    const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_21_BY_21);
    expect(formatBits.length).toBe(15);
  });

  it("21x21 매트릭스의 포맷 비트는 15개가 되어야 한다.", () => {
    const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_21_BY_21);
    expect(formatBits).toBe("111110110101010");
  });

  it("21x21 테스트 매트릭스의 포맷 비트의 마스크 해제 후 비트는 010100110111000으로 검출되어야 한다.", () => {
    const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_21_BY_21);
    const unmasked = qr.qrDecoder.unmaskFormatBits(formatBits);
    expect(unmasked).toBe("010100110111000");
  });

  it("21x21 테스트 매트릭스의 포맷 비트의 ECC 레벨은 01: L로 검출되어야 한다.", () => {
    const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_21_BY_21);
    const ecLevel = qr.qrDecoder.getECLevel(formatBits);
    expect(ecLevel).toBe("L");
  });

  it("21x21 테스트 매트릭스의 포맷 비트의 마스크 패턴 번호는 010비트로 검출되어 10진수 2로 변환되어야 한다.", () => {
    const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_21_BY_21);
    const maskPattern = qr.qrDecoder.getMaskPattern(formatBits);
    expect(maskPattern).toBe(2);
  });

  it("21x21 테스트 매트릭스의 포맷 비트(010100110111000, version: 1, 에러 수준 L, 마스크 패턴 2)의 ECC 정보는 총 19개의 데이터 비트와 7개의 ECC 비트로 검출되어야 한다.", () => {
    const eccInfo = qr.qrDecoder.getErrorCorrectionInfo(TEST_MATRIX_21_BY_21);
    expect(eccInfo?.totalDataCodewords).toBe(19);
    expect(eccInfo?.ecCodewordsPerBlock).toBe(7);
  });

  it("21x21 테스트 매트릭스는 마스크 해체 후 모드는 Alphanumeric이고 문자 개수는 11개로 검출되어 HELLO WORLD 문자열로 디코딩되어야 한다.", () => {
    const decodedText = qr.qrDecoder.decodeBitToText(TEST_MATRIX_21_BY_21);
    expect(decodedText).toBe("HELLO WORLD");
  });
});

describe("25x25 matrix", () => {
  it("25x25 매트릭스의 버전은 2가 되어야 한다.", () => {
    const version = qr.qrDecoder.getVersionByMatrixSize(TEST_MATRIX_25_BY_25.length);
    expect(version).toBe(2);
  });

  it("25x25 매트릭스의 파인더 패턴은 147개가 되어야 한다.", () => {
    const finderPositions = qr.qrDecoder.detectFinderPositions(TEST_MATRIX_25_BY_25);
    expect(finderPositions.length).toBe(147);
  });

  it("25x25 매트릭스의 파인더 패턴 위치가 올바르게 검출되어야 한다.", () => {
    const finderPositions = qr.qrDecoder.detectFinderPositions(TEST_MATRIX_25_BY_25);

    const expectedPositions = [
      { row: 0, col: 0 },
      { row: 0, col: 18 },
      { row: 18, col: 0 },
    ];

    expect(finderPositions).toEqual(expect.arrayContaining(expectedPositions));
  });

  it("25x25 매트릭스의 알리멘테이션 패턴은 25모듈이 되어야 한다.", () => {
    const alignmentPositions = qr.qrDecoder.detectAlignmentPositions(TEST_MATRIX_25_BY_25);
    expect(alignmentPositions.length).toBe(25);
  });

  it("25x25 매트릭스의 알리멘테이션 패턴 위치가 올바르게 검출되어야 한다.", () => {
    const alignmentPositions = qr.qrDecoder.detectAlignmentPositions(TEST_MATRIX_25_BY_25);
    expect(alignmentPositions).toEqual(expect.arrayContaining([{ row: 18, col: 18 }]));
  });

  it("25x25 매트릭스의 타이밍 패턴은 18개가 되어야 한다.", () => {
    const timingPositions = qr.qrDecoder.detectTimingPositions(TEST_MATRIX_25_BY_25);
    expect(timingPositions.length).toBe(18);
  });

  it("25x25 매트릭스의 타이밍 패턴 위치가 올바르게 검출되어야 한다.", () => {
    const timingPositions = qr.qrDecoder.detectTimingPositions(TEST_MATRIX_25_BY_25);
    expect(timingPositions).toEqual([
      { row: 6, col: 8, value: 1 },
      { row: 6, col: 9, value: 0 },
      { row: 6, col: 10, value: 1 },
      { row: 6, col: 11, value: 0 },
      { row: 6, col: 12, value: 1 },
      { row: 6, col: 13, value: 0 },
      { row: 6, col: 14, value: 1 },
      { row: 6, col: 15, value: 0 },
      { row: 6, col: 16, value: 1 },

      { row: 8, col: 6, value: 1 },
      { row: 9, col: 6, value: 0 },
      { row: 10, col: 6, value: 1 },
      { row: 11, col: 6, value: 0 },
      { row: 12, col: 6, value: 1 },
      { row: 13, col: 6, value: 0 },
      { row: 14, col: 6, value: 1 },
      { row: 15, col: 6, value: 0 },
      { row: 16, col: 6, value: 1 },
    ]);
  });

  it("25x25 매트릭스의 포맷 패턴은 30개가 되어야 한다.", () => {
    const formatPositions = qr.qrDecoder.detectFormatPositions(TEST_MATRIX_25_BY_25);
    expect(formatPositions.length).toBe(30);
  });

  it("25x25 매트릭스의 포맷 패턴 위치가 올바르게 검출되어야 한다.", () => {
    const formatPositions = qr.qrDecoder.detectFormatPositions(TEST_MATRIX_25_BY_25);
    expect(formatPositions).toEqual([
      { row: 8, col: 0, value: 0 },
      { row: 8, col: 1, value: 0 },
      { row: 8, col: 2, value: 1 },
      { row: 8, col: 3, value: 1 },
      { row: 8, col: 4, value: 1 },
      { row: 8, col: 5, value: 1 },
      { row: 8, col: 7, value: 1 },
      { row: 8, col: 8, value: 0 },
      { row: 7, col: 8, value: 0 },
      { row: 5, col: 8, value: 1 },
      { row: 4, col: 8, value: 1 },
      { row: 3, col: 8, value: 1 },
      { row: 2, col: 8, value: 1 },
      { row: 1, col: 8, value: 0 },
      { row: 0, col: 8, value: 1 },
      { row: 24, col: 8, value: 0 },
      { row: 23, col: 8, value: 0 },
      { row: 22, col: 8, value: 1 },
      { row: 21, col: 8, value: 1 },
      { row: 20, col: 8, value: 1 },
      { row: 19, col: 8, value: 1 },
      { row: 18, col: 8, value: 1 },
      { row: 8, col: 17, value: 1 },
      { row: 8, col: 18, value: 0 },
      { row: 8, col: 19, value: 1 },
      { row: 8, col: 20, value: 1 },
      { row: 8, col: 21, value: 1 },
      { row: 8, col: 22, value: 1 },
      { row: 8, col: 23, value: 0 },
      { row: 8, col: 24, value: 1 },
    ]);
  });

  it("25x25 매트릭스의 separator 패턴은 45개가 되어야 한다.", () => {
    const separatorPositions = qr.qrDecoder.detectSeparatorPositions(TEST_MATRIX_25_BY_25);
    expect(separatorPositions.length).toBe(45);
  });

  it("25x25 매트릭스의 다크 모듈 위치가 올바르게 검출되어야 한다.", () => {
    const darkModule = qr.qrDecoder.detectDarkModulePosition(TEST_MATRIX_25_BY_25);

    expect(darkModule).toEqual({
      row: 17,
      col: 8,
      value: TEST_MATRIX_25_BY_25[17][8],
    });
  });

  it("25x25 매트릭스의 파인더 패턴 영역은 예약된 영역이여야 한다.", () => {
    expect(qr.qrDecoder.isReserved(0, 0, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(3, 3, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(6, 6, TEST_MATRIX_25_BY_25)).toBe(true);

    expect(qr.qrDecoder.isReserved(0, 18, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(3, 21, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(6, 24, TEST_MATRIX_25_BY_25)).toBe(true);

    expect(qr.qrDecoder.isReserved(18, 0, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(21, 3, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(24, 6, TEST_MATRIX_25_BY_25)).toBe(true);
  });

  it("25x25 매트릭스의 알리먼트 패턴 영역은 예약된 영역이여야 한다.", () => {
    expect(qr.qrDecoder.isReserved(18, 18, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(16, 16, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(20, 20, TEST_MATRIX_25_BY_25)).toBe(true);
  });

  it("25x25 매트릭스의 타이밍 패턴 영역은 예약된 영역이여야 한다.", () => {
    expect(qr.qrDecoder.isReserved(6, 8, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(6, 16, TEST_MATRIX_25_BY_25)).toBe(true);

    expect(qr.qrDecoder.isReserved(8, 6, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(16, 6, TEST_MATRIX_25_BY_25)).toBe(true);
  });

  it("25x25 매트릭스의 포맷 패턴 영역은 예약된 영역이여야 한다.", () => {
    expect(qr.qrDecoder.isReserved(8, 0, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(8, 5, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(8, 7, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(8, 8, TEST_MATRIX_25_BY_25)).toBe(true);

    expect(qr.qrDecoder.isReserved(7, 8, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(0, 8, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(24, 8, TEST_MATRIX_25_BY_25)).toBe(true);
  });

  it("25x25 매트릭스의 separator 영역은 예약된 영역이여야 한다.", () => {
    expect(qr.qrDecoder.isReserved(7, 0, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(7, 7, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(0, 7, TEST_MATRIX_25_BY_25)).toBe(true);
    expect(qr.qrDecoder.isReserved(6, 7, TEST_MATRIX_25_BY_25)).toBe(true);
  });

  it("25x25 매트릭스의 다크 모듈은 예약된 영역이여야 한다.", () => {
    const darkModule = qr.qrDecoder.detectDarkModulePosition(TEST_MATRIX_25_BY_25);
    expect(qr.qrDecoder.isReserved(darkModule.row, darkModule.col, TEST_MATRIX_25_BY_25)).toBe(
      true,
    );
  });

  it("25x25 매트릭스의 데이터 영역은 예약되지 않아야 한다.", () => {
    expect(qr.qrDecoder.isReserved(10, 10, TEST_MATRIX_25_BY_25)).toBe(false);
    expect(qr.qrDecoder.isReserved(15, 15, TEST_MATRIX_25_BY_25)).toBe(false);
    expect(qr.qrDecoder.isReserved(22, 22, TEST_MATRIX_25_BY_25)).toBe(false);
    expect(qr.qrDecoder.isReserved(23, 23, TEST_MATRIX_25_BY_25)).toBe(false);
    expect(qr.qrDecoder.isReserved(24, 24, TEST_MATRIX_25_BY_25)).toBe(false);
  });

  it("25x25 매트릭스의 데이터 영역은 우측 하단부터 지그재그로 검출되어야 한다.", () => {
    const dataPositions = qr.qrDecoder.detectDataPositions(TEST_MATRIX_25_BY_25);
    expect(dataPositions[0]).toEqual({ row: 24, col: 24, value: 1 });
    expect(dataPositions[1]).toEqual({ row: 24, col: 23, value: 1 });
    expect(dataPositions[2]).toEqual({ row: 23, col: 24, value: 1 });
    expect(dataPositions[3]).toEqual({ row: 23, col: 23, value: 0 });
    expect(dataPositions[4]).toEqual({ row: 22, col: 24, value: 1 });
    expect(dataPositions[5]).toEqual({ row: 22, col: 23, value: 0 });
    expect(dataPositions[6]).toEqual({ row: 21, col: 24, value: 0 });
    expect(dataPositions[7]).toEqual({ row: 21, col: 23, value: 0 });
    expect(dataPositions[8]).toEqual({ row: 20, col: 24, value: 1 });
    expect(dataPositions[9]).toEqual({ row: 20, col: 23, value: 1 });
  });

  it("25x25 매트릭스의 포맷 비트는 15개가 되어야 한다.", () => {
    const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_25_BY_25);
    expect(formatBits.length).toBe(15);
  });

  it("25x25 매트릭스의 포맷 비트는 001111100111101로 검출되어야 한다.", () => {
    const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_25_BY_25);
    expect(formatBits).toBe("001111100111101");
  });

  it("25x25 매트릭스의 포맷 비트는 100101100101111로 마스크 해제 되어야 한다.", () => {
    const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_25_BY_25);
    const unmasked = qr.qrDecoder.unmaskFormatBits(formatBits);
    expect(unmasked).toBe("100101100101111");
  });

  it("25x25 테스트 매트릭스의 포맷 비트의 ECC 레벨은 10: H로 검출되어야 한다.", () => {
    const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_25_BY_25);
    const ecLevel = qr.qrDecoder.getECLevel(formatBits);
    expect(ecLevel).toBe("H");
  });

  it("25x25 테스트 매트릭스의 포맷 비트의 마스크 패턴 번호는 001비트로 검출되어 10진수 1로 변환되어야 한다.", () => {
    const formatBits = qr.qrDecoder.getMaskedFormatBits(TEST_MATRIX_25_BY_25);
    const maskPattern = qr.qrDecoder.getMaskPattern(formatBits);
    expect(maskPattern).toBe(2);
  });

  it("25x25 테스트 매트릭스의 포맷 비트(100101100101111, version: 2, 에러 수준 H, 마스크 패턴 2)의 ECC 정보는 총 19개의 데이터 비트와 7개의 ECC 비트로 검출되어야 한다.", () => {
    const eccInfo = qr.qrDecoder.getErrorCorrectionInfo(TEST_MATRIX_25_BY_25);
    expect(eccInfo?.totalDataCodewords).toBe(16);
    expect(eccInfo?.ecCodewordsPerBlock).toBe(28);
  });

  it("25x25 테스트 매트릭스는 마스크 해체 후 모드는 Byte이고 문자 개수는 11개로 검출되어 바이트 배열로 디코딩되어야 한다.", () => {
    const decodedText = qr.qrDecoder.decodeBitToText(TEST_MATRIX_25_BY_25);
    expect(decodedText).toBe("bizhows.com");
  });
});
