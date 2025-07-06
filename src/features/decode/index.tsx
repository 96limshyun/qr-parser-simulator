import { useEffect, useState, useMemo } from "react";

import type { DecodeStep } from "@/features/decode/types/decodeStep";

import ProcessStepper from "@/features/decode/components/ProcessStepper";
import QrMatrixPlayer from "@/features/decode/components/QrMatrixPlayer";
import QrScanner from "@/features/decode/components/QrScanner";
import StepDetailCard from "@/features/decode/components/StepDetailCard";
import { DEFAULT_MATRIX } from "@/features/decode/constants/defaultMatrix";
import { QRDecoder } from "@/libs/QRDecoder";

const Decode = () => {
  const [matrix, setMatrix] = useState<number[][]>(DEFAULT_MATRIX);
  const [currentStep, setCurrentStep] = useState<DecodeStep>("Init");
  const [isPlaying, setIsPlaying] = useState(false);

  const qrDecoder = useMemo(() => new QRDecoder(matrix), [matrix]);
  const decodeResult = useMemo(() => qrDecoder.decode(), [qrDecoder]);
  console.log(decodeResult);

  useEffect(() => {
    setCurrentStep("Init");
    setIsPlaying(false);
  }, [matrix]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      <div className="lg:col-span-2 gap-2 flex flex-col">
        <QrMatrixPlayer
          matrix={matrix}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          qrDecoder={qrDecoder}
        />
        <StepDetailCard
          currentStep={currentStep}
          qrDecoder={qrDecoder}
          qrDecodeResult={decodeResult}
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
