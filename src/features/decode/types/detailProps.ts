import type { QRDecodeResult } from "@/libs/QRDecoder/types/QRDecodeResult";

import { QRDecoder } from "@/libs/QRDecoder";

export interface DetailProps {
  color?: string | undefined;
  qrDecoder: QRDecoder;
  qrDecodeResult: QRDecodeResult;
}
