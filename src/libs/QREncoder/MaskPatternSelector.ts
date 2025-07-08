import { DATA_MASK_PATTERNS } from "@/constants/maskPatterns";

export class MaskPatternSelector {
  private matrixSize: number;

  constructor(matrixSize: number) {
    this.matrixSize = matrixSize;
  }

  /**
   * 8가지 마스크 패턴을 모두 시도하여 최적의 마스크 패턴을 선택합니다.
   * @param dataModules - 데이터 모듈 위치
   * @param pattern - 기본 패턴 (Finder, Alignment, Timing, Dark Module, Format Info)
   * @returns 최적의 마스크 매트릭스와 마스크 번호
   */
  public findBestMaskPattern(
    dataEccPositions: { row: number; col: number }[],
    pattern: { row: number; col: number }[],
  ): { maskedMatrix: boolean[][]; maskNumber: number } {
    let bestMaskedMatrix: boolean[][] = [];
    let bestMaskNumber = 0;
    let bestScore = Number.MAX_SAFE_INTEGER;

    for (let maskNumber = 0; maskNumber < 8; maskNumber++) {
      const maskedMatrix = this.applyMaskPattern(dataEccPositions, pattern, maskNumber);
      const score = this.calculatePenaltyScore(maskedMatrix);

      if (score < bestScore) {
        bestScore = score;
        bestMaskedMatrix = maskedMatrix;
        bestMaskNumber = maskNumber;
      }
    }

    return { maskedMatrix: bestMaskedMatrix, maskNumber: bestMaskNumber };
  }

  /**
   * 특정 마스크 패턴을 적용합니다.
   * @param dataModules - 데이터 모듈 위치
   * @param pattern - 기본 패턴
   * @param maskNumber - 마스크 번호 (0-7)
   * @returns 마스크가 적용된 매트릭스
   */
  private applyMaskPattern(
    dataEccPositions: { row: number; col: number }[],
    pattern: { row: number; col: number }[],
    maskNumber: number,
  ): boolean[][] {
    const matrix: boolean[][] = Array(this.matrixSize)
      .fill(null)
      .map(() => Array(this.matrixSize).fill(false));

    pattern.forEach((pos) => {
      matrix[pos.row][pos.col] = true;
    });

    dataEccPositions.forEach((pos) => {
      const shouldFlip = this.getMaskCondition(pos.row, pos.col, maskNumber);
      matrix[pos.row][pos.col] = shouldFlip ? !matrix[pos.row][pos.col] : matrix[pos.row][pos.col];
    });

    return matrix;
  }

  /**
   * 마스크 조건을 확인합니다.
   * @param row - 행
   * @param col - 열
   * @param maskNumber - 마스크 번호 (0-7)
   * @returns 마스크를 적용할지 여부
   */
  private getMaskCondition(row: number, col: number, maskNumber: number): boolean {
    return DATA_MASK_PATTERNS[maskNumber](row, col);
  }

  /**
   * 4가지 페널티 요소를 계산하여 점수를 반환합니다.
   * @param maskedMatrix - 마스크가 적용된 매트릭스
   * @returns 페널티 점수 (낮을수록 좋음)
   */
  private calculatePenaltyScore(maskedMatrix: boolean[][]): number {
    const penalty1 = this.calculatePenalty1(maskedMatrix); // 연속된 모듈
    const penalty2 = this.calculatePenalty2(maskedMatrix); // 2x2 블록
    const penalty3 = this.calculatePenalty3(maskedMatrix); // Finder 패턴과 유사한 패턴
    const penalty4 = this.calculatePenalty4(maskedMatrix); // 다크 모듈 비율

    return penalty1 + penalty2 + penalty3 + penalty4;
  }

  /**
   * 페널티 1: 연속된 모듈
   * 같은 색의 모듈이 5개 이상 연속되면 페널티
   */
  private calculatePenalty1(matrix: boolean[][]): number {
    let penalty = 0;

    for (let row = 0; row < this.matrixSize; row++) {
      let consecutive = 1;
      let currentColor = matrix[row][0];

      for (let col = 1; col < this.matrixSize; col++) {
        if (matrix[row][col] === currentColor) {
          consecutive++;
        } else {
          if (consecutive >= 5) {
            penalty += consecutive - 2;
          }
          consecutive = 1;
          currentColor = matrix[row][col];
        }
      }
      if (consecutive >= 5) {
        penalty += consecutive - 2;
      }
    }

    for (let col = 0; col < this.matrixSize; col++) {
      let consecutive = 1;
      let currentColor = matrix[0][col];

      for (let row = 1; row < this.matrixSize; row++) {
        if (matrix[row][col] === currentColor) {
          consecutive++;
        } else {
          if (consecutive >= 5) {
            penalty += consecutive - 2;
          }
          consecutive = 1;
          currentColor = matrix[row][col];
        }
      }
      if (consecutive >= 5) {
        penalty += consecutive - 2;
      }
    }

    return penalty;
  }

  /**
   * 페널티 2: 2x2 블록
   * 같은 색의 2x2 블록이 있으면 페널티
   */
  private calculatePenalty2(matrix: boolean[][]): number {
    let penalty = 0;

    for (let row = 0; row < this.matrixSize - 1; row++) {
      for (let col = 0; col < this.matrixSize - 1; col++) {
        const color = matrix[row][col];
        if (
          matrix[row][col] === color
          && matrix[row][col + 1] === color
          && matrix[row + 1][col] === color
          && matrix[row + 1][col + 1] === color
        ) {
          penalty += 3;
        }
      }
    }

    return penalty;
  }

  /**
   * 페널티 3: Finder 패턴과 유사한 패턴
   * Finder 패턴과 유사한 패턴이 있으면 페널티
   */
  private calculatePenalty3(matrix: boolean[][]): number {
    let penalty = 0;

    const finderPattern = [
      true,
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      true,
      true,
      true,
      true,
      true,
    ];

    for (let row = 0; row < this.matrixSize; row++) {
      for (let col = 0; col <= this.matrixSize - 13; col++) {
        let matches = 0;
        for (let i = 0; i < 13; i++) {
          if (matrix[row][col + i] === finderPattern[i]) {
            matches++;
          }
        }
        if (matches === 13) {
          penalty += 40;
        }
      }
    }

    for (let col = 0; col < this.matrixSize; col++) {
      for (let row = 0; row <= this.matrixSize - 13; row++) {
        let matches = 0;
        for (let i = 0; i < 13; i++) {
          if (matrix[row + i][col] === finderPattern[i]) {
            matches++;
          }
        }
        if (matches === 13) {
          penalty += 40;
        }
      }
    }

    return penalty;
  }

  /**
   * 페널티 4: 다크 모듈 비율
   * 다크 모듈 비율이 50%에 가까울수록 좋음
   */
  private calculatePenalty4(matrix: boolean[][]): number {
    let darkModules = 0;
    let totalModules = 0;

    for (let row = 0; row < this.matrixSize; row++) {
      for (let col = 0; col < this.matrixSize; col++) {
        totalModules++;
        if (matrix[row][col]) {
          darkModules++;
        }
      }
    }

    const darkRatio = darkModules / totalModules;
    const percentage = Math.round(darkRatio * 100);

    const lower = Math.floor(percentage / 10) * 10;
    const upper = lower + 10;
    const nearest = percentage - lower < upper - percentage ? lower : upper;

    return Math.abs(nearest - 50) * 2;
  }
}
