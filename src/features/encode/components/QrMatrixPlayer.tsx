import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { CiPause1 } from "react-icons/ci";
import { FiPlay } from "react-icons/fi";
import { RiResetLeftFill } from "react-icons/ri";

import type { EncodeStep } from "@/features/encode/types/encodeStep";
import type { QREncoderResult } from "@/libs/QREncoder/types/QREncoderResult";

import { SPEED_OPTIONS } from "@/constants/simulationSpeed";
import { DEFAULT_ENCODE_MATRIX } from "@/features/encode/constants/defaultEncodeMatrix";
import useCellAnimation from "@/features/encode/hooks/useCellAnimation";
import { ENCODE_STEPS } from "@/features/encode/step";
import Button from "@/ui/Button";
import Card from "@/ui/Card";
import Text from "@/ui/Text";

interface QrMatrixPlayerProps {
  matrix: number[][];
  setMatrix: Dispatch<SetStateAction<number[][]>>;
  currentStep: EncodeStep;
  setCurrentStep: Dispatch<SetStateAction<EncodeStep>>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  encodeInfo: QREncoderResult;
}

const QrMatrixPlayer = ({
  matrix,
  setMatrix,
  currentStep,
  setCurrentStep,
  isPlaying,
  setIsPlaying,
  encodeInfo,
}: QrMatrixPlayerProps) => {
  const [animationSpeed, setAnimationSpeed] = useState(2000);
  const [isShowBorder, setIsShowBorder] = useState(false);

  const handleToggleBorder = () => setIsShowBorder((prev) => !prev);

  const { maskFn } = ENCODE_STEPS.find((s) => s.step === currentStep) ?? {};

  const position = useMemo(() => {
    return maskFn ? maskFn(encodeInfo) : [];
  }, [maskFn, encodeInfo]);

  useCellAnimation({
    animationSpeed,
    position,
    matrix,
    setMatrix,
  });

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    let currentIndex = ENCODE_STEPS.findIndex((s) => s.step === currentStep);

    const interval = setInterval(() => {
      currentIndex += 1;

      if (currentIndex >= ENCODE_STEPS.length) {
        clearInterval(interval);
        setIsPlaying(false);
        return;
      }

      setCurrentStep(ENCODE_STEPS[currentIndex].step);
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, setCurrentStep, setIsPlaying, animationSpeed]);

  const handleResetClick = () => {
    setCurrentStep("Init");
    setIsPlaying(false);
    setMatrix(DEFAULT_ENCODE_MATRIX);
  };

  return (
    <Card>
      <div className="flex justify-between mb-10">
        <Text
          fontWeight="bold"
          fontSize="sm"
          className="sm:text-xl"
        >
          QR Code Matrix
        </Text>
        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="flex">
            <Text>속도:</Text>
            <select
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              className="bg-gray-900 border border-gray-600 text-white px-2 py-1 rounded text-sm"
            >
              {SPEED_OPTIONS.map(({ value, label }) => (
                <option
                  key={label}
                  value={value}
                >
                  {label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Text>그리드 표시</Text>
            <input
              type="checkbox"
              defaultChecked
              onChange={handleToggleBorder}
              className="accent-gray-500 size-4"
            />
          </label>
        </div>
      </div>
      <section className="flex justify-center">
        <div className="inline-block bg-white p-2 rounded-lg shadow-lg border border-gray-600">
          {matrix.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex"
            >
              {row.map((bit, colIndex) => {
                const base = bit ? "bg-black" : "bg-white";
                return (
                  <div
                    key={colIndex}
                    className={`${base} w-3 h-3 ${isShowBorder ? "" : "border border-gray-700"} transition-colors duration-150`}
                  ></div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
      <div className="w-full flex justify-center mt-4 gap-4">
        {isPlaying ?
          <Button
            intent="secondary"
            className="w-25 flex items-center justify-center"
            onClick={() => setIsPlaying(false)}
          >
            <CiPause1 />
            정지
          </Button>
        : <Button
            intent="secondary"
            className="w-25 flex items-center justify-center px-4"
            onClick={() => setIsPlaying(true)}
          >
            <FiPlay />
            시작
          </Button>
        }
        <Button
          className="w-25 flex items-center justify-center"
          onClick={handleResetClick}
        >
          <RiResetLeftFill /> 초기화
        </Button>
      </div>
    </Card>
  );
};

export default QrMatrixPlayer;
