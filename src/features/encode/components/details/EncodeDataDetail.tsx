import type { QREncoderResult } from "@/libs/QREncoder/types/QREncoderResult";

import Text from "@/ui/Text";

interface EncodeDataDetailProps {
  encodeInfo: QREncoderResult;
}

const EncodeDataDetail = ({ encodeInfo }: EncodeDataDetailProps) => {
  const { mode, length, errorCorrectionLevel, text, smallestVersion, bitStream } = encodeInfo;

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <Text
        fontWeight="bold"
        fontSize="lg"
      >
        데이터의 가장 작은 버전 결정
      </Text>

      <Text color="gray">
        QR 코드의 다양한 크기를 버전(version) 이라고 합니다. 총 40가지 버전이 존재하며, 가장 작은
        버전은 버전 1(21×21) 이고, 가장 큰 버전은 버전 40(177×177) 입니다. 각 버전은 이전 버전보다
        가로·세로가 각각 4픽셀씩 커집니다. 각 버전은 모드 와 오류 정정 레벨 에 따라 인코딩할 수 있는
        문자 수가 다릅니다. 예를 들어:
      </Text>

      <ul className="list-disc list-inside space-y-1 ">
        <Text>버전 1 - Alphanumeric 모드, Q 레벨 → 최대 16자</Text>
        <Text>버전 2 - Alphanumeric 모드, Q 레벨 → 최대 28자</Text>
      </ul>

      <Text color="gray">
        따라서 인코딩할 데이터의 글자 수를 세고, 선택한 모드와 오류 정정 레벨로 수용 가능한 가장
        작은 버전을 선택합니다.
      </Text>

      <Text
        fontWeight="medium"
        color="blue"
      >
        ✨ 내 데이터 분석 결과
      </Text>
      <div className="space-y-1">
        <Text>입력한 데이터: {text || "(빈 입력)"}</Text>
        <Text>데이터 길이: {length}글자</Text>
        <Text>인코딩 모드: {mode}</Text>
        <Text>오류 정정 레벨: {errorCorrectionLevel}</Text>
        {smallestVersion ?
          <Text
            color="green"
            fontWeight="bold"
          >
            ➡️ 가장 작은 가능한 버전은 버전 {smallestVersion} 입니다.
          </Text>
        : <Text
            color="red"
            fontWeight="bold"
          >
            ⚠️ 이 데이터를 담을 수 있는 버전이 없습니다.
          </Text>
        }
      </div>

      <Text color="gray">
        예시: HELLO WORLD 는 11자이며, Alphanumeric 모드, Q 레벨로 인코딩 시 버전 1(최대 16자)이
        충분히 수용 가능합니다.
      </Text>

      {bitStream && (
        <div className="mt-4 space-y-2">
          <Text
            fontWeight="bold"
            fontSize="md"
          >
            🧩 생성된 비트스트림
          </Text>
          <Text color="gray">
            아래는 입력한 데이터를 QR 규격에 따라 인코딩한 비트스트림입니다. 이 비트스트림이 실제로
            QR 코드의 모듈(검은 점, 흰 점)로 변환됩니다.
          </Text>
          <div className="p-2 rounded border text-xs font-mono break-all">{bitStream}</div>
        </div>
      )}
    </div>
  );
};

export default EncodeDataDetail;
