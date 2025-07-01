import { useEffect, useMemo, useState } from "react";

import type { FormatInfo } from "../types/formatInfo";
import type { DecodeStep } from "@/features/decode/types/decodeStep";

import { COLOR_MAP } from "@/constants/colorMap";
import { SPEED_OPTIONS } from "@/constants/simulationSpeed";
import { DECODE_STEPS } from "@/features/decode/step";
import Card from "@/ui/Card";
import Text from "@/ui/Text";

interface QrMatrixPlayerProps {
  matrix: number[][];
  currentStep: DecodeStep;
  formatInfo: FormatInfo;
}

const QrMatrixPlayer = ({ matrix, currentStep }: QrMatrixPlayerProps) => {
  const [animationSpeed, setAnimationSpeed] = useState(10);
  const [isShowBorder, setIsShowBorder] = useState(false);
  const [filledCells, setFilledCells] = useState(new Set<string>());

  const handleToggleBorder = () => setIsShowBorder((prev) => !prev);

  const { maskFn, color } = DECODE_STEPS.find((s) => s.step === currentStep) ?? {};
  const highlightColor = COLOR_MAP[color!];

  const position = useMemo(() => {
    return maskFn ? maskFn(matrix) : [];
  }, [maskFn, matrix]);

  useEffect(() => {
    setFilledCells(new Set<string>());
    if (!maskFn) return;
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex >= position.length) {
        clearInterval(interval);
        return;
      }
      const { row, col } = position[currentIndex];
      setFilledCells((prev) => new Set(prev).add(`${row},${col}`));
      currentIndex++;
    }, animationSpeed);
  }, [animationSpeed, maskFn, matrix, position]);

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
                const isCellHighlighted = hasPosition ? highlightColor : base;

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
    </Card>
  );
};

export default QrMatrixPlayer;
