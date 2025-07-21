import { LiaRulerHorizontalSolid, LiaRulerVerticalSolid } from "react-icons/lia";

import type { DetailProps } from "@/features/decode/types/detailProps";

import { qr } from "@/libs/QR";
import Text from "@/ui/Text";

const TimingDetail = ({ matrix }: DetailProps) => {
  const positions = qr.qrDecoder.detectTimingPositions(matrix);

  const horizontalTiming = positions.filter(({ row }) => row === 6);
  const verticalTiming = positions.filter(({ col }) => col === 6);

  return (
    <div className="space-y-1 text-sm leading-6">
      <Text
        color="gray"
        className="whitespace-pre-line"
      >
        Timing Pattern은 QR 코드의 모듈 크기와 위치를 정확히 계산하기 위한 기준선 역할을 합니다.
        {`\n`}
        QR 코드 중앙을 가로(7번째 행)와 세로(7번째 열)로 가로지르는 검은색-흰색 반복 패턴으로,{`\n`}
        스캐너가 QR 코드의 크기와 각 모듈의 정확한 위치를 파악하는 데 사용됩니다.
      </Text>

      <Text
        fontWeight="bold"
        fontSize="sm"
        className="mt-4"
      >
        가로 Timing Pattern (7번째 행):
      </Text>
      <div className="space-y-1 mb-3">
        {horizontalTiming.map(({ row, col, value }, i) => (
          <div
            key={`h-${i}`}
            className="flex items-center gap-2"
          >
            <LiaRulerHorizontalSolid className="text-blue-400" />
            <span className="font-mono">
              ({row}, {col})
            </span>
            <span className="text-gray-400">→</span>
            <span className={value ? "text-black font-medium" : "text-gray-300"}>
              {value ? "검정" : "흰색"}
            </span>
          </div>
        ))}
      </div>

      <Text
        fontWeight="bold"
        fontSize="sm"
        className="mt-4"
      >
        세로 Timing Pattern (7번째 열):
      </Text>
      <div className="space-y-1">
        {verticalTiming.map(({ row, col, value }, i) => (
          <div
            key={`v-${i}`}
            className="flex items-center gap-2"
          >
            <LiaRulerVerticalSolid className="text-green-400" />
            <span className="font-mono">
              ({row}, {col})
            </span>
            <span className="text-gray-400">→</span>
            <span className={value ? "text-black font-medium" : "text-gray-300"}>
              {value ? "검정" : "흰색"}
            </span>
          </div>
        ))}
      </div>

      <Text
        color="gray"
        fontSize="xs"
        className="mt-4 p-2 bg-gray-800 rounded"
      >
        💡 <strong>Tip:</strong> Timing Pattern의 검은색-흰색 반복 패턴을 통해 스캐너는 QR 코드의
        모듈 크기를 정확히 측정하고, 왜곡된 이미지에서도 올바른 위치를 계산할 수 있습니다.
      </Text>
    </div>
  );
};

export default TimingDetail;
