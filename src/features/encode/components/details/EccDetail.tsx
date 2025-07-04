import GenericGF from "@zxing/library/esm/core/common/reedsolomon/GenericGF";
import ReedSolomonEncoder from "@zxing/library/esm/core/common/reedsolomon/ReedSolomonEncoder";
import React, { useMemo } from "react";

import type { EncodeInfoType } from "@/features/encode/types/encodeInfoType";
import type { ECLevel } from "@/types/ECCTable";

import { ECC_TABLE } from "@/constants/eccTable";

interface Props {
  encodeInfo: EncodeInfoType;
}

const toCodewords = (bits: string): number[] => {
  const out: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    out.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return out;
};

const EccDetail: React.FC<Props> = ({ encodeInfo }) => {
  const bitStream = encodeInfo.bitStream ?? "";
  const dataCw = useMemo(() => toCodewords(bitStream), [bitStream]);

  const version = encodeInfo.smallestVersion ?? 1;
  const ecLevel = (encodeInfo.errorCorrectionLevel?.split(" ")[0] ?? "Q") as ECLevel;
  const eccInfo = ECC_TABLE[version][ecLevel];

  const shardLen = eccInfo.dataCodewordsGroup1;
  const eccLen = eccInfo.ecCodewordsPerBlock;

  const eccCw: number[] = useMemo(() => {
    if (!dataCw.length) return [];

    const encoder = new ReedSolomonEncoder(GenericGF.QR_CODE_FIELD_256);

    const buffer = new Int32Array(shardLen + eccLen);
    dataCw.slice(0, shardLen).forEach((v, i) => (buffer[i] = v));

    encoder.encode(buffer, eccLen);

    return Array.from(buffer.slice(-eccLen));
  }, [dataCw, shardLen, eccLen]);

  const finalCw = [...dataCw.slice(0, shardLen), ...eccCw];
  const finalBits = finalCw.map((b) => b.toString(2).padStart(8, "0")).join("");

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <h2 className="font-bold text-lg">
        🛡️ ECC - 버전 {version}, 레벨 {ecLevel}
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
          {dataCw.slice(0, shardLen).join(" ")}
        </code>
      </section>

      {eccCw.length === eccLen && (
        <>
          <section>
            <h3 className="font-medium">③ ECC Codewords ({eccLen} bytes)</h3>
            <code className="block p-2 border rounded font-mono break-all">{eccCw.join(" ")}</code>
          </section>

          <section>
            <h3 className="font-medium">④ 최종 비트스트림 (데이터+ECC)</h3>
            <code className="block p-2 border rounded font-mono break-all">{finalBits}</code>
            <p className="text-gray-500 mt-1">
              총 {finalBits.length} bits ({finalCw.length} codewords)
            </p>
          </section>
        </>
      )}
    </div>
  );
};

export default EccDetail;
