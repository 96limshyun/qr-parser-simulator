import AnalyzeDetail from "@/features/encode/components/details/AnalyzeDetail";
import EccDetail from "@/features/encode/components/details/EccDetail";
import EncodeDataDetail from "@/features/encode/components/details/EncodeDataDetail";

export const ENCODE_STEPS = [
  {
    step: "Init",
    title: "시뮬레이터 초기화",
    description: "인코딩 시뮬레이터를 초기화합니다.",
    color: "gray",
    processFn: undefined,
    stepDetailComponent: undefined,
  },
  {
    step: "Analyze",
    title: "데이터 분석",
    description: "입력 데이터를 분석하여 인코딩 모드를 결정합니다.",
    color: "red",
    processFn: undefined,
    stepDetailComponent: AnalyzeDetail,
  },
  {
    step: "EncodeData",
    title: "데이터 비트 생성",
    description: "데이터를 선택된 모드로 인코딩하여 비트열을 생성합니다.",
    color: "blue",
    processFn: undefined,
    stepDetailComponent: EncodeDataDetail,
  },
  {
    step: "AddECC",
    title: "오류 정정 코드 생성",
    description: "리드-솔로몬 알고리즘을 이용해 오류 정정 코드를 생성합니다.",
    color: "green",
    processFn: undefined,
    stepDetailComponent: EccDetail,
  },
  {
    step: "BuildMatrix",
    title: "QR 매트릭스 생성",
    description: "패턴과 데이터를 배치하여 최종 QR 매트릭스를 생성합니다.",
    color: "purple",
    processFn: undefined,
    stepDetailComponent: undefined,
  },
  {
    step: "Mask",
    title: "마스킹 적용",
    description: "QR 매트릭스에 최적의 마스크 패턴을 적용합니다.",
    color: "orange",
    processFn: undefined,
    stepDetailComponent: undefined,
  },
  {
    step: "Finalize",
    title: "최종 QR 코드",
    description: "QR 코드 이미지를 렌더링합니다.",
    color: "emerald",
    processFn: undefined,
    stepDetailComponent: undefined,
  },
] as const;
