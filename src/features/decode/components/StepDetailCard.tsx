import type { DecodeStep } from "@/features/decode/types/decodeStep";

import { DECODE_STEPS } from "@/features/decode/step";
import Card from "@/ui/Card";
import Dot from "@/ui/Dot";
import Text from "@/ui/Text";

interface StepDetailCardProps {
  currentStep: DecodeStep;
  matrix: number[][];
}

const StepDetailCard = ({ currentStep, matrix }: StepDetailCardProps) => {
  const stepConfig = DECODE_STEPS.find((s) => s.step === currentStep);

  if (!stepConfig) return null;

  const { color, title, description, stepDetailComponent } = stepConfig;

  const Detail = stepDetailComponent;

  return (
    <Card className="min-h-60">
      <div className="flex gap-2 mb-4">
        <Dot
          color={color}
          size="lg"
        />
        <Text
          fontWeight="bold"
          fontSize="xl"
        >
          {title}
        </Text>
      </div>
      {Detail ?
        <Detail
          color={color}
          matrix={matrix}
        />
      : <Text color="gray">{description}</Text>}
    </Card>
  );
};

export default StepDetailCard;
