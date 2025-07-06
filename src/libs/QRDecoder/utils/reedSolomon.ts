export class ReedSolomon {
  private static readonly GF_SIZE = 256;
  private static readonly PRIMITIVE = 0x11d;

  private static readonly LOG_TABLE: number[] = [];
  private static readonly EXP_TABLE: number[] = [];

  static {
    let x = 1;
    for (let i = 0; i < this.GF_SIZE; i++) {
      this.EXP_TABLE[i] = x;
      this.LOG_TABLE[x] = i;
      x = x << 1;
      if (x >= this.GF_SIZE) {
        x = x ^ this.PRIMITIVE;
      }
    }
  }

  static gfMul(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return this.EXP_TABLE[(this.LOG_TABLE[a] + this.LOG_TABLE[b]) % 255];
  }

  static gfDiv(a: number, b: number): number {
    if (b === 0) throw new Error("Division by zero");
    if (a === 0) return 0;
    return this.EXP_TABLE[(this.LOG_TABLE[a] - this.LOG_TABLE[b] + 255) % 255];
  }

  static gfPow(x: number, power: number): number {
    return this.EXP_TABLE[(this.LOG_TABLE[x] * power) % 255];
  }

  static polyAdd(a: number[], b: number[]): number[] {
    const result = new Array(Math.max(a.length, b.length)).fill(0);
    for (let i = 0; i < a.length; i++) result[i] ^= a[i];
    for (let i = 0; i < b.length; i++) result[i] ^= b[i];
    return result;
  }

  static polyMul(a: number[], b: number[]): number[] {
    const result = new Array(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b.length; j++) {
        result[i + j] ^= this.gfMul(a[i], b[j]);
      }
    }
    return result;
  }

  static polyDiv(a: number[], b: number[]): { quotient: number[]; remainder: number[] } {
    const aCopy = [...a];
    const bCopy = [...b];

    while (aCopy.length > 0 && aCopy[0] === 0) aCopy.shift();
    while (bCopy.length > 0 && bCopy[0] === 0) bCopy.shift();

    if (bCopy.length === 0) throw new Error("Division by zero polynomial");
    if (aCopy.length < bCopy.length) {
      return { quotient: [0], remainder: aCopy };
    }

    const quotient: number[] = [];
    const remainder = [...aCopy];

    while (remainder.length >= bCopy.length) {
      const factor = this.gfDiv(remainder[0], bCopy[0]);
      quotient.push(factor);

      for (let i = 0; i < bCopy.length; i++) {
        remainder[i] ^= this.gfMul(bCopy[i], factor);
      }

      remainder.shift();
    }

    return { quotient, remainder };
  }

  static generateGeneratorPolynomial(degree: number): number[] {
    let generator = [1];
    for (let i = 0; i < degree; i++) {
      generator = this.polyMul(generator, [1, this.gfPow(2, i)]);
    }
    return generator;
  }

  static encode(data: number[], eccCount: number): number[] {
    const generator = this.generateGeneratorPolynomial(eccCount);
    const dataPoly = [...data, ...new Array(eccCount).fill(0)];

    const { remainder } = this.polyDiv(dataPoly, generator);

    const ecc = new Array(eccCount).fill(0);
    for (let i = 0; i < remainder.length; i++) {
      ecc[eccCount - remainder.length + i] = remainder[i];
    }

    return [...data, ...ecc];
  }

  static findErrorLocator(syndromes: number[]): number[] {
    const c = [1];
    let b = [1];
    let l = 0;
    let m = 1;
    let b_prev = 1;

    for (let n = 0; n < syndromes.length; n++) {
      let d = 0;
      for (let i = 0; i <= l; i++) {
        d ^= this.gfMul(c[i], syndromes[n - i]);
      }

      if (d === 0) {
        m++;
      } else {
        const t = [...c];
        const factor = this.gfDiv(d, b_prev);

        while (c.length < b.length + m) {
          c.push(0);
        }

        for (let i = 0; i < b.length; i++) {
          c[i + m] ^= this.gfMul(b[i], factor);
        }

        if (2 * l <= n) {
          l = n + 1 - l;
          b = t;
          b_prev = d;
          m = 1;
        } else {
          m++;
        }
      }
    }

    return c.slice(0, l + 1);
  }

  static findErrorPositions(errorLocator: number[], dataLength: number): number[] {
    const positions: number[] = [];

    for (let i = 0; i < dataLength; i++) {
      let sum = 0;
      for (let j = 0; j < errorLocator.length; j++) {
        sum ^= this.gfMul(errorLocator[j], this.gfPow(2, i * j));
      }
      if (sum === 0) {
        positions.push(dataLength - 1 - i);
      }
    }

    return positions;
  }

  static findErrorValues(syndromes: number[], errorPositions: number[]): number[] {
    const errorValues: number[] = [];

    for (const pos of errorPositions) {
      let numerator = 0;
      let denominator = 1;

      for (let i = 0; i < errorPositions.length; i++) {
        if (i !== errorPositions.indexOf(pos)) {
          const factor = this.gfPow(2, errorPositions[i]);
          numerator ^= this.gfMul(syndromes[0], factor);
          denominator = this.gfMul(denominator, this.gfAdd(1, factor));
        }
      }

      errorValues.push(this.gfDiv(numerator, denominator));
    }

    return errorValues;
  }

  static calculateSyndromes(data: number[], eccCount: number): number[] {
    const syndromes: number[] = [];

    for (let i = 1; i <= eccCount; i++) {
      let syndrome = 0;
      for (let j = 0; j < data.length; j++) {
        syndrome ^= this.gfMul(data[j], this.gfPow(2, i * j));
      }
      syndromes.push(syndrome);
    }

    return syndromes;
  }

  static correctErrors(
    data: number[],
    eccCount: number,
  ): {
    corrected: number[];
    errorCount: number;
    success: boolean;
  } {
    const syndromes = this.calculateSyndromes(data, eccCount);

    let hasErrors = false;
    for (const syndrome of syndromes) {
      if (syndrome !== 0) {
        hasErrors = true;
        break;
      }
    }

    if (!hasErrors) {
      return {
        corrected: data,
        errorCount: 0,
        success: true,
      };
    }

    const errorLocator = this.findErrorLocator(syndromes);

    const errorPositions = this.findErrorPositions(errorLocator, data.length);

    if (errorPositions.length === 0) {
      return {
        corrected: data,
        errorCount: 0,
        success: false,
      };
    }

    const errorValues = this.findErrorValues(syndromes, errorPositions);

    const corrected = [...data];
    for (let i = 0; i < errorPositions.length; i++) {
      const pos = errorPositions[i];
      if (pos >= 0 && pos < corrected.length) {
        corrected[pos] ^= errorValues[i];
      }
    }

    return {
      corrected,
      errorCount: errorPositions.length,
      success: true,
    };
  }

  static gfAdd(a: number, b: number): number {
    return a ^ b;
  }
}
