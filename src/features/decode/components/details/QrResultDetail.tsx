import type { DetailProps } from "@/features/decode/types/detailProps";

import { MODE_MAP } from "@/constants/modeMap";
import { qr } from "@/libs/QR";
import Card from "@/ui/Card";
import Text from "@/ui/Text";

const QrResultDetail = ({ matrix }: DetailProps) => {
  const decodedText = qr.qrDecoder.decodeBitToText(matrix);
  const version = qr.qrDecoder.getVersionByMatrixSize(matrix.length);
  const formatBits = qr.qrDecoder.getMaskedFormatBits(matrix);
  const maskPattern = qr.qrDecoder.getMaskPattern(formatBits);
  const eccLevel = qr.qrDecoder.getECLevel(formatBits);
  const dataBits = qr.qrDecoder.unmaskDataBits(matrix);
  const mode = MODE_MAP[dataBits.slice(0, 4)];

  return (
    <div className="space-y-4 text-sm leading-6">
      <Text
        color="gray"
        className="whitespace-pre-line"
      >
        QR 코드의 데이터 영역은 실제 정보가 인코딩된 비트로 구성됩니다. Finder, Timing, Format,
        Alignment 등 기능 패턴 영역을 제외한 모듈들만 데이터로 사용됩니다.
      </Text>

      <Card
        tone="subtle"
        padding="sm"
        className="max-h-48 overflow-y-auto"
      >
        <div className="bg-gray-800 text-white font-mono p-2 rounded text-xs break-all">
          {dataBits || "(데이터 없음)"}
        </div>
      </Card>

      <div className="mt-2 space-y-1">
        <Text color="gray">버전: {version}</Text>
        <Text color="gray">포맷 비트: {formatBits}</Text>
        <Text color="gray">마스크 패턴: {maskPattern}</Text>
        <Text color="gray">에러 정정 레벨: {eccLevel}</Text>
        <Text color="gray">모드: {mode}</Text>
        <Text color="green">디코딩된 텍스트: {decodedText}</Text>
      </div>
    </div>
  );
};

export default QrResultDetail;
