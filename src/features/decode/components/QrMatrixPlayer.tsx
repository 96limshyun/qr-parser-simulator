import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { CiPause1 } from "react-icons/ci";
import { FiPlay } from "react-icons/fi";
import { RiResetLeftFill } from "react-icons/ri";

import type { DecodeStep } from "@/features/decode/types/decodeStep";
import type { FormatInfo } from "@/features/decode/types/formatInfo";

import { COLOR_MAP } from "@/constants/colorMap";
import { SPEED_OPTIONS } from "@/constants/simulationSpeed";
import useCellAnimation from "@/features/decode/hooks/useCellAnimation";
import { DECODE_STEPS } from "@/features/decode/step";
import Button from "@/ui/Button";
import Card from "@/ui/Card";
import Text from "@/ui/Text";

interface QrMatrixPlayerProps {
  matrix: number[][];
  currentStep: DecodeStep;
  formatInfo: FormatInfo;
  setCurrentStep: Dispatch<SetStateAction<DecodeStep>>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
}

const QrMatrixPlayer = ({
  matrix,
  currentStep,
  formatInfo,
  setCurrentStep,
  isPlaying,
  setIsPlaying,
}: QrMatrixPlayerProps) => {
  const [animationSpeed, setAnimationSpeed] = useState(2000);
  const [isShowBorder, setIsShowBorder] = useState(false);

  const handleToggleBorder = () => setIsShowBorder((prev) => !prev);

  const { maskFn, color } = DECODE_STEPS.find((s) => s.step === currentStep) ?? {};
  const highlightColor = COLOR_MAP[color!];

  const position = useMemo(() => {
    return maskFn ? maskFn(matrix, formatInfo) : [];
  }, [maskFn, matrix, formatInfo]);

  const { filledCells, setFilledCells } = useCellAnimation({ animationSpeed, position, matrix });

  useEffect(() => {
    if (!isPlaying) {
      setFilledCells(new Set<string>());
      return;
    }

    let currentIndex = DECODE_STEPS.findIndex((s) => s.step === currentStep);

    const interval = setInterval(() => {
      currentIndex += 1;

      if (currentIndex >= DECODE_STEPS.length) {
        clearInterval(interval);
        setIsPlaying(false);
        return;
      }

      setCurrentStep(DECODE_STEPS[currentIndex].step);
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, setCurrentStep, setIsPlaying, animationSpeed, setFilledCells]);

  const handleResetClick = () => {
    setFilledCells(new Set<string>());
    setCurrentStep("Init");
    setIsPlaying(false);
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
                const hasPosition = filledCells.has(`${rowIndex},${colIndex}`);
                const isCellHighlighted = hasPosition && maskFn ? highlightColor : base;

                return (
                  <div
                    key={colIndex}
                    className={`${isCellHighlighted} w-3 h-3 ${isShowBorder ? "" : "border border-gray-700"} transition-colors duration-150`}
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
