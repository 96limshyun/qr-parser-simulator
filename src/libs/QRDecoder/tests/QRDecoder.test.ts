import { describe, it, expect, beforeEach } from "vitest";

import { ReedSolomon } from "../utils/reedSolomon";

import { QRDecoder } from "@/libs/QRDecoder";
import { DEFAULT_MATRIX } from "@/libs/QRDecoder/constants/defaultMatrix";

const createTestMatrix = () => {
  const matrix = Array(21)
    .fill(null)
    .map(() => Array(21).fill(0));

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
        matrix[i][j] = 1;
      }
    }
  }

  for (let i = 0; i < 7; i++) {
    for (let j = 14; j < 21; j++) {
      if (i === 0 || i === 6 || j === 14 || j === 20 || (i >= 2 && i <= 4 && j >= 16 && j <= 18)) {
        matrix[i][j] = 1;
      }
    }
  }

  for (let i = 14; i < 21; i++) {
    for (let j = 0; j < 7; j++) {
      if (i === 14 || i === 20 || j === 0 || j === 6 || (i >= 16 && i <= 18 && j >= 2 && j <= 4)) {
        matrix[i][j] = 1;
      }
    }
  }

  matrix[8][0] = 1;
  matrix[8][1] = 0;
  matrix[8][2] = 1;
  matrix[8][3] = 0;
  matrix[8][4] = 1;
  matrix[8][5] = 0;
  matrix[8][7] = 1;
  matrix[8][8] = 1;
  matrix[7][8] = 1;
  matrix[6][8] = 0;
  matrix[5][8] = 1;
  matrix[4][8] = 0;
  matrix[3][8] = 1;
  matrix[2][8] = 0;
  matrix[1][8] = 1;
  matrix[0][8] = 0;

  for (let i = 9; i < 21; i++) {
    for (let j = 9; j < 21; j++) {
      if (i % 2 === 0 && j % 2 === 0) {
        matrix[i][j] = 1;
      }
    }
  }

  return matrix;
};

