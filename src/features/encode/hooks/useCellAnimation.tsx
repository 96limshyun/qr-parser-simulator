import { type Dispatch, type SetStateAction, useEffect } from "react";

interface CellAnimationProps {
  animationSpeed: number;
  position: { row: number; col: number; value?: number }[];
  matrix: number[][];
  setMatrix: Dispatch<SetStateAction<number[][]>>;
}

const useCellAnimation = ({ animationSpeed, position, matrix, setMatrix }: CellAnimationProps) => {
  useEffect(() => {
    let currentIndex = 0;

    if (!Array.isArray(position) || position.length === 0) return;

    const drawingTime = animationSpeed * 0.6;
    const intervalTime = Math.floor(drawingTime / Math.max(1, position.length));

    const interval = setInterval(() => {
      if (currentIndex >= position.length) {
        clearInterval(interval);
        return;
      }

      const { row, col, value } = position[currentIndex];

      if (row >= 0 && row < matrix.length && col >= 0 && col < matrix[0].length) {
        setMatrix((prev) => {
          const newMatrix = [...prev];
          newMatrix[row][col] = value ?? 1;
          return newMatrix;
        });
      }

      currentIndex++;
    }, intervalTime);

    return () => {
      clearInterval(interval);
    };
  }, [animationSpeed, position]);

  return {};
};

export default useCellAnimation;
