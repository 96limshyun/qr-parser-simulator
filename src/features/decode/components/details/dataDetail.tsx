import type { DetailProps } from "@/features/decode/types/detailProps";

import Text from "@/ui/Text";

const DataDetail = ({ qrDecodeResult }: DetailProps) => {
  const { unmaskedDataBits, mode, characterCount, decodedText } = qrDecodeResult;

  const isURL = decodedText.startsWith("http://") || decodedText.startsWith("https://");

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
        {unmaskedDataBits || "(데이터 없음)"}
      </div>

      <div className="mt-2 space-y-1">
        <Text color="gray">총 비트 길이: {unmaskedDataBits.length} bits</Text>
        <Text color="gray">모드: {mode}</Text>
        <Text color="gray">문자 수 (Character Count): {characterCount}</Text>
        <Text color="gray">디코딩된 텍스트: {decodedText}</Text>
        {isURL && (
          <div className="mt-2">
            <Text
              color="blue"
              className="font-semibold"
            >
              🔗 URL이 감지되었습니다!
            </Text>
            <a
              href={decodedText}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline break-all"
            >
              {decodedText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataDetail;
