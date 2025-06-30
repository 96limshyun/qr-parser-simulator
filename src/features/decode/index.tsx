import { useEffect, useState } from "react";

import type { DecodeStep } from "@/features/decode/types/decodeStep";
import type { FormatInfo } from "@/features/decode/types/formatInfo";

import { DEFAULT_MATRIX } from "@/constants/defaultMatrix";
import ProcessStepper from "@/features/decode/components/ProcessStepper";
import QrMatrixPlayer from "@/features/decode/components/QrMatrixPlayer";
import QrScanner from "@/features/decode/components/QrScanner";
import StepDetailCard from "@/features/decode/components/StepDetailCard";
import { getVersionByMatrixSize } from "@/features/decode/utils/getVersionByMatrixSize";

const Decode = () => {
  const [matrix, setMatrix] = useState<number[][]>(DEFAULT_MATRIX);
  const [currentStep, setCurrentStep] = useState<DecodeStep>("Init");
  const [formatInfo, setFormatInfo] = useState<FormatInfo>({
    rawBits: "",
    unmaskedBits: "",
    eccLevel: "",
    maskPattern: 0,
    version: 0,
    size: 0,
    mode: "",
    modeBits: "",
    characterCount: 0,
    dataBits: "",
    decodedText: "",
    decodedBytes: [],
    errorCorrection: {
      totalCodewords: 0,
      ecCodewordsPerBlock: 0,
      numBlocks: 0,
    },
  });

  formatInfo.version = getVersionByMatrixSize(matrix.length) ?? 0;
  formatInfo.size = matrix.length;

  useEffect(() => {
    setCurrentStep("Init");
  }, [matrix]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      <div className="lg:col-span-2 gap-2 flex flex-col">
        <QrMatrixPlayer
          matrix={matrix}
          currentStep={currentStep}
          formatInfo={formatInfo}
        />
        <StepDetailCard
          matrix={matrix}
          currentStep={currentStep}
          formatInfo={formatInfo}
          setFormatInfo={setFormatInfo}
        />
      </div>
      <div className="gap-2 flex flex-col">
        <QrScanner setMatrix={setMatrix} />
        <ProcessStepper
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      </div>
    </div>
  );
};

export default Decode;
