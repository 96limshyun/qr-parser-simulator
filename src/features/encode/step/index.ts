import type { ErrorCorrectionLevel } from "@/types/versionCapacityTableType";

import AnalyzeDetail from "@/features/encode/components/details/AnalyzeDetail";
import BuildMatrixDetail from "@/features/encode/components/details/BuildMatrixDetail";
import EccDetail from "@/features/encode/components/details/EccDetail";
import EncodeDataDetail from "@/features/encode/components/details/EncodeDataDetail";
import MaskDetail from "@/features/encode/components/details/MaskDetail";
import { qr } from "@/libs/QR";

export const ENCODE_STEPS = [
  {
    step: "Init",
    title: "시뮬레이터 초기화",
    description: "인코딩 시뮬레이터를 초기화합니다.",
    color: "gray",
    maskFn: undefined,
    stepDetailComponent: undefined,
  },
  {
    step: "Analyze",
    title: "데이터 분석",
    description: "입력 데이터를 분석하여 인코딩 모드를 결정합니다.",
    color: "red",
    maskFn: undefined,
    stepDetailComponent: AnalyzeDetail,
  },
  {
    step: "EncodeData",
    title: "데이터 비트 생성",
    description: "데이터를 선택된 모드로 인코딩하여 비트열을 생성합니다.",
    color: "blue",
    maskFn: undefined,
    stepDetailComponent: EncodeDataDetail,
  },
  {
    step: "AddECC",
    title: "오류 정정 코드 생성",
    description: "리드-솔로몬 알고리즘을 이용해 오류 정정 코드를 생성합니다.",
    color: "green",
    maskFn: undefined,
    stepDetailComponent: EccDetail,
  },
  {
    step: "BuildMatrix",
    title: "QR 매트릭스 생성",
    description: "패턴과 데이터를 배치하여 최종 QR 매트릭스를 생성합니다.",
    color: "purple",
    maskFn: (inputValue: string, errorCorrectionLevel: ErrorCorrectionLevel) => {
      const smallestVersion = qr.qrEncoder.getSmallestVersion(inputValue, errorCorrectionLevel);

      const bitStream = qr.qrEncoder.buildBitStream(inputValue, errorCorrectionLevel);
      const eccResult = qr.qrEncoder.generateECC(bitStream, smallestVersion, errorCorrectionLevel);
      const basePattern = qr.qrEncoder.getBasePattern(
        bitStream,
        eccResult,
        errorCorrectionLevel,
        smallestVersion,
      );
      return basePattern;
    },
    stepDetailComponent: BuildMatrixDetail,
  },
  {
    step: "Mask",
    title: "마스킹 적용",
    description: "QR 매트릭스에 최적의 마스크 패턴을 적용합니다.",
    color: "orange",
    maskFn: (inputValue: string, errorCorrectionLevel: ErrorCorrectionLevel) => {
      const smallestVersion = qr.qrEncoder.getSmallestVersion(inputValue, errorCorrectionLevel);
      const bitStream = qr.qrEncoder.buildBitStream(inputValue, errorCorrectionLevel);
      const eccResult = qr.qrEncoder.generateECC(bitStream, smallestVersion, errorCorrectionLevel);
      const basePattern = qr.qrEncoder.getBasePattern(
        bitStream,
        eccResult,
        errorCorrectionLevel,
        smallestVersion,
      );
      const { maskedMatrixPositions } = qr.qrEncoder.getMaskedMatrixPositions(
        basePattern,
        bitStream,
        errorCorrectionLevel,
        smallestVersion,
      );
      return maskedMatrixPositions;
    },
    stepDetailComponent: MaskDetail,
  },
  {
    step: "Finalize",
    title: "format 생성 및 최종 QR 코드",
    description: "format 패턴을 적용하고 QR 코드 이미지를 렌더링합니다.",
    color: "emerald",
    maskFn: (inputValue: string, errorCorrectionLevel: ErrorCorrectionLevel) => {
      const smallestVersion = qr.qrEncoder.getSmallestVersion(inputValue, errorCorrectionLevel);
      const bitStream = qr.qrEncoder.buildBitStream(inputValue, errorCorrectionLevel);
      const eccResult = qr.qrEncoder.generateECC(bitStream, smallestVersion, errorCorrectionLevel);
      const basePattern = qr.qrEncoder.getBasePattern(
        bitStream,
        eccResult,
        errorCorrectionLevel,
        smallestVersion,
      );
      const { formatPosition } = qr.qrEncoder.getMaskedMatrixPositions(
        basePattern,
        bitStream,
        errorCorrectionLevel,
        smallestVersion,
      );
      return formatPosition;
    },
    stepDetailComponent: undefined,
  },
] as const;
