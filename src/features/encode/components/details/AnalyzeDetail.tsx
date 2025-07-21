import type { ErrorCorrectionLevel, Mode } from "@/types/versionCapacityTableType";

import { qr } from "@/libs/QR";
import Text from "@/ui/Text";

interface AnalyzeDetailProps {
  inputValue: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
}

const AnalyzeDetail = ({ inputValue, errorCorrectionLevel }: AnalyzeDetailProps) => {
  const smallestVersion = qr.qrEncoder.getSmallestVersion(inputValue, errorCorrectionLevel);
  const mode = qr.qrEncoder.getMode(inputValue);
  const modeIndicatorBits = mode.modeIndicatorBits;
  const charCountBitLength = qr.qrEncoder.getCharCountBitLength(
    smallestVersion,
    mode.mode as Mode,
    inputValue,
  );

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <div className="flex gap-2">
        <Text
          color="gray"
          fontWeight="medium"
        >
          입력 값:
        </Text>
        <Text color="black">{inputValue || "(빈 입력)"}</Text>
      </div>
      <div className="flex gap-2">
        <Text
          color="gray"
          fontWeight="medium"
        >
          모드:
        </Text>
        <Text color="black">{mode.mode}</Text>
      </div>

      <div className="flex gap-2">
        <Text
          color="gray"
          fontWeight="medium"
        >
          모드 인디케이터 비트:
        </Text>
        <Text>{modeIndicatorBits}</Text>
      </div>

      <div className="flex gap-2">
        <Text
          color="gray"
          fontWeight="medium"
        >
          데이터 길이:
        </Text>
        <Text color="black">{parseInt(charCountBitLength, 2)} 글자</Text>
      </div>

      <div className="mt-4 space-y-2">
        <Text>
          Mode Indicator Bits 는 QR 코드에서 모드 정보를 나타내는 비트 입니다. 입력 데이터의 타입에
          따라 아래 값 중 하나로 설정됩니다:
        </Text>

        <ul className="list-disc space-y-1">
          <li className="flex items-center">
            <Text
              as="span"
              color="red"
              fontFamily="mono"
            >
              0001
            </Text>{" "}
            - Numeric 모드 (숫자만 인코딩)
          </li>
          <li className="flex items-center">
            <Text
              as="span"
              color="red"
              fontFamily="mono"
            >
              0010
            </Text>{" "}
            - Alphanumeric 모드 (대문자, 숫자, 일부 특수 문자)
          </li>
          <li className="flex items-center">
            <Text
              as="span"
              color="red"
              fontFamily="mono"
            >
              0100
            </Text>{" "}
            - Byte 모드 (일반 텍스트, UTF-8 등)
          </li>
        </ul>

        <Text>
          예를 들어, Mode Indicator Bits가 0010 이면 Alphanumeric 모드 를 의미하며, 이는 A-Z, 0-9,
          공백, $ % * + - . / : 등의 문자를 인코딩할 수 있습니다.
        </Text>
      </div>
    </div>
  );
};

export default AnalyzeDetail;
