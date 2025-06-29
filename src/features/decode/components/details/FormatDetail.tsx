import { LiaKeySolid } from "react-icons/lia";

import { detectFormatPositions } from "../../utils/createFormatMask";

import type { DetailProps } from "@/features/decode/types/detailProps";

import { ECC_MAP } from "@/constants/eccMap";
import { FORMAT_MASK } from "@/constants/formatMask";
import Text from "@/ui/Text";

const FormatDetail = ({ matrix, color, formatInfo }: DetailProps) => {
  const positions = detectFormatPositions(matrix);

  const formatBits = positions.map((p) => p.value);
  const rawBitsNumber = formatBits.reduce((acc, bit) => (acc << 1) | bit, 0);
  const rawBitsStr = rawBitsNumber.toString(2).padStart(15, "0");

  const unmaskedBitsNumber = rawBitsNumber ^ FORMAT_MASK;
  const unmaskedBitsStr = unmaskedBitsNumber.toString(2).padStart(15, "0");

  const Info = unmaskedBitsNumber >> 10;

  const eccBits = (Info >> 3) & 0b11;
  const maskPattern = Info & 0b111;

  const eccLevel = ECC_MAP[eccBits] ?? "알 수 없음";

  formatInfo.rawBits = rawBitsStr;
  formatInfo.unmaskedBits = unmaskedBitsStr;
  formatInfo.eccLevel = eccLevel;
  formatInfo.maskPattern = maskPattern;
  console.log(formatInfo);
  return (
    <div className="space-y-2 text-sm leading-6">
      <Text
        color="gray"
        className="whitespace-pre-line"
      >
        QR 코드의 Format 정보 영역은 오류 정정 레벨(ECC)과 마스크 패턴 정보를 저장하고 있습니다.
        {"\n"}이 영역을 통해 디코더가 데이터 영역을 올바르게 해석할 수 있습니다.
      </Text>

      <Text
        fontWeight="bold"
        fontSize="sm"
        className="mt-2"
      >
        검출된 Format 정보 모듈:
      </Text>
      <div className="space-y-1">
        {positions.map(({ row, col, value }, i) => (
          <div
            key={i}
            className="flex items-center gap-2"
          >
            <LiaKeySolid />({row}, {col}) → {value ? "검정" : "흰색"}
          </div>
        ))}
      </div>

      <Text
        fontWeight="bold"
        fontSize="sm"
        className="mt-4"
      >
        디코딩된 Format 정보:
      </Text>
      <div className="space-y-1 font-mono">
        <Text
          fontSize="sm"
          color={color}
        >
          포맷 원본 비트: {rawBitsStr}
        </Text>
        <Text
          fontSize="sm"
          color={color}
        >
          마스크 해제 후 비트: {unmaskedBitsStr}
        </Text>
        <Text
          fontSize="sm"
          color={color}
        >
          오류 정정 수준: {eccLevel}
        </Text>
        <Text
          fontSize="sm"
          color={color}
        >
          마스크 패턴 번호: {maskPattern}번
        </Text>
      </div>
    </div>
  );
};

export default FormatDetail;
