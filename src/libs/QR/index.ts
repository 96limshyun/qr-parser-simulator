import { QRDecoder } from "@/libs/QRDecoder/QRDecoder";
import { QREncoder } from "@/libs/QREncoder/QREncoder";

class QR {
  public qrDecoder: QRDecoder;
  public qrEncoder: QREncoder;

  constructor() {
    this.qrDecoder = new QRDecoder();
    this.qrEncoder = new QREncoder();
  }
}

export const qr = new QR();
