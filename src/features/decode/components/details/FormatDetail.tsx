import { LiaKeySolid } from "react-icons/lia";

import type { DetailProps } from "@/features/decode/types/detailProps";

import Card from "@/ui/Card";
import Text from "@/ui/Text";
import Tooltip from "@/ui/Tooltip";

const FormatDetail = ({ color, qrDecoder, qrDecodeResult }: DetailProps) => {
  const positions = qrDecoder.detectFormatPositions();

  const formatInfo =
    qrDecodeResult ?
      {
        rawBits: qrDecodeResult.rawFormatBits,
        unmaskedBits: qrDecodeResult.unmaskedFormatBits,
        eccLevel: qrDecodeResult.eccLevel,
        maskPattern: qrDecodeResult.maskPattern,
      }
    : qrDecoder.decodeFormatInfo();

  const analyzeFormatBits = (bits: string) => {
    if (bits.length !== 15) return null;

    const eccLevelBits = bits.slice(0, 2);
    const maskPatternBits = bits.slice(2, 5);
    const bchBits = bits.slice(5, 15);

    const eccLevelMap: Record<string, string> = {
      "00": "L (Low) - 7% 복구 가능",
      "01": "M (Medium) - 15% 복구 가능",
      "10": "Q (Quartile) - 25% 복구 가능",
      "11": "H (High) - 30% 복구 가능",
    };

    return {
      eccLevel: eccLevelMap[eccLevelBits] || "알 수 없음",
      maskPattern: `패턴 ${parseInt(maskPatternBits, 2)}번`,
      bchCode: bchBits,
      eccLevelBits,
      maskPatternBits,
    };
  };

  const formatAnalysis = analyzeFormatBits(formatInfo.unmaskedBits);

  const eccLevelTooltip = (
    <div className="space-y-1">
      <div className="font-bold mb-2">오류 정정 레벨 (ECC Level):</div>
      <div className="space-y-1 text-xs">
        <div>
          <span className="font-mono">00</span> - L (Low): 7% 데이터 복구 가능
        </div>
        <div>
          <span className="font-mono">01</span> - M (Medium): 15% 데이터 복구 가능
        </div>
        <div>
          <span className="font-mono">10</span> - Q (Quartile): 25% 데이터 복구 가능
        </div>
        <div>
          <span className="font-mono">11</span> - H (High): 30% 데이터 복구 가능
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-300">
        높은 레벨일수록 더 많은 오류를 수정할 수 있지만, 데이터 용량은 줄어듭니다.
      </div>
    </div>
  );

  const maskPatternTooltip = (
    <div className="space-y-1">
      <div className="font-bold mb-2">마스크 패턴 (Mask Pattern):</div>
      <div className="space-y-1 text-xs">
        <div>
          <span className="font-mono">000</span> - 패턴 0: (row + col) % 2 == 0
        </div>
        <div>
          <span className="font-mono">001</span> - 패턴 1: row % 2 == 0
        </div>
        <div>
          <span className="font-mono">010</span> - 패턴 2: col % 3 == 0
        </div>
        <div>
          <span className="font-mono">011</span> - 패턴 3: (row + col) % 3 == 0
        </div>
        <div>
          <span className="font-mono">100</span> - 패턴 4: (row/2 + col/3) % 2 == 0
        </div>
        <div>
          <span className="font-mono">101</span> - 패턴 5: (row*col) % 2 + (row*col) % 3 == 0
        </div>
        <div>
          <span className="font-mono">110</span> - 패턴 6: ((row*col) % 2 + (row*col) % 3) % 2 == 0
        </div>
        <div>
          <span className="font-mono">111</span> - 패턴 7: (row+col) % 2 + (row*col) % 3 % 2 == 0
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-300">
        마스크 패턴은 QR 코드의 가독성을 높이기 위해 데이터 영역에 적용됩니다.
      </div>
    </div>
  );

  return (
    <div className="space-y-2 text-sm leading-6">
      <Text
        color="gray"
        className="whitespace-pre-line"
      >
        QR 코드의 Format 정보 영역은 오류 정정 레벨(ECC)과 마스크 패턴 정보를 저장하고 있습니다.
        {"\n"}이 영역을 통해 디코더가 데이터 영역을 올바르게 해석할 수 있습니다.
      </Text>

      <Text
        fontWeight="bold"
        fontSize="sm"
        className="mt-2"
      >
        검출된 Format 정보 모듈:
      </Text>
      <Card
        tone="subtle"
        padding="sm"
        className="max-h-48 overflow-y-auto w-full mt-4"
      >
        <div className="space-y-1">
          {positions.map(({ row, col, value }, i) => (
            <div
              key={i}
              className="flex items-center gap-2 py-1"
            >
              <LiaKeySolid className="text-blue-400 flex-shrink-0" />
              <span className="font-mono text-xs">
                ({row}, {col})
              </span>
              <span className="text-gray-400">→</span>
              <span className={value ? "text-black font-medium" : "text-gray-300"}>
                {value ? "검정" : "흰색"}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Text
        fontWeight="bold"
        fontSize="sm"
        className="mt-4"
      >
        디코딩된 Format 정보:
      </Text>
      <div className="space-y-1 font-mono">
        <Text
          fontSize="sm"
          color={color}
        >
          포맷 원본 비트: {formatInfo.rawBits}
        </Text>
        <Text
          fontSize="sm"
          color={color}
        >
          마스크 해제 후 비트: {formatInfo.unmaskedBits}
        </Text>
        <Text
          fontSize="sm"
          color={color}
        >
          오류 정정 수준: {formatInfo.eccLevel}
        </Text>
        <Text
          fontSize="sm"
          color={color}
        >
          마스크 패턴 번호: {formatInfo.maskPattern}번
        </Text>
      </div>

      {formatAnalysis && (
        <>
          <Text
            fontWeight="bold"
            fontSize="sm"
            className="mt-4"
          >
            Format 정보 상세 분석:
          </Text>
          <Card
            tone="primary"
            padding="sm"
            className="space-y-3 mt-4 w-full"
          >
            <div>
              <Text
                fontWeight="bold"
                fontSize="sm"
                className="mb-2"
              >
                🔍 마스킹이 필요한 이유:
              </Text>
              <Text
                color="gray"
                fontSize="xs"
                className="whitespace-pre-line"
              >
                Format 정보는 QR 코드의 가장 중요한 정보이므로, 데이터 영역과 구분하기 위해 마스킹을
                적용합니다.{`\n`}
                마스킹 패턴 101010000010010을 XOR 연산으로 적용하여 Format 정보를 숨깁니다.
              </Text>
            </div>

            <div>
              <Text
                fontWeight="bold"
                fontSize="sm"
                className="mb-2"
              >
                📊 비트 구조 분석:
              </Text>
              <div className="space-y-2 font-mono text-xs">
                <Tooltip
                  content={eccLevelTooltip}
                  position="top"
                >
                  <div className="flex items-center gap-2 cursor-help">
                    <span className="bg-blue-500 px-2 py-1 rounded">오류 정정 레벨</span>
                    <span>
                      {formatAnalysis.eccLevelBits} ({formatAnalysis.eccLevel})
                    </span>
                  </div>
                </Tooltip>
                <Tooltip
                  content={maskPatternTooltip}
                  position="top"
                >
                  <div className="flex items-center gap-2 cursor-help">
                    <span className="bg-green-500 px-2 py-1 rounded">마스크 패턴</span>
                    <span>
                      {formatAnalysis.maskPatternBits} ({formatAnalysis.maskPattern})
                    </span>
                  </div>
                </Tooltip>
                <div className="flex items-center gap-2">
                  <span className="bg-purple-500 px-2 py-1 rounded">BCH 오류 정정 코드</span>
                  <span>{formatAnalysis.bchCode}</span>
                </div>
              </div>
            </div>

            <div>
              <Text
                fontWeight="bold"
                fontSize="sm"
                className="mb-2"
              >
                🛡️ BCH 오류 정정 코드:
              </Text>
              <Text
                color="gray"
                fontSize="xs"
                className="whitespace-pre-line"
              >
                BCH(Bose-Chaudhuri-Hocquenghem) 코드는 Format 정보의 무결성을 보장합니다.{`\n`}
                10비트의 BCH 코드로 Format 정보가 손상되었는지 감지하고, 일부 오류를 자동으로 수정할
                수 있습니다.
              </Text>
            </div>

            <div>
              <Text
                fontWeight="bold"
                fontSize="sm"
                className="mb-2"
              >
                🎯 마스크 패턴의 역할:
              </Text>
              <Text
                color="gray"
                fontSize="xs"
                className="whitespace-pre-line"
              >
                마스크 패턴은 QR 코드의 데이터 영역에 적용되어 연속된 같은 색상 모듈을 줄이고,{`\n`}
                Finder Pattern과 유사한 패턴을 방지하여 스캐너가 더 정확하게 읽을 수 있도록
                도와줍니다.
              </Text>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default FormatDetail;
