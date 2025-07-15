import type { DetailProps } from "@/features/decode/types/detailProps";

import { qr } from "@/libs/QR";
import Text from "@/ui/Text";

const ECCDetail = ({ matrix }: DetailProps) => {
  const eccDetail = qr.qrDecoder.getECCDetail(matrix);

  const { dataBits, correctedDataCodewords, correctedECCCodewords } = eccDetail;

  return (
    <div className="space-y-1 text-sm leading-6">
      <Text color="gray">
        QR 코드는 데이터를 안전하게 저장하기 위해
        <strong>Reed-Solomon 알고리즘</strong>을 사용합니다. 이 알고리즘은 오류가 나거나 일부
        데이터가 손상돼도 원래 내용을 복원할 수 있도록 데이터를 보호하는 역할을 합니다.
      </Text>

      <Text color="gray">QR 코드 안에는 두 가지 종류의 데이터가 들어 있습니다:</Text>

      <ul className="list-disc list-inside text-gray-400">
        <li>
          <strong>데이터 코드워드</strong>: 실제 텍스트나 숫자 같은 정보를 담고 있는 부분입니다.
          (예: "HELLO" 같은 내용)
        </li>
        <li>
          <strong>ECC 코드워드 (오류 정정 코드)</strong>: 데이터가 손상되었을 때 원래 데이터를
          복구하기 위해 사용되는 코드입니다.
        </li>
      </ul>

      <>
        <Text color="gray">
          QR 코드는 모든 정보를 <strong>비트(Bit)</strong>라는 작은 단위(0 또는 1)로 표현합니다.
          그리고 8개의 비트가 모여 하나의 <strong>코드워드</strong>(즉, 1바이트)를 만듭니다.
        </Text>

        <Text>
          ➤ 총 데이터 코드워드 수: {correctedDataCodewords.length}개
          <br />➤ 총 ECC 코드워드 수: {correctedECCCodewords.length}개
          <br />➤ 총 코드워드 수: {correctedDataCodewords.length + correctedECCCodewords.length}개
        </Text>

        <Text color="gray">
          아래는 QR 코드에서 읽어낸 실제 데이터 비트와 각각의 코드워드 값들입니다.
        </Text>

        <Text className="bg-gray-800 text-white font-mono p-2 rounded break-all">
          <strong>데이터 비트:</strong> {dataBits || "(데이터 없음)"}
        </Text>

        <Text className="bg-gray-800 text-white font-mono p-2 rounded break-all">
          <strong>데이터 코드워드 (10진수):</strong> {correctedDataCodewords.join(", ")}
        </Text>

        <Text className="bg-gray-800 text-white font-mono p-2 rounded break-all">
          <strong>ECC 코드워드 (10진수):</strong> {correctedECCCodewords.join(", ")}
        </Text>

        <Text color="gray">
          예를 들어, 데이터 코드워드 값이 <code>65</code>라면 이는 아스키 문자 <code>'A'</code>를
          의미합니다. (A의 아스키 코드값은 65입니다.)
        </Text>
      </>
    </div>
  );
};

export default ECCDetail;
