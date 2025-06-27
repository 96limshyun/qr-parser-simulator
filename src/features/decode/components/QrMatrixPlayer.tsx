import { useState } from "react";

import { SPEED_OPTIONS } from "@/constants/simulationSpeed";
import Card from "@/ui/Card";
import Text from "@/ui/Text";

interface QrMatrixPlayerProps {
  matrix: number[][];
}

const QrMatrixPlayer = ({ matrix }: QrMatrixPlayerProps) => {
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  return (
    <Card>
      <div className="flex justify-between">
        <Text
          fontWeight="bold"
          fontSize="xl"
        >
          QR Code Matrix
        </Text>
        <div className="flex gap-2">
          <Text>속도:</Text>
          <select
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(Number(e.target.value))}
            className="bg-gray-900 border border-gray-600 text-white px-2 py-1 rounded text-sm"
          >
            {SPEED_OPTIONS.map(({ value, label }) => (
              <option value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      <section className="flex justify-center">
        <div className="inline-block bg-white p-2 rounded-lg shadow-lg border border-gray-600">
          {matrix.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex"
            >
              {row.map((vite, viteIndex) => {
                return (
                  <div
                    key={viteIndex}
                    className={`${vite ? "bg-black" : "bg-white"} w-3 h-3 border border-gray-700`}
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
