import { ReedSolomonDecoder, GenericGF } from "@zxing/library";
import { useEffect } from "react";

import type { DetailProps } from "@/features/decode/types/detailProps";

import { parseECCBits } from "@/features/decode/utils/createReadSolomonMask";
import { getECCInfo } from "@/features/decode/utils/getECCInfo";
import Text from "@/ui/Text";

const ECCDetail = ({ matrix, formatInfo, setFormatInfo }: DetailProps) => {
  const eccLevel = formatInfo.eccLevel.split(" ")[0] as "L" | "M" | "Q" | "H";
  const eccInfo = getECCInfo(formatInfo.version, eccLevel);

  useEffect(() => {
    if (!eccInfo) return;
    const totalDataCodewords = eccInfo.totalDataCodewords;
    const totalECCCodewords =
      eccInfo.ecCodewordsPerBlock * (eccInfo.numBlocksGroup1 + eccInfo.numBlocksGroup2);

    const dataBits = formatInfo.dataBits || "";
    const dataBytes = dataBits.match(/.{1,8}/g)?.map((byte) => parseInt(byte, 2)) || [];
    const dataCodewords = dataBytes.slice(0, totalDataCodewords);

    const eccBitsStr = parseECCBits(matrix, formatInfo);
    const eccBytes = eccBitsStr.match(/.{1,8}/g)?.map((byte) => parseInt(byte, 2)) || [];

    if (dataCodewords.length === 0 || eccBytes.length === 0) return;

    const allCodewords = Int32Array.from([...dataCodewords, ...eccBytes]);

    const gf = GenericGF.QR_CODE_FIELD_256;
    const decoder = new ReedSolomonDecoder(gf);

    try {
      decoder.decode(allCodewords, totalECCCodewords);

      const correctedDataCodewords = Array.from(allCodewords.slice(0, dataCodewords.length));

      setFormatInfo((prev) => ({
        ...prev,
        eccCorrected: correctedDataCodewords,
        eccErrorCount: 0,
      }));
    } catch (error) {
      console.error("ECC decoding failed:", error);
      setFormatInfo((prev) => ({
        ...prev,
        eccErrorCount: totalECCCodewords,
      }));
    }
  }, [eccInfo, formatInfo.dataBits, matrix, formatInfo, setFormatInfo]);

  if (!eccInfo) {
    console.error(
      `ECC info not found for version ${formatInfo.version} / level ${formatInfo.eccLevel}`,
    );
    return <div>Error: ECC info not found</div>;
  }

  const totalDataCodewords = eccInfo.totalDataCodewords;
  const totalECCCodewords =
    eccInfo.ecCodewordsPerBlock * (eccInfo.numBlocksGroup1 + eccInfo.numBlocksGroup2);
  const totalCodewords = totalDataCodewords + totalECCCodewords;

  const dataBits = formatInfo.dataBits || "";
  const dataBytes = dataBits.match(/.{1,8}/g)?.map((byte) => parseInt(byte, 2)) || [];

  const dataCodewords = dataBytes.slice(0, totalDataCodewords);

  const eccBitsStr = parseECCBits(matrix, formatInfo);
  const eccBytes = eccBitsStr.match(/.{1,8}/g)?.map((byte) => parseInt(byte, 2)) || [];

  return (
    <div className="space-y-1 text-sm leading-6">
      <Text color="gray">
        QR 코드의 오류 정정 코드는 Reed-Solomon 알고리즘을 사용하여 생성됩니다.
      </Text>
      <Text>
        총 데이터 코드워드: {totalDataCodewords} / 총 ECC 코드워드: {totalECCCodewords} / 총
        코드워드: {totalCodewords}
      </Text>
      <Text className="bg-gray-800 text-white font-mono p-2 rounded break-all">
        데이터 비트: {dataBits || "(데이터 없음)"}
      </Text>
      <Text className="bg-gray-800 text-white font-mono p-2 rounded break-all">
        데이터 코드워드: {dataCodewords.join(", ")}
      </Text>
      <Text className="bg-gray-800 text-white font-mono p-2 rounded break-all">
        ECC 코드워드: {eccBytes.join(", ")}
      </Text>
    </div>
  );
};

export default ECCDetail;
