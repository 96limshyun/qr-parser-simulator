import type { DetailProps } from "@/features/decode/types/detailProps";

import Text from "@/ui/Text";

const QrResultDetail = ({ qrDecodeResult }: DetailProps) => {
  const bitsStr = qrDecodeResult.unmaskedDataBits;
  const decodedBytesStr =
    qrDecodeResult.eccCorrected && qrDecodeResult.eccCorrected.length > 0 ?
      qrDecodeResult.eccCorrected.join(", ")
    : "(없음)";
  const decodedText = qrDecodeResult.decodedText || "(없음)";

  return (
    <div className="space-y-4 text-sm leading-6">
      <Text
        color="gray"
        className="whitespace-pre-line"
      >
        QR 코드의 데이터 영역은 실제 정보가 인코딩된 비트로 구성됩니다. Finder, Timing, Format,
        Alignment 등 기능 패턴 영역을 제외한 모듈들만 데이터로 사용됩니다.
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
        총 비트 길이: {bitsStr?.length || 0} bits
      </Text>

      <Text
        fontWeight="bold"
        fontSize="sm"
        className="mt-4"
      >
        ECC 정정 후 데이터 코드워드 (10진수):
      </Text>
      <div className="bg-gray-800 text-white font-mono p-2 rounded text-xs break-all">
        {decodedBytesStr}
      </div>
      <Text color="gray">총 코드워드 수: {qrDecodeResult.eccCorrected?.length || 0} 개</Text>

      <Text
        fontWeight="bold"
        fontSize="sm"
        className="mt-4"
      >
        디코딩된 텍스트:
      </Text>
      <div className="bg-gray-800 text-white font-mono p-2 rounded text-xs break-all">
        {decodedText}
      </div>

      <div className="mt-4 space-y-1">
        <Text color="gray">Version: {qrDecodeResult.version}</Text>
        <Text color="gray">Mask Pattern: {qrDecodeResult.maskPattern}</Text>
        <Text color="gray">ECC Level: {qrDecodeResult.eccLevel}</Text>
        <Text color="gray">모드 비트: {qrDecodeResult.modeBits || "(없음)"}</Text>
        <Text color="gray">모드: {qrDecodeResult.mode || "(미확인)"}</Text>
        <Text color="gray">
          총 글자 수 (Character Count): {qrDecodeResult.characterCount ?? "(미확인)"}
        </Text>
        <Text color="gray">Format Raw Bits: {qrDecodeResult.rawFormatBits || "(없음)"}</Text>
        <Text color="gray">
          Format Unmasked Bits: {qrDecodeResult.unmaskedFormatBits || "(없음)"}
        </Text>
      </div>
    </div>
  );
};

export default QrResultDetail;
