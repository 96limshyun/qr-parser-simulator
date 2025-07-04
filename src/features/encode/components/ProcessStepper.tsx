import type { EncodeStep } from "@/features/encode/types/encodeStep";
import type { Dispatch, SetStateAction } from "react";

import { ENCODE_STEPS } from "@/features/encode/step";
import Card from "@/ui/Card";
import Dot from "@/ui/Dot";
import Text from "@/ui/Text";

interface ProcessStepperProps {
  currentStep: string;
  setCurrentStep: Dispatch<SetStateAction<EncodeStep>>;
  isPlaying: boolean;
}

const ProcessStepper = ({ currentStep, setCurrentStep, isPlaying }: ProcessStepperProps) => {
  return (
    <Card>
      <Text
        fontWeight="bold"
        fontSize="lg"
        className="mb-4"
      >
        처리 단계
      </Text>
      <div className="flex flex-col gap-2">
        {ENCODE_STEPS.map(({ step, title, color }) => (
          <Card
            key={step}
            tone={currentStep === step ? "pick" : "subtle"}
            padding="sm"
            className="flex gap-4 px-8 cursor-pointer hover:bg-gray-600 border duration-100"
            onClick={isPlaying ? undefined : () => setCurrentStep(step)}
          >
            <Dot color={color} />
            <div>
              <Text
                fontSize="lg"
                fontWeight="bold"
              >
                {step}
              </Text>
              <Text
                color="gray"
                fontSize="sm"
              >
                {title}
              </Text>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default ProcessStepper;
