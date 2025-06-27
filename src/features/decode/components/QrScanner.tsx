import jsQR from "jsqr";
import QRCode from "qrcode";
import { useRef, type ChangeEvent, type Dispatch, type SetStateAction } from "react";

import Button from "@/ui/Button";
import Card from "@/ui/Card";
import Input from "@/ui/Input";
import Text from "@/ui/Text";

interface QrScannerProps {
  setMatrix: Dispatch<SetStateAction<number[][]>>;
}

const QrScanner = ({ setMatrix }: QrScannerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const result = jsQR(data, width, height);

        if (!result?.data) {
          alert("QR을 인식하지 못했습니다.");
          return;
        }

        const qr = QRCode.create(result.data, { errorCorrectionLevel: "M" });
        const mod = qr.modules;
        const matrix = Array.from({ length: mod.size }, (_, row) =>
          Array.from({ length: mod.size }, (_, col) => (mod.get(col, row) ? 1 : 0)),
        );

        setMatrix(matrix);
      };
    };
    reader.readAsDataURL(file!);
  };

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
      />
      <Button
        layout="block"
        className="flex justify-center"
      >
        카메라 시작
      </Button>
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </Card>
  );
};

export default QrScanner;
