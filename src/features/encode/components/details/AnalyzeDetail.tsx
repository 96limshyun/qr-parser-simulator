import { useEffect, type Dispatch, type SetStateAction } from "react";

import type { EncodeInfoType, ModeIndicatorBitsType } from "@/features/encode/types/encodeInfoType";

import { CHECKS } from "@/features/encode/constants/modeChecks";
import Text from "@/ui/Text";

interface AnalyzeDetailProps {
  inputValue: string;
  encodeInfo: EncodeInfoType;
  setEncodeInfo: Dispatch<SetStateAction<EncodeInfoType>>;
}

const AnalyzeDetail = ({ inputValue, encodeInfo, setEncodeInfo }: AnalyzeDetailProps) => {
  const foundMode = CHECKS.find(({ regex }) => regex.test(inputValue));
  const mode = foundMode ? foundMode.mode : "Byte";
  const modeIndicatorBits =
    foundMode ? (foundMode.modeIndicatorBits as ModeIndicatorBitsType) : "0100";

  useEffect(() => {
    setEncodeInfo({
      mode,
      length: inputValue.length,
      modeIndicatorBits,
    });
  }, [inputValue]);

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
          모드 결정:
        </Text>
        <Text fontFamily="mono">{encodeInfo.mode}</Text>
      </div>

      <div className="flex gap-2">
        <Text
          color="gray"
          fontWeight="medium"
        >
          데이터 길이:
        </Text>
        <Text color="black">{encodeInfo.length} 글자</Text>
      </div>

      <div className="flex gap-2">
        <Text
          color="gray"
          fontWeight="medium"
        >
          Mode Indicator Bits:
        </Text>
        <Text>{encodeInfo.modeIndicatorBits}</Text>
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
