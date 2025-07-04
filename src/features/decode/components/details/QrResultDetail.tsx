import type { DetailProps } from "@/features/decode/types/detailProps";

import Text from "@/ui/Text";

const QrResultDetail = ({ formatInfo }: DetailProps) => {
  const bitsStr = formatInfo.dataBits;
  const decodedBytesStr =
    formatInfo.eccCorrected && formatInfo.eccCorrected.length > 0 ?
      formatInfo.eccCorrected.join(", ")
    : "(없음)";
  const decodedText = formatInfo.decodedText || "(없음)";

  console.log("QrResultDetail formatInfo", formatInfo);

  return (
    <div className="space-y-4 text-sm leading-6">
      <Text
        color="gray"
        className="whitespace-pre-line"
      >
        QR 코드의 데이터 영역은 실제 정보가 인코딩된 비트로 구성됩니다. Finder, Timing, Format,
        Alignment 등 기능 패턴 영역을 제외한 모듈들만 데이터로 사용됩니다.
      </Text>

      {/* dataBits */}
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

      {/* ECC 정보 */}
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
      <Text color="gray">총 코드워드 수: {formatInfo.eccCorrected?.length || 0} 개</Text>

      {/* 디코딩된 텍스트 */}
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

      {/* 추가 정보 */}
      <div className="mt-4 space-y-1">
        <Text color="gray">Version: {formatInfo.version}</Text>
        <Text color="gray">Mask Pattern: {formatInfo.maskPattern}</Text>
        <Text color="gray">ECC Level: {formatInfo.eccLevel}</Text>
        <Text color="gray">모드 비트: {formatInfo.modeBits || "(없음)"}</Text>
        <Text color="gray">모드: {formatInfo.mode || "(미확인)"}</Text>
        <Text color="gray">
          총 글자 수 (Character Count): {formatInfo.characterCount ?? "(미확인)"}
        </Text>
        <Text color="gray">Format Raw Bits: {formatInfo.rawBits || "(없음)"}</Text>
        <Text color="gray">Format Unmasked Bits: {formatInfo.unmaskedBits || "(없음)"}</Text>
      </div>
    </div>
  );
};

export default QrResultDetail;
