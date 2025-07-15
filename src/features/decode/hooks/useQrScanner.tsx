import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";
import QRCode from "qrcode";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";

const CONTAINER_ID = "qr-video-box";

const useQrScanner = (setMatrix: Dispatch<SetStateAction<number[][]>>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoBoxRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<Html5Qrcode | null>(null);

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
          console.log("QR을 인식하지 못했습니다.");
          return;
        }

        const qr = QRCode.create(result.data);
        const mod = qr.modules;
        const matrix = Array.from({ length: mod.size }, (_, row) =>
          Array.from({ length: mod.size }, (_, col) => (mod.get(col, row) ? 1 : 0)),
        );

        setMatrix(matrix);
      };
    };
    reader.readAsDataURL(file!);
  };

  const handleCameraToggle = () => {
    setIsCameraOn((prev) => !prev);
  };

  useEffect(() => {
    if (!isCameraOn) {
      if (readerRef.current) {
        readerRef.current
          .stop()
          .catch(() => {})
          .finally(() => readerRef.current?.clear());
        readerRef.current = null;
      }
      return;
    }

    const reader = new Html5Qrcode(CONTAINER_ID, false);
    readerRef.current = reader;

    reader
      .start(
        { facingMode: "environment" },
        { fps: 15, qrbox: 250 },
        (txt) => {
          console.log(txt);
          const mod = QRCode.create(txt).modules;
          setMatrix(
            Array.from({ length: mod.size }, (_, r) =>
              Array.from({ length: mod.size }, (_, c) => (mod.get(c, r) ? 1 : 0)),
            ),
          );
          handleCameraToggle();
        },
        (errMsg: string) => {
          if (!errMsg.includes("NotFoundException")) console.debug(errMsg);
        },
      )
      .catch((err) => {
        console.error("카메라 접근 실패:", err);
        setIsCameraOn(false);
      });

    return () => {
      reader
        .stop()
        .catch(() => {})
        .finally(() => reader.clear());
      readerRef.current = null;
    };
  }, [isCameraOn, setMatrix]);
  return {
    canvasRef,
    videoBoxRef,
    isCameraOn,
    handleFileChange,
    handleCameraToggle,
  };
};

export default useQrScanner;
