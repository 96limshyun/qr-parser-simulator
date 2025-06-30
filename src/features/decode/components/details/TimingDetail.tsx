import { useEffect } from "react";
import { LiaRulerHorizontalSolid, LiaRulerVerticalSolid } from "react-icons/lia";

import type { DetailProps } from "@/features/decode/types/detailProps";

import { detectTimingPositions } from "@/features/decode/utils/createTimingMask";
import Text from "@/ui/Text";

const TimingDetail = ({ matrix, setFormatInfo }: DetailProps) => {
  const positions = detectTimingPositions(matrix);
  useEffect(() => {
    setFormatInfo((prev) => ({
      ...prev,
      size: matrix.length,
    }));
  }, [matrix.length, setFormatInfo]);
  return (
    <div className="space-y-1 text-sm leading-6">
      <Text
        color="gray"
        className="whitespace-pre-line"
      >
        Timing Pattern은 QR 코드 내 모듈 정렬 기준을 제공하기 위해 QR 코드 중앙을 가로와 세로로
        가로지르는 검은색-흰색 반복 패턴입니다.{`\n`}
        이를 통해 각 모듈의 위치를 정확히 계산할 수 있습니다.
      </Text>

      <Text
        fontWeight="bold"
        fontSize="sm"
        className="mt-2"
      >
        검출된 Timing Pattern 모듈:
      </Text>
      <div className="space-y-1">
        {positions.map(({ row, col, value }, i) => (
          <div
            key={i}
            className="flex items-center gap-2"
          >
            {row === 6 ?
              <LiaRulerHorizontalSolid />
            : <LiaRulerVerticalSolid />}
            <span className="font-mono">
              ({row}, {col})
            </span>{" "}
            → {value ? "검정" : "흰색"}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimingDetail;
