import type { QREncoderResult } from "@/libs/QREncoder/types/QREncoderResult";

const EccDetail = ({ encodeInfo }: { encodeInfo: QREncoderResult }) => {
  const {
    bitStream,
    dataCodewords = [],
    eccCodewords = [],
    finalCodewords = [],
    finalBits = "",
    smallestVersion = 1,
  } = encodeInfo;

  const ecLevel = (encodeInfo.errorCorrectionLevel?.split(" ")[0] ?? "Q") as string;
  const shardLen = dataCodewords.length;
  const eccLen = eccCodewords.length;

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <h2 className="font-bold text-lg">
        🛡️ ECC - 버전 {smallestVersion}, 레벨 {ecLevel}
      </h2>

      <section>
        <h3 className="font-medium">① 데이터 비트스트림</h3>
        <code className="block p-2 border rounded font-mono break-all">
          {bitStream || "(empty)"}
        </code>
      </section>

      <section>
        <h3 className="font-medium">② 데이터 Codewords ({shardLen} bytes)</h3>
        <code className="block p-2 border rounded font-mono break-all">
          {dataCodewords.join(" ")}
        </code>
      </section>

      {eccCodewords.length === eccLen && (
        <>
          <section>
            <h3 className="font-medium">③ ECC Codewords ({eccLen} bytes)</h3>
            <code className="block p-2 border rounded font-mono break-all">
              {eccCodewords.join(" ")}
            </code>
          </section>

          <section>
            <h3 className="font-medium">④ 최종 비트스트림 (데이터+ECC)</h3>
            <code className="block p-2 border rounded font-mono break-all">{finalBits}</code>
            <p className="text-gray-500 mt-1">
              총 {finalBits.length} bits ({finalCodewords.length} codewords)
            </p>
          </section>
        </>
      )}
    </div>
  );
};

export default EccDetail;
