import { describe, it, expect } from "vitest";

import { QREncoder } from "../index";

import type { QREncoderResult } from "../types/QREncoderResult";

describe("QREncoder", () => {
  describe("getMode", () => {
    it("숫자만 있는 경우 Numeric 모드를 감지해야 한다", () => {
      const encoder = new QREncoder("1234567890", "L (7% 복원)");
      const result = encoder.getMode("1234567890");

      expect(result.mode).toBe("Numeric");
      expect(result.modeIndicatorBits).toBe("0001");
    });

    it("대문자, 숫자, 특수문자가 있는 경우 Alphanumeric 모드를 감지해야 한다", () => {
      const encoder = new QREncoder("ABC123 $%*", "L (7% 복원)");
      const result = encoder.getMode("ABC123 $%*");

      expect(result.mode).toBe("Alphanumeric");
      expect(result.modeIndicatorBits).toBe("0010");
    });

    it("대소문자가 섞인 경우 Byte 모드를 감지해야 한다", () => {
      const encoder = new QREncoder("Hello World", "L (7% 복원)");
      const result = encoder.getMode("Hello World");

      expect(result.mode).toBe("Byte");
      expect(result.modeIndicatorBits).toBe("0100");
    });

    it("소문자만 있는 경우 Byte 모드를 감지해야 한다", () => {
      const encoder = new QREncoder("hello world", "L (7% 복원)");
      const result = encoder.getMode("hello world");

      expect(result.mode).toBe("Byte");
      expect(result.modeIndicatorBits).toBe("0100");
    });

    it("Alphanumeric에 포함되지 않는 특수문자가 있는 경우 Byte 모드를 감지해야 한다", () => {
      const encoder = new QREncoder("Hello@World!", "L (7% 복원)");
      const result = encoder.getMode("Hello@World!");

      expect(result.mode).toBe("Byte");
      expect(result.modeIndicatorBits).toBe("0100");
    });

    it("빈 문자열인 경우 Byte 모드를 감지해야 한다", () => {
      const encoder = new QREncoder("", "L (7% 복원)");
      const result = encoder.getMode("");

      expect(result.mode).toBe("Byte");
      expect(result.modeIndicatorBits).toBe("0100");
    });
  });

  describe("getSmallestVersion", () => {
    it("숫자 입력에 대해 적절한 버전을 반환해야 한다", () => {
      const encoder = new QREncoder("12345", "L (7% 복원)");
      const version = encoder.getSmallestVersion();

      expect(version).toBeGreaterThanOrEqual(1);
      expect(version).toBeLessThanOrEqual(40);
    });

    it("짧은 텍스트에 대해 버전 1을 반환해야 한다", () => {
      const encoder = new QREncoder("Hello", "L (7% 복원)");
      const version = encoder.getSmallestVersion();

      expect(version).toBe(1);
    });
  });

  describe("buildBitStream", () => {
    it("Numeric 모드에 대해 올바른 비트스트림을 생성해야 한다", () => {
      const encoder = new QREncoder("12345", "L (7% 복원)");
      const bitStream = encoder.buildBitStream();

      expect(bitStream).toBeDefined();
      expect(typeof bitStream).toBe("string");
      expect(bitStream.length).toBeGreaterThan(0);
    });

    it("Alphanumeric 모드에 대해 올바른 비트스트림을 생성해야 한다", () => {
      const encoder = new QREncoder("ABC123", "L (7% 복원)");
      const bitStream = encoder.buildBitStream();

      expect(bitStream).toBeDefined();
      expect(typeof bitStream).toBe("string");
      expect(bitStream.length).toBeGreaterThan(0);
    });

    it("Byte 모드에 대해 올바른 비트스트림을 생성해야 한다", () => {
      const encoder = new QREncoder("Hello World", "L (7% 복원)");
      const bitStream = encoder.buildBitStream();

      expect(bitStream).toBeDefined();
      expect(typeof bitStream).toBe("string");
      expect(bitStream.length).toBeGreaterThan(0);
    });
  });

  describe("generateECC", () => {
    it("Numeric 모드에 대해 올바른 ECC를 생성해야 한다", () => {
      const encoder = new QREncoder("12345", "L (7% 복원)");
      const eccResult = encoder.generateECC(encoder.buildBitStream());

      expect(eccResult.dataCodewords).toBeDefined();
      expect(eccResult.eccCodewords).toBeDefined();
      expect(eccResult.finalCodewords).toBeDefined();
      expect(eccResult.finalBits).toBeDefined();
      expect(eccResult.dataCodewords.length).toBeGreaterThan(0);
      expect(eccResult.eccCodewords.length).toBeGreaterThan(0);
    });

    it("Alphanumeric 모드에 대해 올바른 ECC를 생성해야 한다", () => {
      const encoder = new QREncoder("ABC123", "M (15% 복원)");
      const eccResult = encoder.generateECC(encoder.buildBitStream());

      expect(eccResult.dataCodewords).toBeDefined();
      expect(eccResult.eccCodewords).toBeDefined();
      expect(eccResult.finalCodewords).toBeDefined();
      expect(eccResult.finalBits).toBeDefined();
      expect(eccResult.dataCodewords.length).toBeGreaterThan(0);
      expect(eccResult.eccCodewords.length).toBeGreaterThan(0);
    });

    it("Byte 모드에 대해 올바른 ECC를 생성해야 한다", () => {
      const encoder = new QREncoder("Hello World", "Q (25% 복원)");
      const eccResult = encoder.generateECC(encoder.buildBitStream());

      expect(eccResult.dataCodewords).toBeDefined();
      expect(eccResult.eccCodewords).toBeDefined();
      expect(eccResult.finalCodewords).toBeDefined();
      expect(eccResult.finalBits).toBeDefined();
      expect(eccResult.dataCodewords.length).toBeGreaterThan(0);
      expect(eccResult.eccCodewords.length).toBeGreaterThan(0);
    });

    it("빈 입력에 대해 올바른 ECC 결과를 반환해야 한다", () => {
      const encoder = new QREncoder("", "H (30% 복원)");
      const eccResult = encoder.generateECC(encoder.buildBitStream());

      expect(eccResult.dataCodewords).toBeDefined();
      expect(eccResult.eccCodewords).toBeDefined();
      expect(eccResult.finalCodewords).toBeDefined();
      expect(eccResult.finalBits).toBeDefined();
      expect(eccResult.dataCodewords.length).toBeGreaterThan(0);
      expect(eccResult.eccCodewords.length).toBeGreaterThan(0);
    });
  });

  describe("encode", () => {
    it("숫자 입력에 대해 올바른 인코딩 결과를 반환해야 한다", () => {
      const encoder = new QREncoder("12345", "L (7% 복원)");
      const result: QREncoderResult = encoder.encode();

      expect(result.text).toBe("12345");
      expect(result.mode).toBe("Numeric");
      expect(result.modeIndicatorBits).toBe("0001");
      expect(result.length).toBe(5);
      expect(result.errorCorrectionLevel).toBe("L (7% 복원)");
      expect(result.bitStream).toBeDefined();
      expect(result.smallestVersion).toBeGreaterThanOrEqual(1);
      expect(result.dataCodewords).toBeDefined();
      expect(result.eccCodewords).toBeDefined();
      expect(result.finalCodewords).toBeDefined();
      expect(result.finalBits).toBeDefined();
    });

    it("Alphanumeric 입력에 대해 올바른 인코딩 결과를 반환해야 한다", () => {
      const encoder = new QREncoder("ABC123", "M (15% 복원)");
      const result: QREncoderResult = encoder.encode();

      expect(result.text).toBe("ABC123");
      expect(result.mode).toBe("Alphanumeric");
      expect(result.modeIndicatorBits).toBe("0010");
      expect(result.length).toBe(6);
      expect(result.errorCorrectionLevel).toBe("M (15% 복원)");
      expect(result.bitStream).toBeDefined();
      expect(result.smallestVersion).toBeGreaterThanOrEqual(1);
      expect(result.dataCodewords).toBeDefined();
      expect(result.eccCodewords).toBeDefined();
      expect(result.finalCodewords).toBeDefined();
      expect(result.finalBits).toBeDefined();
    });

    it("Byte 입력에 대해 올바른 인코딩 결과를 반환해야 한다", () => {
      const encoder = new QREncoder("Hello World", "Q (25% 복원)");
      const result: QREncoderResult = encoder.encode();

      expect(result.text).toBe("Hello World");
      expect(result.mode).toBe("Byte");
      expect(result.modeIndicatorBits).toBe("0100");
      expect(result.length).toBe(11);
      expect(result.errorCorrectionLevel).toBe("Q (25% 복원)");
      expect(result.bitStream).toBeDefined();
      expect(result.smallestVersion).toBeGreaterThanOrEqual(1);
      expect(result.dataCodewords).toBeDefined();
      expect(result.eccCodewords).toBeDefined();
      expect(result.finalCodewords).toBeDefined();
      expect(result.finalBits).toBeDefined();
    });

    it("빈 입력에 대해 올바른 인코딩 결과를 반환해야 한다", () => {
      const encoder = new QREncoder("", "H (30% 복원)");
      const result: QREncoderResult = encoder.encode();

      expect(result.text).toBe("");
      expect(result.mode).toBe("Byte");
      expect(result.modeIndicatorBits).toBe("0100");
      expect(result.length).toBe(0);
      expect(result.errorCorrectionLevel).toBe("H (30% 복원)");
      expect(result.bitStream).toBeDefined();
      expect(result.smallestVersion).toBeGreaterThanOrEqual(1);
      expect(result.dataCodewords).toBeDefined();
      expect(result.eccCodewords).toBeDefined();
      expect(result.finalCodewords).toBeDefined();
      expect(result.finalBits).toBeDefined();
    });
  });

  describe("constructor", () => {
    it("올바른 값으로 초기화되어야 한다", () => {
      const encoder = new QREncoder("12345", "L (7% 복원)");

      const result: QREncoderResult = encoder.encode();
      expect(result.text).toBe("12345");
      expect(result.mode).toBe("Numeric");
      expect(result.modeIndicatorBits).toBe("0001");
      expect(result.length).toBe(5);
      expect(result.errorCorrectionLevel).toBe("L (7% 복원)");
    });
  });

  describe("findFinderPattern", () => {
    it("버전 1 QR 코드의 Finder Pattern 좌표를 반환해야 한다", () => {
      const encoder = new QREncoder("Hello", "L (7% 복원)");
      const coordinates = encoder.findFinderPattern();

      expect(coordinates).toBeDefined();
      expect(Array.isArray(coordinates)).toBe(true);
      expect(coordinates.length).toBeGreaterThan(0);

      expect(coordinates.length).toBeGreaterThan(0);

      coordinates.forEach((coord) => {
        expect(coord.row).toBeGreaterThanOrEqual(0);
        expect(coord.col).toBeGreaterThanOrEqual(0);
      });
    });

    it("버전 2 QR 코드의 Finder Pattern 좌표를 반환해야 한다", () => {
      const encoder = new QREncoder("Hello World", "L (7% 복원)");
      const coordinates = encoder.findFinderPattern();

      expect(coordinates).toBeDefined();
      expect(Array.isArray(coordinates)).toBe(true);
      expect(coordinates.length).toBeGreaterThan(0);

      expect(coordinates.length).toBeGreaterThan(0);

      coordinates.forEach((coord) => {
        expect(coord.row).toBeGreaterThanOrEqual(0);
        expect(coord.col).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
