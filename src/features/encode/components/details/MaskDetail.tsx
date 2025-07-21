import type { ErrorCorrectionLevel } from "@/types/versionCapacityTableType";

import { qr } from "@/libs/QR";
import Text from "@/ui/Text";

interface MaskDetailProps {
  inputValue: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
}

const MASK_PATTERNS = [
  {
    idx: 0,
    desc: "(row + col) % 2 === 0",
    example: "흑백이 번갈아가며 나타나는 패턴",
  },
  {
    idx: 1,
    desc: "row % 2 === 0",
    example: "짝수 행만 반전",
  },
  {
    idx: 2,
    desc: "col % 3 === 0",
    example: "3의 배수 열만 반전",
  },
  {
    idx: 3,
    desc: "(row + col) % 3 === 0",
    example: "대각선 패턴",
  },
  {
    idx: 4,
    desc: "(Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0",
    example: "격자 패턴",
  },
  {
    idx: 5,
    desc: "((row * col) % 2) + ((row * col) % 3) === 0",
    example: "복합 곱셈 패턴",
  },
  {
    idx: 6,
    desc: "(((row * col) % 2) + ((row * col) % 3)) % 2 === 0",
    example: "복합 곱셈+나머지 패턴",
  },
  {
    idx: 7,
    desc: "(((row + col) % 2) + ((row * col) % 3)) % 2 === 0",
    example: "복합 대각선+곱셈 패턴",
  },
];

const MaskDetail = ({ inputValue, errorCorrectionLevel }: MaskDetailProps) => {
  const smallestVersion = qr.qrEncoder.getSmallestVersion(inputValue, errorCorrectionLevel);
  const bitStream = qr.qrEncoder.buildBitStream(inputValue, errorCorrectionLevel);
  const eccResult = qr.qrEncoder.generateECC(bitStream, smallestVersion, errorCorrectionLevel);
  const basePattern = qr.qrEncoder.getBasePattern(
    bitStream,
    eccResult,
    errorCorrectionLevel,
    smallestVersion,
  );
  const { maskedMatrixPositions, maskNumber } = qr.qrEncoder.getMaskedMatrixPositions(
    basePattern,
    bitStream,
    errorCorrectionLevel,
    smallestVersion,
  );

  const maskPattern = MASK_PATTERNS[maskNumber];

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <Text
        fontWeight="bold"
        fontSize="lg"
      >
        🦺 마스킹(Mask) 패턴 적용
      </Text>
      <Text color="gray">
        QR 코드의 데이터 영역에 마스킹 패턴을 적용하면, 연속된 흰색/검은색 영역이 줄어들어 스캐너가
        더 쉽게 인식할 수 있습니다.
        <br />총 8가지 마스킹 패턴 중 최적의 패턴이 자동으로 선택되어 적용됩니다.
      </Text>
      <div className="border rounded-lg p-3 ">
        <Text
          fontWeight="medium"
          color="blue"
        >
          적용된 마스킹 패턴 #{maskPattern.idx}
        </Text>
        <Text color="gray">{maskPattern.desc}</Text>
        <Text color="gray">예시: {maskPattern.example}</Text>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Text fontWeight="medium">마스킹 전</Text>
          <div className="border p-2 rounded text-xs">
            {basePattern ? `활성 모듈 수: ${basePattern.length}` : "-"}
          </div>
        </div>
        <div>
          <Text fontWeight="medium">마스킹 후</Text>
          <div className="border p-2 rounded text-xs">
            {maskedMatrixPositions ? `활성 모듈 수: ${maskedMatrixPositions.length}` : "-"}
          </div>
        </div>
      </div>
      <Text
        color="gray"
        className="text-xs"
      >
        💡 마스킹 패턴은 QR 코드의 데이터 영역에만 적용되며, Finder/Alignment/Timing/Format 영역에는
        적용되지 않습니다.
      </Text>
    </div>
  );
};

export default MaskDetail;
