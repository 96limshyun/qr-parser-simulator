// QR 코드 8가지 마스킹 패턴 함수
export const DATA_MASK_PATTERNS = [
  (row: number, col: number) => (row + col) % 2 === 0,
  (row: number) => row % 2 === 0,
  (_row: number, col: number) => col % 3 === 0,
  (row: number, col: number) => (row + col) % 3 === 0,
  (row: number, col: number) => (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0,
  (row: number, col: number) => ((row * col) % 2) + ((row * col) % 3) === 0,
  (row: number, col: number) => (((row * col) % 2) + ((row * col) % 3)) % 2 === 0,
  (row: number, col: number) => (((row + col) % 2) + ((row * col) % 3)) % 2 === 0,
];
