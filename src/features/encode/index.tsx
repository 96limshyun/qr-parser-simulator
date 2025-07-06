import React, { useState } from "react";

import type { EncodeInfoType } from "@/features/encode/types/encodeInfoType";
import type { EncodeStep } from "@/features/encode/types/encodeStep";

import ProcessStepper from "@/features/encode/components/ProcessStepper";
import QrEncoderInput from "@/features/encode/components/QrEncoderInput";
import QrMatrixPlayer from "@/features/encode/components/QrMatrixPlayer";
import StepDetailCard from "@/features/encode/components/StepDetailCard";
import { DEFAULT_ENCODE_MATRIX } from "@/features/encode/constants/defaultEncodeMatrix";

const Encode = () => {
  const [matrix, setMatrix] = useState<number[][]>(DEFAULT_ENCODE_MATRIX);
  const [inputValue, setInputValue] = useState("");
  const [currentStep, setCurrentStep] = useState<EncodeStep>("Init");
  const [isPlaying, setIsPlaying] = useState(false);
  const [encodeInfo, setEncodeInfo] = useState<EncodeInfoType>({
    mode: "Byte",
    length: 0,
    modeIndicatorBits: "0001",
    errorCorrectionLevel: "L (7% 복원)",
    smallestVersion: null,
    bitStream: "",
  });
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      <div className="lg:col-span-2 gap-2 flex flex-col">
        <QrMatrixPlayer
          matrix={matrix}
          setMatrix={setMatrix}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          encodeInfo={encodeInfo}
        />
        <StepDetailCard
          matrix={matrix}
          currentStep={currentStep}
          inputValue={inputValue}
          encodeInfo={encodeInfo}
          setEncodeInfo={setEncodeInfo}
        />
      </div>
      <div className="gap-2 flex flex-col">
        <QrEncoderInput
          inputValue={inputValue}
          onInputChange={handleInputChange}
          errorCorrectionLevel={encodeInfo.errorCorrectionLevel}
          setEncodeInfo={setEncodeInfo}
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

export default Encode;
