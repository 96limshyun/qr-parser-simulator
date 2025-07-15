import type { DetailProps } from "@/features/decode/types/detailProps";

import { ALPHANUMERIC_TABLE } from "@/constants/alphanumericTable";
import { MODE_MAP } from "@/constants/modeMap";
import { qr } from "@/libs/QR";
import Card from "@/ui/Card";
import Text from "@/ui/Text";
import Tooltip from "@/ui/Tooltip";

const DataDetail = ({ matrix }: DetailProps) => {
  const version = qr.qrDecoder.getVersionByMatrixSize(matrix.length);
  const unmaskedDataBits = qr.qrDecoder.unmaskDataBits(matrix);
  const decodedText = qr.qrDecoder.decodeBitToText(matrix);
  const modeBits = unmaskedDataBits.slice(0, 4);
  const mode = MODE_MAP[modeBits];

  const isURL = decodedText.startsWith("http://") || decodedText.startsWith("https://");

  const analyzeDataBits = (bits: string) => {
    if (!bits || bits.length < 4) return null;

    const charCountBitsLength = getCharCountBitsLength(mode, version);
    const charCountBits = bits.slice(4, 4 + charCountBitsLength);
    const dataBits = bits.slice(4 + charCountBitsLength);

    return {
      modeBits,
      charCountBits,
      dataBits,
      charCountBitsLength,
      modeDescription: getModeDescription(mode),
      charCountDescription: getCharCountDescription(mode, charCountBits),
    };
  };

  const getCharCountBitsLength = (mode: string, version: number) => {
    const charCountMap: Record<string, number[]> = {
      Numeric: [10, 12, 14],
      Alphanumeric: [9, 11, 13],
      Byte: [8, 16, 16],
      Kanji: [8, 10, 12],
    };

    const lengths = charCountMap[mode] || [8];
    if (version <= 9) return lengths[0];
    if (version <= 26) return lengths[1];
    return lengths[2];
  };

  const getModeDescription = (mode: string) => {
    const descriptions: Record<string, string> = {
      Numeric: "숫자 모드 (0-9): 3비트씩 묶어서 10진수로 변환",
      Alphanumeric:
        "영숫자 모드 (0-9, A-Z, 공백, $, %, *, +, -, ., /, :): 2비트씩 묶어서 45진수로 변환",
      Byte: "바이트 모드 (ISO-8859-1): 8비트씩 묶어서 ASCII로 변환",
      Kanji: "한자 모드 (Shift JIS): 13비트씩 묶어서 한자로 변환",
    };
    return descriptions[mode] || "알 수 없는 모드";
  };

  const getCharCountDescription = (mode: string, charCountBits: string) => {
    const charCount = parseInt(charCountBits, 2);
    return `${mode} 모드에서 ${charCount}개의 문자를 인코딩했습니다.`;
  };

  const dataAnalysis = analyzeDataBits(unmaskedDataBits);

  const modeBitsTooltip = (
    <div className="space-y-1">
      <div className="font-bold mb-2">모드 비트 (4비트):</div>
      <div className="space-y-1 text-xs">
        <div>
          <span className="font-mono">0001</span> - Numeric (숫자만)
        </div>
        <div>
          <span className="font-mono">0010</span> - Alphanumeric (영숫자(대문자))
        </div>
        <div>
          <span className="font-mono">0100</span> - Byte (바이너리 데이터)
        </div>
        <div>
          <span className="font-mono">1000</span> - Kanji (한자)
        </div>
      </div>
    </div>
  );

  const charCountTooltip = (
    <div className="space-y-1">
      <div className="font-bold mb-2">문자 수 비트 ({dataAnalysis?.charCountBitsLength}비트):</div>
      <div className="space-y-1 text-xs">
        <div>인코딩된 문자의 개수를 나타냅니다.</div>
        <div>비트 길이는 QR 코드 버전과 모드에 따라 달라집니다:</div>
        <div>• 버전 1-9: {getCharCountBitsLength(mode, 1)}비트</div>
        <div>• 버전 10-26: {getCharCountBitsLength(mode, 10)}비트</div>
        <div>• 버전 27-40: {getCharCountBitsLength(mode, 27)}비트</div>
      </div>
    </div>
  );

  const dataConversionTooltip = (
    <div className="space-y-1">
      <div className="font-bold mb-2">데이터 변환 과정:</div>
      <div className="space-y-1 text-xs">
        <div>{dataAnalysis?.modeDescription}</div>
        <div>{dataAnalysis?.charCountDescription}</div>
        <div className="mt-2">변환 과정:</div>
        <div>1. 데이터 비트를 모드에 따라 적절한 크기로 분할</div>
        <div>2. 각 분할된 비트를 해당 모드의 규칙에 따라 변환</div>
        <div>3. 변환된 값들을 연결하여 최종 텍스트 생성</div>
      </div>
    </div>
  );

  const alphanumericTableTooltip = (
    <div className="space-y-1">
      <div className="font-bold mb-2">Alphanumeric 테이블:</div>
      <div className="text-xs">
        <div className="grid grid-cols-8 gap-1 mb-2">
          {ALPHANUMERIC_TABLE.map((char, index) => (
            <div
              key={index}
              className="text-center p-1 bg-gray-700 rounded"
            >
              <div className="text-xs text-gray-400">{index}</div>
              <div className="font-bold">{char}</div>
            </div>
          ))}
        </div>
        <div className="text-gray-300">각 인덱스는 2비트씩 묶어서 45진수로 변환됩니다.</div>
      </div>
    </div>
  );

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
      <Card
        tone="subtle"
        padding="sm"
        className="max-h-48 overflow-y-auto"
      >
        <div className="bg-gray-800 text-white font-mono p-2 rounded text-xs break-all">
          {unmaskedDataBits || "(데이터 없음)"}
        </div>
      </Card>

      <div className="mt-2 space-y-1">
        <Text color="gray">총 비트 길이: {unmaskedDataBits.length} bits</Text>
        <Text color="gray">모드: {mode}</Text>
        <Text color="gray">
          문자 수 (Character Count): {parseInt(dataAnalysis!.charCountBits, 2)}
        </Text>
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

      {dataAnalysis && (
        <>
          <Text
            fontWeight="bold"
            fontSize="sm"
            className="mt-4"
          >
            데이터 비트 구조 분석:
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
                📊 비트 구조:
              </Text>
              <div className="space-y-2 font-mono text-xs">
                <Tooltip
                  content={modeBitsTooltip}
                  position="top"
                >
                  <div className="flex items-center gap-2 cursor-help">
                    <span className="bg-blue-500 px-2 py-1 rounded">모드 비트</span>
                    <span>{dataAnalysis.modeBits} (4비트)</span>
                  </div>
                </Tooltip>
                <Tooltip
                  content={charCountTooltip}
                  position="top"
                >
                  <div className="flex items-center gap-2 cursor-help">
                    <span className="bg-green-500 px-2 py-1 rounded">문자 수 비트</span>
                    <span>
                      {dataAnalysis.charCountBits} ({dataAnalysis.charCountBitsLength}비트)
                    </span>
                  </div>
                </Tooltip>
                <Tooltip
                  content={dataConversionTooltip}
                  position="top"
                >
                  <div className="flex items-center gap-2 cursor-help">
                    <span className="bg-purple-500 px-2 py-1 rounded">데이터 비트</span>
                    <span>{dataAnalysis.dataBits.length}비트</span>
                  </div>
                </Tooltip>
              </div>
            </div>

            {mode === "Alphanumeric" && (
              <div>
                <Tooltip
                  content={alphanumericTableTooltip}
                  position="top"
                >
                  <div className="cursor-help">
                    <Text
                      fontWeight="bold"
                      fontSize="sm"
                      className="mb-2"
                    >
                      🔤 Alphanumeric 인코딩 테이블:
                    </Text>
                    <div className="grid grid-cols-8 gap-1 text-xs">
                      {ALPHANUMERIC_TABLE.slice(0, 16).map((char, index) => (
                        <div
                          key={index}
                          className="text-center p-1 bg-gray-700 rounded"
                        >
                          <div className="text-xs text-gray-400">{index}</div>
                          <div className="font-bold">{char}</div>
                        </div>
                      ))}
                    </div>
                    <Text
                      color="gray"
                      fontSize="xs"
                      className="mt-2"
                    >
                      마우스를 올려서 전체 테이블을 확인하세요
                    </Text>
                  </div>
                </Tooltip>
              </div>
            )}

            <div>
              <Text
                fontWeight="bold"
                fontSize="sm"
                className="mb-2"
              >
                💡 실제 변환 예시:
              </Text>
              <div className="space-y-1 text-xs">
                {mode === "Byte" && (
                  <div className="bg-gray-700 p-2 rounded">
                    <div className="font-bold mb-1">Byte 모드 변환:</div>
                    <div>데이터 비트: {dataAnalysis.dataBits.slice(0, 24)}...</div>
                    <div>8비트씩 분할 → ASCII 코드로 변환 → 텍스트 생성</div>
                  </div>
                )}
                {mode === "Numeric" && (
                  <div className="bg-gray-700 p-2 rounded">
                    <div className="font-bold mb-1">Numeric 모드 변환:</div>
                    <div>데이터 비트: {dataAnalysis.dataBits.slice(0, 24)}...</div>
                    <div>3비트씩 분할 → 10진수로 변환 → 숫자 연결</div>
                  </div>
                )}
                {mode === "Alphanumeric" && (
                  <div className="bg-gray-700 p-2 rounded">
                    <div className="font-bold mb-1">Alphanumeric 모드 변환:</div>
                    <div>데이터 비트: {dataAnalysis.dataBits.slice(0, 24)}...</div>
                    <div>2비트씩 분할 → 45진수로 변환 → 문자 매핑</div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default DataDetail;
