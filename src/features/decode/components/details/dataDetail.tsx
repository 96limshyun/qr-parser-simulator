import { useEffect, useMemo } from "react";

import type { DetailProps } from "@/features/decode/types/detailProps";

import { MODE_MAP } from "@/constants/modeMap";
import {
  createDataMask,
  DATA_MASKS,
  decodeAlphanumeric,
} from "@/features/decode/utils/createDataMask";
import Text from "@/ui/Text";

const CHARACTER_COUNT_BITS_MAP: Record<string, number> = {
  Numeric: 10,
  Alphanumeric: 9,
  Byte: 8,
  Kanji: 8,
};

function bitsToBytes(bits: string, characterCount: number): number[] {
  const bytes = [];
  for (let i = 0; i < characterCount; i++) {
    const byteBits = bits.slice(i * 8, i * 8 + 8);
    if (byteBits.length < 8) break;
    bytes.push(parseInt(byteBits, 2));
  }
  return bytes;
}

function bytesToText(bytes: number[]): string {
  return String.fromCharCode(...bytes);
}

const DataDetail = ({ matrix, formatInfo, setFormatInfo }: DetailProps) => {
  const maskPattern = formatInfo.maskPattern;
  const maskedMatrix = useMemo(() => createDataMask(matrix), [matrix]);
  const unmaskedMatrix = useMemo(() => {
    const dataMask = DATA_MASKS[maskPattern];
    return maskedMatrix.map(({ row, col }) => ({
      row,
      col,
      value: dataMask({ row, col }) ? matrix[row][col] ^ 1 : matrix[row][col],
    }));
  }, [maskedMatrix, matrix, maskPattern]);

  const bitsStr = useMemo(() => unmaskedMatrix.map((p) => p.value).join(""), [unmaskedMatrix]);

  let modeBits = "";
  let mode = "(Unknown)";
  let characterCount = 0;
  let decodedText = "(없음)";

  if (bitsStr && bitsStr.length >= 4) {
    modeBits = bitsStr.slice(0, 4);
    mode = MODE_MAP[modeBits] || "(Unknown)";

    const charCountBitsLen = CHARACTER_COUNT_BITS_MAP[mode] || 0;

    if (charCountBitsLen > 0 && bitsStr.length >= 4 + charCountBitsLen) {
      const countBits = bitsStr.slice(4, 4 + charCountBitsLen);
      characterCount = parseInt(countBits, 2);

      const dataBitsStart = 4 + charCountBitsLen;
      const dataBits = bitsStr.slice(dataBitsStart);

      if (mode === "Byte" && characterCount > 0) {
        const bytes = bitsToBytes(dataBits, characterCount);
        decodedText = bytesToText(bytes);
      } else if (mode === "Alphanumeric" && characterCount > 0) {
        decodedText = decodeAlphanumeric(dataBits, characterCount);
      }
    }
  }

  useEffect(() => {
    setFormatInfo((prev) => ({
      ...prev,
      dataBits: bitsStr,
      mode,
      modeBits,
      characterCount,
      decodedText,
    }));
  }, [bitsStr, mode, modeBits, characterCount, decodedText, setFormatInfo]);

  return (
    <div className="space-y-3 text-sm leading-6">
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

      <div className="mt-2 space-y-1">
        <Text color="gray">총 비트 길이: {bitsStr.length} bits</Text>
        <Text color="gray">모드: {mode}</Text>
        <Text color="gray">문자 수 (Character Count): {characterCount}</Text>
        <Text color="gray">디코딩된 텍스트: {decodedText}</Text>
      </div>
    </div>
  );
};

export default DataDetail;
