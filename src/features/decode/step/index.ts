import DataDetail from "@/features/decode/components/details/dataDetail";
import ECCDetail from "@/features/decode/components/details/ECCDetail";
import FinderDetail from "@/features/decode/components/details/FinderDetail";
import FormatDetail from "@/features/decode/components/details/FormatDetail";
import QrResultDetail from "@/features/decode/components/details/QrResultDetail";
import TimingDetail from "@/features/decode/components/details/TimingDetail";
import { qr } from "@/libs/QR";

export const DECODE_STEPS = [
  {
    step: "Init",
    title: "시뮬레이터 초기화",
    description: "QR 매트릭스를 초기화합니다.",
    color: "gray",
    maskFn: undefined,
    stepDetailComponent: undefined,
  },
  {
    step: "Finder",
    title: "위치 탐지 패턴",
    description: "세 모서리 위치 탐지 패턴을 검출합니다.",
    color: "red",
    maskFn: (matrix: number[][]) => {
      const finderPositions = qr.qrDecoder.detectFinderPositions(matrix);
      const alignmentPositions = qr.qrDecoder.detectAlignmentPositions(matrix);
      return [...finderPositions, ...alignmentPositions];
    },
    stepDetailComponent: FinderDetail,
  },
  {
    step: "Timing",
    title: "타이밍 패턴",
    description: "행·열 타이밍 패턴을 검출합니다.",
    color: "blue",
    maskFn: (matrix: number[][]) => {
      return qr.qrDecoder.detectTimingPositions(matrix);
    },
    stepDetailComponent: TimingDetail,
  },
  {
    step: "Format",
    title: "포맷 정보",
    description: "에러 정정 레벨 및 마스크 패턴을 해석합니다.",
    color: "green",
    maskFn: (matrix: number[][]) => {
      return qr.qrDecoder.detectFormatPositions(matrix);
    },
    stepDetailComponent: FormatDetail,
  },
  {
    step: "Data",
    title: "데이터 모듈",
    description: "데이터 영역 비트를 추출합니다.",
    color: "purple",
    maskFn: (matrix: number[][]) => {
      return qr.qrDecoder.detectDataPositions(matrix);
    },
    stepDetailComponent: DataDetail,
  },
  {
    step: "ECC",
    title: "오류 정정 코드",
    description: "리드‑솔로몬 오류 정정을 수행합니다.",
    color: "orange",
    maskFn: (matrix: number[][]) => {
      return qr.qrDecoder.detectECCPositions(matrix);
    },
    stepDetailComponent: ECCDetail,
  },
  {
    step: "Decode",
    title: "최종 디코딩",
    description: "최종 데이터를 디코딩합니다.",
    color: "emerald",
    maskFn: undefined,
    stepDetailComponent: QrResultDetail,
  },
] as const;