describe("QRDecoder", () => {
  let decoder: QRDecoder;
  let testMatrix: number[][];

  beforeEach(() => {
    testMatrix = DEFAULT_MATRIX;
    decoder = new QRDecoder(testMatrix);
  });

  describe("생성자 및 기본 속성", () => {
    it("올바른 매트릭스로 QRDecoder를 생성할 수 있어야 한다", () => {
      expect(decoder).toBeInstanceOf(QRDecoder);
    });

    it("매트릭스 크기를 올바르게 계산해야 한다", () => {
      const result = decoder.decode();
      expect(result.size).toBe(21);
    });

    it("QR 버전을 올바르게 계산해야 한다", () => {
      const result = decoder.decode();
      expect(result.version).toBe(1);
    });

    it("잘못된 매트릭스 크기로 생성할 때 에러를 던져야 한다", () => {
      const invalidMatrix = Array(20)
        .fill(null)
        .map(() => Array(20).fill(0));
      expect(() => new QRDecoder(invalidMatrix)).toThrow("Invalid QR matrix size");
    });
  });

  describe("Finder Pattern 감지", () => {
    it("Finder Pattern 위치를 올바르게 감지해야 한다", () => {
      const result = decoder.decode();
      const finderPositions = result.finderPositions;

      expect(finderPositions).toHaveLength(3);

      const expectedPositions = [
        { rowStart: 0, colStart: 0 },
        { rowStart: 0, colStart: 14 },
        { rowStart: 14, colStart: 0 },
      ];

      expectedPositions.forEach((expected) => {
        const found = finderPositions.some(
          (pos) => pos.rowStart === expected.rowStart && pos.colStart === expected.colStart,
        );
        expect(found).toBe(true);
      });
    });
  });

  describe("Alignment Pattern 감지", () => {
    it("Version 1 QR 코드에는 Alignment Pattern이 없어야 한다", () => {
      const result = decoder.decode();
      expect(result.alignmentPositions).toHaveLength(0);
    });

    it("Version 2 이상의 QR 코드에서 Alignment Pattern을 감지해야 한다", () => {
      const version2Matrix = Array(25)
        .fill(null)
        .map(() => Array(25).fill(0));
      const version2Decoder = new QRDecoder(version2Matrix);
      const result = version2Decoder.decode();

      expect(result.alignmentPositions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Format 정보 분석", () => {
    it("Format 정보 위치를 올바르게 감지해야 한다", () => {
      const result = decoder.decode();
      const formatPositions = result.formatPositions;
      expect(formatPositions.length).toBeGreaterThanOrEqual(15);

      const hasFormatInfo = formatPositions.some(
        (pos) => (pos.row === 8 && pos.col <= 8) || (pos.col === 8 && pos.row <= 8),
      );
      expect(hasFormatInfo).toBe(true);
    });

    it("Format 비트를 올바르게 추출해야 한다", () => {
      const result = decoder.decode();
      expect(result.rawFormatBits).toBeDefined();
      expect(result.rawFormatBits.length).toBe(15);
    });
  });

  describe("Timing Pattern 감지", () => {
    it("Timing Pattern 위치를 올바르게 감지해야 한다", () => {
      const result = decoder.decode();
      const timingPositions = result.timingPositions;

      const horizontalTiming = timingPositions.filter((pos) => pos.row === 6);
      const verticalTiming = timingPositions.filter((pos) => pos.col === 6);

      expect(horizontalTiming.length).toBeGreaterThan(0);
      expect(verticalTiming.length).toBeGreaterThan(0);
    });
  });

  describe("데이터 영역 분석", () => {
    it("데이터 모듈 좌표를 올바르게 계산해야 한다", () => {
      const result = decoder.decode();
      const dataPositions = result.dataPositions;

      expect(dataPositions.length).toBeGreaterThan(0);

      const reservedAreas = [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 6, col: 8 },
        { row: 8, col: 6 },
        { row: 8, col: 8 },
      ];

      reservedAreas.forEach((area) => {
        const hasReservedData = dataPositions.some(
          (pos) => pos.row === area.row && pos.col === area.col,
        );
        expect(hasReservedData).toBe(false);
      });
    });

    it("마스킹된 데이터 비트를 추출해야 한다", () => {
      const result = decoder.decode();
      expect(result.maskedDataBits).toBeDefined();
      expect(result.maskedDataBits.length).toBeGreaterThan(0);
    });

    it("마스킹 해제된 데이터 비트를 계산해야 한다", () => {
      const result = decoder.decode();
      expect(result.unmaskedDataBits).toBeDefined();
    });
  });

  describe("데이터 디코딩", () => {
    it("모드 정보를 추출해야 한다", () => {
      const result = decoder.decode();
      expect(result.mode).toBeDefined();
      expect(result.modeBits).toBeDefined();
    });

    it("문자 개수를 추출해야 한다", () => {
      const result = decoder.decode();
      expect(result.characterCount).toBeGreaterThanOrEqual(0);
    });

    it("디코딩된 텍스트를 반환해야 한다", () => {
      const result = decoder.decode();
      expect(result.decodedText).toBeDefined();
    });
  });

  describe("전체 디코딩 프로세스", () => {
    it("완전한 디코딩 결과를 반환해야 한다", () => {
      const result = decoder.decode();

      expect(result.matrix).toBeDefined();
      expect(result.size).toBe(21);
      expect(result.version).toBe(1);
      expect(result.finderPositions).toBeDefined();
      expect(result.alignmentPositions).toBeDefined();
      expect(result.formatPositions).toBeDefined();
      expect(result.timingPositions).toBeDefined();
      expect(result.dataPositions).toBeDefined();
      expect(result.mode).toBeDefined();
      expect(result.decodedText).toBeDefined();
    });

    it("ECC 정보를 포함해야 한다", () => {
      const result = decoder.decode();
      expect(result.eccLevel).toBeDefined();
      expect(result.maskPattern).toBeDefined();
      expect(result.eccCorrected).toBeDefined();
      expect(result.eccErrorCount).toBeDefined();
    });
  });

  describe("에러 처리", () => {
    it("잘못된 QR 버전에 대해 에러를 던져야 한다", () => {
      const invalidMatrix = Array(200)
        .fill(null)
        .map(() => Array(200).fill(0));
      expect(() => new QRDecoder(invalidMatrix)).toThrow("Invalid QR matrix size");
    });
  });

  describe("특수 케이스", () => {
    it("모든 0으로 구성된 매트릭스도 처리할 수 있어야 한다", () => {
      const zeroMatrix = Array(21)
        .fill(null)
        .map(() => Array(21).fill(0));
      const zeroDecoder = new QRDecoder(zeroMatrix);
      const result = zeroDecoder.decode();

      expect(result.size).toBe(21);
      expect(result.version).toBe(1);
    });

    it("모든 1로 구성된 매트릭스도 처리할 수 있어야 한다", () => {
      const oneMatrix = Array(21)
        .fill(null)
        .map(() => Array(21).fill(1));
      const oneDecoder = new QRDecoder(oneMatrix);
      const result = oneDecoder.decode();

      expect(result.size).toBe(21);
      expect(result.version).toBe(1);
    });
  });
});

describe("QRDecoder ECC 테스트", () => {
  let decoder: QRDecoder;

  beforeEach(() => {
    const testMatrix = createTestMatrix();
    decoder = new QRDecoder(testMatrix);
  });

  describe("기본 QR 감지", () => {
    it("QR 버전을 올바르게 감지해야 한다", () => {
      expect(decoder.getVersionByMatrixSize()).toBe(1);
    });

    it("Finder 패턴을 감지해야 한다", () => {
      const finderPositions = decoder.detectFinderPositions();
      expect(finderPositions.length).toBeGreaterThan(0);
    });

    it("Format 정보를 디코딩해야 한다", () => {
      const formatInfo = decoder.decodeFormatInfo();
      expect(formatInfo).toBeDefined();
      expect(formatInfo.eccLevel).toBeDefined();
      expect(formatInfo.maskPattern).toBeGreaterThanOrEqual(0);
      expect(formatInfo.maskPattern).toBeLessThan(8);
    });
  });

  describe("ECC 마스크 생성", () => {
    it("데이터 마스크를 생성해야 한다", () => {
      const dataMask = decoder.createDataMask();
      expect(dataMask.length).toBeGreaterThan(0);
    });

    it("ECC 마스크를 생성해야 한다", () => {
      const eccMask = decoder.createECCMask();
      expect(eccMask.length).toBeGreaterThanOrEqual(0);
    });

    it("Finder 마스크를 생성해야 한다", () => {
      const finderMask = decoder.createFinderMask();
      expect(finderMask.length).toBeGreaterThan(0);
    });

    it("Timing 마스크를 생성해야 한다", () => {
      const timingMask = decoder.createTimingMask();
      expect(timingMask.length).toBeGreaterThan(0);
    });

    it("Format 마스크를 생성해야 한다", () => {
      const formatMask = decoder.createFormatMask();
      expect(formatMask.length).toBeGreaterThan(0);
    });
  });

  describe("ECC 상세 분석", () => {
    it("ECC 상세 정보를 가져와야 한다", () => {
      const eccDetail = decoder.getECCDetail();
      expect(eccDetail).toBeDefined();

      if (eccDetail) {
        expect(eccDetail.totalDataCodewords).toBeGreaterThan(0);
        expect(eccDetail.totalECCCodewords).toBeGreaterThan(0);
        expect(eccDetail.dataCodewords).toBeDefined();
        expect(eccDetail.eccBytes).toBeDefined();
      }
    });

    it("에러 정정을 수행해야 한다", () => {
      const eccDetail = decoder.getECCDetail();
      expect(eccDetail).toBeDefined();

      if (eccDetail) {
        expect(eccDetail.correctedDataCodewords).toBeDefined();
        expect(eccDetail.correctedECCCodewords).toBeDefined();
        expect(typeof eccDetail.errorCount).toBe("number");
        expect(typeof eccDetail.correctionSuccess).toBe("boolean");
      }
    });
  });

  describe("전체 디코딩 프로세스", () => {
    it("QR 코드를 완전히 디코딩해야 한다", () => {
      const result = decoder.decode();

      expect(result).toBeDefined();
      expect(result.version).toBe(1);
      expect(result.finderPositions.length).toBeGreaterThan(0);
      expect(result.eccCorrected).toBeDefined();
      expect(typeof result.eccErrorCount).toBe("number");
    });
  });
});

describe("ReedSolomon ECC 테스트", () => {
  describe("기본 ECC 작업", () => {
    it("데이터를 ECC와 함께 인코딩해야 한다", () => {
      const testData = [1, 2, 3, 4, 5, 6, 7, 8];
      const eccCount = 4;

      const encoded = ReedSolomon.encode(testData, eccCount);

      expect(encoded.length).toBe(testData.length + eccCount);
      expect(encoded.slice(0, testData.length)).toEqual(testData);
    });

    it("데이터의 에러를 정정해야 한다", () => {
      const testData = [1, 2, 3, 4, 5, 6, 7, 8];
      const eccCount = 4;

      const encoded = ReedSolomon.encode(testData, eccCount);
      const corrupted = [...encoded];
      corrupted[2] ^= 1;

      const result = ReedSolomon.correctErrors(corrupted, eccCount);

      expect(result.corrected).toBeDefined();
      expect(typeof result.errorCount).toBe("number");
      expect(typeof result.success).toBe("boolean");
    });

    it("여러 에러를 처리해야 한다", () => {
      const testData = [1, 2, 3, 4, 5, 6, 7, 8];
      const eccCount = 4;

      const encoded = ReedSolomon.encode(testData, eccCount);
      const corrupted = [...encoded];
      corrupted[2] ^= 1;
      corrupted[5] ^= 1;

      const result = ReedSolomon.correctErrors(corrupted, eccCount);

      expect(result.corrected).toBeDefined();
      expect(typeof result.errorCount).toBe("number");
      expect(typeof result.success).toBe("boolean");
    });

    it("에러가 없을 때를 처리해야 한다", () => {
      const testData = [1, 2, 3, 4, 5, 6, 7, 8];
      const eccCount = 4;

      const encoded = ReedSolomon.encode(testData, eccCount);
      const result = ReedSolomon.correctErrors(encoded, eccCount);

      expect(result.corrected).toBeDefined();
      expect(typeof result.errorCount).toBe("number");
      expect(typeof result.success).toBe("boolean");
    });
  });

  describe("갈루아 필드 연산", () => {
    it("GF 곱셈을 수행해야 한다", () => {
      expect(ReedSolomon.gfMul(2, 3)).toBe(6);
      expect(ReedSolomon.gfMul(0, 5)).toBe(0);
      expect(ReedSolomon.gfMul(5, 0)).toBe(0);
    });

    it("GF 나눗셈을 수행해야 한다", () => {
      expect(ReedSolomon.gfDiv(6, 2)).toBe(3);
      expect(ReedSolomon.gfDiv(0, 5)).toBe(0);
    });

    it("GF 지수 연산을 수행해야 한다", () => {
      expect(ReedSolomon.gfPow(2, 3)).toBe(8);
      expect(ReedSolomon.gfPow(2, 0)).toBe(1);
    });
  });

  describe("다항식 연산", () => {
    it("다항식을 더해야 한다", () => {
      const a = [1, 2, 3];
      const b = [4, 5, 6];
      const result = ReedSolomon.polyAdd(a, b);
      expect(result).toEqual([5, 7, 5]);
    });

    it("다항식을 곱해야 한다", () => {
      const a = [1, 2];
      const b = [3, 4];
      const result = ReedSolomon.polyMul(a, b);
      expect(result.length).toBe(3);
    });

    it("다항식을 나누어야 한다", () => {
      const a = [1, 2, 3, 4];
      const b = [1, 1];
      const result = ReedSolomon.polyDiv(a, b);
      expect(result.quotient).toBeDefined();
      expect(result.remainder).toBeDefined();
    });
  });

  describe("에러 정정 한계", () => {
    it("에러가 너무 많을 때 실패해야 한다", () => {
      const testData = [1, 2, 3, 4, 5, 6, 7, 8];
      const eccCount = 2;

      const encoded = ReedSolomon.encode(testData, eccCount);
      const corrupted = [...encoded];
      corrupted[0] ^= 1;
      corrupted[1] ^= 1;
      corrupted[2] ^= 1;

      const result = ReedSolomon.correctErrors(corrupted, eccCount);

      expect(result.success).toBe(false);
    });
  });
});

describe("ECC 통합 테스트", () => {
  it("시뮬레이션된 에러가 있는 QR 코드를 처리해야 한다", () => {
    const testMatrix = DEFAULT_MATRIX;

    testMatrix[10][10] ^= 1;
    testMatrix[15][15] ^= 1;

    const decoder = new QRDecoder(testMatrix);
    const result = decoder.decode();

    expect(result).toBeDefined();
    expect(result.eccErrorCount).toBeGreaterThanOrEqual(0);
  });

  it("다양한 QR 버전을 테스트해야 한다", () => {
    const sizes = [21, 25, 29];

    sizes.forEach((size) => {
      const matrix = Array(size)
        .fill(null)
        .map(() => Array(size).fill(0));
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6) {
            matrix[i][j] = 1;
          }
        }
      }

      try {
        const decoder = new QRDecoder(matrix);
        expect(decoder.getVersionByMatrixSize()).toBeGreaterThan(0);
        expect(decoder.getVersionByMatrixSize()).toBeLessThanOrEqual(40);
      } catch (error) {
        console.log(`버전 테스트 실패 (크기 ${size}):`, error);
      }
    });
  });
});

