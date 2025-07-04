export const CHECKS = [
  {
    mode: "Numeric" as const,
    regex: /^[0-9]+$/,
    modeIndicatorBits: "0001",
  },
  {
    mode: "Alphanumeric" as const,
    regex: /^[0-9A-Z $%*+\-./:]+$/,
    modeIndicatorBits: "0010",
  },
];
