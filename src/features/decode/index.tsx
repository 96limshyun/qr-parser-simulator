import { useEffect, useState } from "react";

import type { DecodeStep } from "@/features/decode/types/decodeStep";
import type { FormatInfo } from "@/features/decode/types/formatInfo";

import ProcessStepper from "@/features/decode/components/ProcessStepper";
import QrMatrixPlayer from "@/features/decode/components/QrMatrixPlayer";
import QrScanner from "@/features/decode/components/QrScanner";
import StepDetailCard from "@/features/decode/components/StepDetailCard";
import { DEFAULT_DECODE_INFO } from "@/features/decode/constants/defaultDecodeInfo";
import { DEFAULT_MATRIX } from "@/features/decode/constants/defaultMatrix";
import { getVersionByMatrixSize } from "@/features/decode/utils/getVersionByMatrixSize";

const Decode = () => {
  const [matrix, setMatrix] = useState<number[][]>(DEFAULT_MATRIX);
  const [currentStep, setCurrentStep] = useState<DecodeStep>("Init");
  const [formatInfo, setFormatInfo] = useState<FormatInfo>(DEFAULT_DECODE_INFO);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setFormatInfo((prev) => ({
      ...prev,
      version: getVersionByMatrixSize(matrix.length) ?? 0,
      size: matrix.length,
    }));
    setCurrentStep("Init");
    setIsPlaying(false);
  }, [matrix]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      <div className="lg:col-span-2 gap-2 flex flex-col">
        <QrMatrixPlayer
          matrix={matrix}
          currentStep={currentStep}
          formatInfo={formatInfo}
          setCurrentStep={setCurrentStep}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
        <StepDetailCard
          matrix={matrix}
          currentStep={currentStep}
          formatInfo={formatInfo}
          setFormatInfo={setFormatInfo}
        />
      </div>
      <div className="gap-2 flex flex-col">
        <QrScanner
          setMatrix={setMatrix}
          isPlaying={isPlaying}
        />
        <ProcessStepper
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          isPlaying={isPlaying}
        />
      </div>
    </div>
  );
};

export default Decode;
