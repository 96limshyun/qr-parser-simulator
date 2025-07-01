import { type Dispatch, type SetStateAction } from "react";

import useQrScanner from "@/features/decode/hooks/useQrScanner";
import Button from "@/ui/Button";
import Card from "@/ui/Card";
import Input from "@/ui/Input";
import Text from "@/ui/Text";
interface QrScannerProps {
  setMatrix: Dispatch<SetStateAction<number[][]>>;
  isPlaying: boolean;
}
const CONTAINER_ID = "qr-video-box";

const QrScanner = ({ setMatrix, isPlaying }: QrScannerProps) => {
  const { canvasRef, videoBoxRef, isCameraOn, handleFileChange, handleCameraToggle } =
    useQrScanner(setMatrix);

  return (
    <Card className="w-full flex flex-col items-center justify-center gap-2">
      <Text
        fontWeight="bold"
        fontSize="lg"
      >
        QR 디코더
      </Text>
      <Text fontSize="sm">이미지를 업로드하거나 QR 코드를 스캔하세요</Text>
      <Input
        htmlType="file"
        label="이미지 선택"
        fileAccept="image"
        size="lg"
        rounded="lg"
        full
        tone="secondary"
        className="flex justify-center"
        onChange={handleFileChange}
        disabled={isPlaying}
      />
      <Button
        layout="block"
        className="flex justify-center transition-colors duration-300 ease-in-out"
        intent={`${isCameraOn ? "danger" : "primary"}`}
        onClick={handleCameraToggle}
        disabled={isPlaying}
      >
        {isCameraOn ? "카메라 중지" : "카메라 시작"}
      </Button>
      <div
        id={CONTAINER_ID}
        ref={videoBoxRef}
        className={`relative w-full h-full rounded-lg overflow-hidden border
                  border-gray-600 mt-3 ${isCameraOn ? "" : "hidden"}`}
      />
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </Card>
  );
};

export default QrScanner;
