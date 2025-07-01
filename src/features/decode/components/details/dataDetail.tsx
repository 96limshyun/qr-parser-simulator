import { useEffect, useMemo } from "react";

import type { DetailProps } from "@/features/decode/types/detailProps";

import { createDataMask, getMaskBit } from "@/features/decode/utils/createDataMask";
import Text from "@/ui/Text";

const DataDetail = ({ matrix, formatInfo, setFormatInfo }: DetailProps) => {
  const maskPattern = formatInfo.maskPattern;
  const maskedMatrix = useMemo(() => createDataMask(matrix), [matrix]);
  const unmaskedMatrix = useMemo(
    () =>
      maskedMatrix.map(({ row, col }) => ({
        row,
        col,
        value: matrix[row][col] ^ getMaskBit(row, col, maskPattern),
      })),
    [maskedMatrix, matrix, maskPattern],
  );

  const bitsStr = useMemo(() => unmaskedMatrix.map((p) => p.value).join(""), [unmaskedMatrix]);
  useEffect(() => {
    setFormatInfo((prev) => (prev.dataBits === bitsStr ? prev : { ...prev, dataBits: bitsStr }));
  }, [bitsStr, setFormatInfo]);

  return (
    <div className="space-y-1 text-sm leading-6">
      <Text
        color="gray"
        className="whitespace-pre-line"
      >
        QR 코드의 데이터 영역은 실제 정보가 인코딩된 비트로 구성됩니다.
        {"\n"}
        Finder, Timing, Format, Alignment 등 기능 패턴 영역을 제외한 모듈들만 데이터로 사용됩니다.
      </Text>

      <Text
        fontWeight="bold"
        fontSize="sm"
        className="mt-2"
      >
        추출된 데이터 비트:
      </Text>

      <div className="bg-gray-800 text-white font-mono p-2 rounded text-xs break-all">
        {bitsStr || "(데이터 없음)"}
      </div>

      <Text
        color="gray"
        className="mt-2"
      >
        총 비트 길이: {bitsStr.length} bits
      </Text>
    </div>
  );
};

export default DataDetail;
