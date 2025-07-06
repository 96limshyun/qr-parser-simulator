import type { ErrorCorrectionLevel } from "@/types/versionCapacityTableType";
import type React from "react";
import type { Dispatch, SetStateAction } from "react";

import Card from "@/ui/Card";
import Input from "@/ui/Input";
import Text from "@/ui/Text";

interface QrEncoderInputProps {
  inputValue: string;
  // eslint-disable-next-line no-unused-vars
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errorCorrectionLevel: ErrorCorrectionLevel;
  setErrorCorrectionLevel: Dispatch<SetStateAction<ErrorCorrectionLevel>>;
}

const QrEncoderInput = ({
  inputValue,
  onInputChange,
  errorCorrectionLevel,
  setErrorCorrectionLevel,
}: QrEncoderInputProps) => {
  const onErrorCorrectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newErrorCorrectionLevel = event.target.value as ErrorCorrectionLevel;
    setErrorCorrectionLevel(newErrorCorrectionLevel);
  };

  return (
    <Card className="w-full flex flex-col items-center justify-center gap-2">
      <Text
        fontWeight="bold"
        fontSize="lg"
      >
        QR 인코더
      </Text>
      <Text fontSize="sm">인코딩할 데이터를 입력하세요</Text>
      <Input
        htmlType="text"
        size="lg"
        rounded="lg"
        className="w-full flex justify-center"
        value={inputValue}
        onChange={onInputChange}
      />
      <div className="w-full flex flex-col gap-1 mt-2">
        <Text
          fontSize="sm"
          fontWeight="medium"
          color="gray"
        >
          오류 정정 레벨 선택
        </Text>
        <select
          value={errorCorrectionLevel}
          onChange={onErrorCorrectionChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="L">L (7% 복원)</option>
          <option value="M">M (15% 복원)</option>
          <option value="Q">Q (25% 복원)</option>
          <option value="H">H (30% 복원)</option>
        </select>
        <Text
          fontSize="xs"
          color="gray"
        >
          높은 레벨일수록 손상 복원력은 높아지지만 QR 코드가 커집니다.
        </Text>
      </div>
    </Card>
  );
};

export default QrEncoderInput;
