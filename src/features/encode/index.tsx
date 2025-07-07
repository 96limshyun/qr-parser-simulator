import React, { useEffect, useMemo, useState } from "react";

import type { EncodeStep } from "@/features/encode/types/encodeStep";
import type { ErrorCorrectionLevel } from "@/types/versionCapacityTableType";

import ProcessStepper from "@/features/encode/components/ProcessStepper";
import QrEncoderInput from "@/features/encode/components/QrEncoderInput";
import QrMatrixPlayer from "@/features/encode/components/QrMatrixPlayer";
import StepDetailCard from "@/features/encode/components/StepDetailCard";
import { DEFAULT_ENCODE_MATRIX } from "@/features/encode/constants/defaultEncodeMatrix";
import { QREncoder } from "@/libs/QREncoder";

const Encode = () => {
  const [matrix, setMatrix] = useState<number[][]>(DEFAULT_ENCODE_MATRIX);
  const [inputValue, setInputValue] = useState("");
  const [currentStep, setCurrentStep] = useState<EncodeStep>("Init");
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<ErrorCorrectionLevel>("L");

  const encoder = useMemo(
    () => new QREncoder(inputValue, errorCorrectionLevel),
    [inputValue, errorCorrectionLevel],
  );
  const encodeInfo = useMemo(() => encoder.encode(), [encoder]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    const { smallestVersion } = encoder.encode();
    setMatrix(
      Array.from({ length: smallestVersion * 4 + 17 }, () =>
        Array.from({ length: smallestVersion * 4 + 17 }, () => 0),
      ),
    );
  }, [encoder, inputValue]);

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
          currentStep={currentStep}
          encodeInfo={encodeInfo}
        />
      </div>
      <div className="gap-2 flex flex-col">
        <QrEncoderInput
          inputValue={inputValue}
          onInputChange={handleInputChange}
          errorCorrectionLevel={errorCorrectionLevel}
          setErrorCorrectionLevel={setErrorCorrectionLevel}
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
