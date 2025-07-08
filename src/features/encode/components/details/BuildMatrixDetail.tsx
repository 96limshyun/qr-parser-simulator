import type { QREncoderResult } from "@/libs/QREncoder/types/QREncoderResult";

import Text from "@/ui/Text";

interface BuildMatrixDetailProps {
  encodeInfo: QREncoderResult;
}

const BuildMatrixDetail = ({ encodeInfo }: BuildMatrixDetailProps) => {
  const { basePattern, smallestVersion, text } = encodeInfo;
  const matrixSize = smallestVersion * 4 + 17;

  const finderPatternCount = 147;
  const alignmentPatternCount = smallestVersion >= 2 ? 25 : 0;
  const timingPatternCount = (matrixSize - 16) * 2;
  const darkModuleCount = 1;
  const formatInformationCount = 30;

  const finderPattern = basePattern.slice(0, finderPatternCount);
  const alignmentPattern = basePattern.slice(
    finderPatternCount,
    finderPatternCount + alignmentPatternCount,
  );
  const timingPattern = basePattern.slice(
    finderPatternCount + alignmentPatternCount,
    finderPatternCount + alignmentPatternCount + timingPatternCount,
  );
  const darkModule = basePattern.slice(
    finderPatternCount + alignmentPatternCount + timingPatternCount,
    finderPatternCount + alignmentPatternCount + timingPatternCount + darkModuleCount,
  );
  const formatInformation = basePattern.slice(
    finderPatternCount + alignmentPatternCount + timingPatternCount + darkModuleCount,
    finderPatternCount
      + alignmentPatternCount
      + timingPatternCount
      + darkModuleCount
      + formatInformationCount,
  );
  const dataModules = basePattern.slice(
    finderPatternCount
      + alignmentPatternCount
      + timingPatternCount
      + darkModuleCount
      + formatInformationCount,
  );

  return (
    <div className="space-y-6 text-sm leading-relaxed">
      <Text
        fontWeight="bold"
        fontSize="lg"
      >
        🏗️ QR 매트릭스 구축 과정
      </Text>

      <Text color="gray">
        QR 코드는 여러 가지 패턴들을 조합하여 만들어집니다. 각 패턴은 특정한 역할을 하며, 스캐너가
        QR 코드를 정확히 인식할 수 있도록 도와줍니다.
      </Text>

      <div className="space-y-4">
        <section className="border border-gray-200 rounded-lg p-4">
          <Text
            fontWeight="bold"
            fontSize="md"
            color="red"
          >
            🔍 Finder Pattern (찾기 패턴)
          </Text>
          <Text
            color="gray"
            className="mb-2"
          >
            QR 코드의 3개 모서리에 위치한 정사각형 패턴입니다. 스캐너가 QR 코드의 위치와 방향을
            파악하는 데 사용됩니다.
          </Text>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="w-16 h-16 bg-black mx-auto mb-2 relative">
                <div className="absolute inset-2 bg-white"></div>
                <div className="absolute inset-4 bg-black"></div>
              </div>
              <Text>좌상단</Text>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black mx-auto mb-2 relative">
                <div className="absolute inset-2 bg-white"></div>
                <div className="absolute inset-4 bg-black"></div>
              </div>
              <Text>우상단</Text>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black mx-auto mb-2 relative">
                <div className="absolute inset-2 bg-white"></div>
                <div className="absolute inset-4 bg-black"></div>
              </div>
              <Text>좌하단</Text>
            </div>
          </div>
          <Text className="mt-2 text-xs">총 {finderPattern.length}개의 모듈이 배치됨</Text>
        </section>

        {smallestVersion >= 2 && (
          <section className="border border-gray-200 rounded-lg p-4">
            <Text
              fontWeight="bold"
              fontSize="md"
              color="blue"
            >
              🎯 Alignment Pattern (정렬 패턴)
            </Text>
            <Text
              color="gray"
              className="mb-2"
            >
              QR 코드가 기울어지거나 왜곡되었을 때 보정하는 데 사용됩니다. 버전 2 이상에서만
              사용됩니다.
            </Text>
            <div className="text-center">
              <div className="w-12 h-12 bg-black mx-auto mb-2 relative">
                <div className="absolute inset-1 bg-white"></div>
                <div className="absolute inset-2 bg-black"></div>
              </div>
              <Text className="text-xs">중앙 정렬 패턴</Text>
            </div>
            <Text className="mt-2 text-xs">총 {alignmentPattern.length}개의 모듈이 배치됨</Text>
          </section>
        )}

        <section className="border border-gray-200 rounded-lg p-4">
          <Text
            fontWeight="bold"
            fontSize="md"
            color="green"
          >
            ⏱️ Timing Pattern (타이밍 패턴)
          </Text>
          <Text
            color="gray"
            className="mb-2"
          >
            QR 코드의 크기와 모듈의 위치를 결정하는 데 사용됩니다. 검은색과 흰색이 번갈아 나타나는
            패턴입니다.
          </Text>
          <div className="flex justify-center mb-2">
            <div className="flex">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 ${i % 2 === 0 ? "bg-black" : "bg-white"} border border-gray-300`}
                />
              ))}
            </div>
          </div>
          <Text className="text-xs">총 {timingPattern.length}개의 모듈이 배치됨</Text>
        </section>

        <section className="border border-gray-200 rounded-lg p-4">
          <Text
            fontWeight="bold"
            fontSize="md"
            color="purple"
          >
            ⚫ Dark Module (어두운 모듈)
          </Text>
          <Text
            color="gray"
            className="mb-2"
          >
            QR 코드에서 항상 검은색으로 고정된 특별한 모듈입니다. 데이터의 시작점을 나타냅니다.
          </Text>
          <div className="text-center">
            <div className="w-4 h-4 bg-black mx-auto mb-2"></div>
            <Text className="text-xs">고정된 검은 모듈</Text>
          </div>
          <Text className="text-xs">총 {darkModule.length}개의 모듈이 배치됨</Text>
        </section>

        <section className="border border-gray-200 rounded-lg p-4">
          <Text
            fontWeight="bold"
            fontSize="md"
            color="orange"
          >
            📋 Format Information (형식 정보)
          </Text>
          <Text
            color="gray"
            className="mb-2"
          >
            QR 코드의 오류 정정 레벨과 마스크 패턴 정보를 담고 있습니다. 스캐너가 데이터를 올바르게
            해석하는 데 필요합니다.
          </Text>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <Text fontWeight="medium">좌상단 영역</Text>
              <Text color="gray">오류 정정 레벨 정보</Text>
            </div>
            <div>
              <Text fontWeight="medium">우하단 영역</Text>
              <Text color="gray">마스크 패턴 정보</Text>
            </div>
          </div>
          <Text className="mt-2 text-xs">총 {formatInformation.length}개의 모듈이 배치됨</Text>
        </section>

        <section className="border border-gray-200 rounded-lg p-4">
          <Text
            fontWeight="bold"
            fontSize="md"
            color="indigo"
          >
            💾 Data Modules (데이터 모듈)
          </Text>
          <Text
            color="gray"
            className="mb-2"
          >
            실제 인코딩된 데이터와 오류 정정 코드가 저장되는 영역입니다. QR 코드의 대부분을
            차지하며, 실제 정보를 담고 있습니다.
          </Text>
          <div className="p-2 rounded text-xs">
            <Text fontWeight="medium">데이터 배치 순서:</Text>
            <Text color="gray">우하단에서 시작하여 지그재그로 배치</Text>
          </div>
          <Text className="mt-2 text-xs">총 {dataModules.length}개의 모듈이 배치됨</Text>
        </section>
      </div>

      <div className="border border-blue-200 rounded-lg p-4">
        <Text
          fontWeight="bold"
          fontSize="md"
          color="blue"
        >
          📊 매트릭스 요약
        </Text>
        <div className="space-y-1 text-xs">
          <Text>
            QR 코드 크기: {matrixSize} × {matrixSize} 모듈
          </Text>
          <Text>총 모듈 수: {matrixSize * matrixSize}개</Text>
          <Text>
            데이터 모듈 비율: {((dataModules.length / (matrixSize * matrixSize)) * 100).toFixed(1)}%
          </Text>
          <Text>입력 데이터: "{text || "(빈 입력)"}"</Text>
        </div>
      </div>

      <Text
        color="gray"
        className="text-xs"
      >
        💡 이 모든 패턴들이 조합되어 완전한 QR 코드가 됩니다. 각 패턴은 QR 코드의 정확한 인식과
        데이터 복원을 위해 필수적인 역할을 합니다.
      </Text>
    </div>
  );
};

export default BuildMatrixDetail;
