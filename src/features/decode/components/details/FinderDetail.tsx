import { detectFinderPositions } from "@/features/decode/utils/createFinderMask";
import Text from "@/ui/Text";

export interface StepDetailProps {
  matrix: number[][];
}

export const FinderDetail = ({ matrix }: StepDetailProps) => {
  const pos = detectFinderPositions(matrix);

  const label = (i: number) => ["좌측 상단", "우측 상단", "좌측 하단"][i] ?? `패턴 ${i + 1}`;

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
      <ul className="list-disc ml-5">
        {pos.map(({ rowStart, colStart }, i) => (
          <li key={i}>
            {label(i)} (
            <span className="font-mono">
              {rowStart}, {colStart}
            </span>
            )
          </li>
        ))}
      </ul>
    </div>
  );
};
