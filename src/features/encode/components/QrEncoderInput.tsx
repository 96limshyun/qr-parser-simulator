import type React from "react";

import Card from "@/ui/Card";
import Input from "@/ui/Input";
import Text from "@/ui/Text";

interface QrEncoderInputProps {
  inputValue: string;
  // eslint-disable-next-line no-unused-vars
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const QrEncoderInput = ({ inputValue, onInputChange }: QrEncoderInputProps) => {
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
    </Card>
  );
};

export default QrEncoderInput;
