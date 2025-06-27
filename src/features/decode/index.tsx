import { useState } from "react";

import type { DecodeStep } from "@/features/decode/types/decodeStep";

import { DEFAULT_MATRIX } from "@/constants/defaultMatrix";
import ProcessStepper from "@/features/decode/components/ProcessStepper";
import QrMatrixPlayer from "@/features/decode/components/QrMatrixPlayer";
import QrScanner from "@/features/decode/components/QrScanner";
import StepDetailCard from "@/features/decode/components/StepDetailCard";

const Decode = () => {
  const [matrix, setMatrix] = useState<number[][]>(DEFAULT_MATRIX);
  const [currentStep, setCurrentStep] = useState<DecodeStep>("Init");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      <div className="lg:col-span-2 gap-2 flex flex-col">
        <QrMatrixPlayer
          matrix={matrix}
          currentStep={currentStep}
        />
        <StepDetailCard
          matrix={matrix}
          currentStep={currentStep}
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