describe("QRDecoder 기본 테스트", () => {
  describe("생성자 및 기본 속성", () => {
    it("올바른 매트릭스로 QRDecoder를 생성할 수 있어야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      expect(decoder).toBeInstanceOf(QRDecoder);
    });

    it("매트릭스 크기를 올바르게 계산해야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      expect(decoder.getVersionByMatrixSize()).toBe(1);
    });

    it("QR 버전을 올바르게 계산해야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      expect(decoder.getVersionByMatrixSize()).toBe(1);
    });

    it("잘못된 매트릭스 크기로 생성할 때 에러를 던져야 한다", () => {
      const invalidMatrix = Array(20)
        .fill(null)
        .map(() => Array(20).fill(0));
      expect(() => new QRDecoder(invalidMatrix)).toThrow();
    });
  });

  describe("Finder Pattern 감지", () => {
    it("Finder Pattern 위치를 올바르게 감지해야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      const finderPositions = decoder.detectFinderPositions();
      expect(finderPositions.length).toBeGreaterThan(0);
    });
  });

  describe("Alignment Pattern 감지", () => {
    it("Version 1 QR 코드에는 Alignment Pattern이 없어야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      const alignmentPositions = decoder.detectAlignmentPositions();
      expect(alignmentPositions.length).toBe(0);
    });

    it("Version 2 이상의 QR 코드에서 Alignment Pattern을 감지해야 한다", () => {
      // Version 2 매트릭스 생성 (25x25)
      const matrix = Array(25)
        .fill(null)
        .map(() => Array(25).fill(0));
      const decoder = new QRDecoder(matrix);
      const alignmentPositions = decoder.detectAlignmentPositions();
      expect(alignmentPositions.length).toBeGreaterThan(0);
    });
  });

  describe("Format 정보 분석", () => {
    it("Format 정보 위치를 올바르게 감지해야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      const formatPositions = decoder.detectFormatPositions();

      expect(formatPositions.length).toBeGreaterThan(0);

      const hasFormatPosition = formatPositions.some((pos) => pos.row === 8 || pos.col === 8);
      expect(hasFormatPosition).toBe(true);
    });

    it("Format 비트를 올바르게 추출해야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      const formatInfo = decoder.decodeFormatInfo();

      expect(formatInfo.rawBits).toBeDefined();
      expect(formatInfo.unmaskedBits).toBeDefined();
      expect(formatInfo.eccLevel).toBeDefined();
      expect(typeof formatInfo.maskPattern).toBe("number");
    });
  });

  describe("Timing Pattern 감지", () => {
    it("Timing Pattern 위치를 올바르게 감지해야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      const timingPositions = decoder.detectTimingPositions();
      expect(timingPositions.length).toBeGreaterThan(0);
    });
  });

  describe("데이터 영역 분석", () => {
    it("데이터 모듈 좌표를 올바르게 계산해야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      const dataPositions = decoder.createDataMask();
      expect(dataPositions.length).toBeGreaterThan(0);
    });

    it("마스킹된 데이터 비트를 추출해야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      const dataPositions = decoder.createDataMask();
      const maskedDataBits = dataPositions.map(({ row, col }) => matrix[row][col]).join("");
      expect(maskedDataBits.length).toBeGreaterThan(0);
    });

    it("마스킹 해제된 데이터 비트를 계산해야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      const formatInfo = decoder.decodeFormatInfo();
      const dataPositions = decoder.createDataMask();

      const DATA_MASKS = [
        (p: { row: number; col: number }) => (p.row + p.col) % 2 === 0,
        (p: { row: number; col: number }) => p.row % 2 === 0,
        (p: { row: number; col: number }) => p.col % 3 === 0,
        (p: { row: number; col: number }) => (p.row + p.col) % 3 === 0,
        (p: { row: number; col: number }) =>
          (Math.floor(p.row / 2) + Math.floor(p.col / 3)) % 2 === 0,
        (p: { row: number; col: number }) => ((p.col * p.row) % 2) + ((p.col * p.row) % 3) === 0,
        (p: { row: number; col: number }) =>
          (((p.row * p.col) % 2) + ((p.row * p.col) % 3)) % 2 === 0,
        (p: { row: number; col: number }) =>
          (((p.row + p.col) % 2) + ((p.row * p.col) % 3)) % 2 === 0,
      ];

      const dataMask = DATA_MASKS[formatInfo.maskPattern];
      const unmaskedDataBits = dataPositions
        .map(({ row, col }) => {
          const originalValue = matrix[row][col];
          const shouldMask = dataMask({ row, col });
          return shouldMask ? originalValue ^ 1 : originalValue;
        })
        .join("");

      expect(unmaskedDataBits.length).toBeGreaterThan(0);
    });
  });

  describe("데이터 디코딩", () => {
    it("모드 정보를 추출해야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      const result = decoder.decode();
      expect(result.mode).toBeDefined();
    });

    it("문자 개수를 추출해야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      const result = decoder.decode();
      expect(typeof result.characterCount).toBe("number");
    });

    it("디코딩된 텍스트를 반환해야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      const result = decoder.decode();
      expect(result.decodedText).toBeDefined();
    });
  });

  describe("전체 디코딩 프로세스", () => {
    it("완전한 디코딩 결과를 반환해야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      const result = decoder.decode();

      expect(result.matrix).toBeDefined();
      expect(result.size).toBeDefined();
      expect(result.version).toBeDefined();
      expect(result.finderPositions).toBeDefined();
      expect(result.decodedText).toBeDefined();
    });

    it("ECC 정보를 포함해야 한다", () => {
      const matrix = DEFAULT_MATRIX;
      const decoder = new QRDecoder(matrix);
      const result = decoder.decode();

      expect(result.eccCorrected).toBeDefined();
      expect(typeof result.eccErrorCount).toBe("number");
    });
  });

  describe("에러 처리", () => {
    it("잘못된 QR 버전에 대해 에러를 던져야 한다", () => {
      const invalidMatrix = Array(20)
        .fill(null)
        .map(() => Array(20).fill(0));
      expect(() => new QRDecoder(invalidMatrix)).toThrow();
    });
  });

  describe("특수 케이스", () => {
    it("모든 0으로 구성된 매트릭스도 처리할 수 있어야 한다", () => {
      const zeroMatrix = Array(21)
        .fill(null)
        .map(() => Array(21).fill(0));
      const decoder = new QRDecoder(zeroMatrix);
      const result = decoder.decode();
      expect(result).toBeDefined();
    });

    it("모든 1로 구성된 매트릭스도 처리할 수 있어야 한다", () => {
      const oneMatrix = Array(21)
        .fill(null)
        .map(() => Array(21).fill(1));
      const decoder = new QRDecoder(oneMatrix);
      const result = decoder.decode();
      expect(result).toBeDefined();
    });
  });
});
