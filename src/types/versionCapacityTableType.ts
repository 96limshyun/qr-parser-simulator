export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
export type Mode = "Numeric" | "Alphanumeric" | "Byte";

export type VersionCapacityTableType = {
  [version: number]: {
    // eslint-disable-next-line no-unused-vars
    [level in ErrorCorrectionLevel]: {
      // eslint-disable-next-line no-unused-vars
      [mode in Mode]: number;
    };
  };
};
