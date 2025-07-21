import { LiaEyeSolid, LiaCrossSolid } from "react-icons/lia";

import type { DetailProps } from "@/features/decode/types/detailProps";

import { qr } from "@/libs/QR";
import Card from "@/ui/Card";
import Text from "@/ui/Text";

const FinderDetail = ({ matrix }: DetailProps) => {
  const finderPositions = qr.qrDecoder.detectFinderPositions(matrix);
  const alignmentPositions = qr.qrDecoder.detectAlignmentPositions(matrix);

  const finderLabel = (i: number) => ["좌측 상단", "우측 상단", "좌측 하단"][i] ?? `패턴 ${i + 1}`;

  return (
    <div className="space-y-1 text-sm leading-6">
      <Text
        color="gray"
        className="whitespace-pre-line"
      >
        QR 코드의 세 모서리에는 위치 탐지를 위한 특수한 사각형 패턴이 존재합니다.{`\n`}이 패턴을
        통해 QR 코드의 방향과 각도를 파악할 수 있습니다.
      </Text>

      <Text
        fontWeight="bold"
        fontSize="sm"
        className="mt-2"
      >
        검출된 위치 패턴:
      </Text>
      <Card
        tone="subtle"
        padding="sm"
        className="max-h-48 overflow-y-auto w-full mt-4"
      >
        <div className="space-y-1">
          {finderPositions.map(({ row, col }, i) => (
            <div
              key={i}
              className="flex items-center gap-2"
            >
              <LiaEyeSolid />
              {finderLabel(i)} (
              <span className="font-mono">
                {row}, {col}
              </span>
              )
            </div>
          ))}
        </div>
      </Card>

      {alignmentPositions.length > 0 && (
        <>
          <Text
            color="gray"
            className="whitespace-pre-line mt-4"
          >
            QR 코드 버전 2 이상에서는 정렬 패턴(Alignment Pattern)이 추가로 존재합니다.{`\n`}이
            패턴은 QR 코드가 왜곡되었을 때 정확한 위치를 보정하는 데 사용됩니다.
          </Text>

          <Text
            fontWeight="bold"
            fontSize="sm"
            className="mt-2"
          >
            검출된 정렬 패턴:
          </Text>
          <div>
            {alignmentPositions.map(({ row, col }, i) => (
              <div
                key={i}
                className="flex items-center gap-2"
              >
                <LiaCrossSolid />
                정렬 패턴 {i + 1} (
                <span className="font-mono">
                  {row}, {col}
                </span>
                )
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FinderDetail;
