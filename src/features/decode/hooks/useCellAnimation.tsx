import { useEffect, useState } from "react";

interface CellAnimationProps {
  animationSpeed: number;
  position: { row: number; col: number }[];
  matrix: number[][];
}

const useCellAnimation = ({ animationSpeed, position, matrix }: CellAnimationProps) => {
  const [filledCells, setFilledCells] = useState(new Set<string>());

  useEffect(() => {
    setFilledCells(new Set<string>());
    let currentIndex = 0;

    if (!Array.isArray(position)) return;

    const drawingTime = animationSpeed * 0.6;
    const intervalTime = Math.floor(drawingTime / Math.max(1, position.length));

    const interval = setInterval(() => {
      if (currentIndex >= position.length) {
        clearInterval(interval);
        return;
      }

      const { row, col } = position[currentIndex];
      setFilledCells((prev) => new Set(prev).add(`${row},${col}`));
      currentIndex++;
    }, intervalTime);

    return () => {
      clearInterval(interval);
    };
  }, [animationSpeed, matrix, position]);

  return { filledCells, setFilledCells };
};

export default useCellAnimation;
