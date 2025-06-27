export type SpeedOption = {
  value: number;
  label: string;
};

export const SPEED_OPTIONS: SpeedOption[] = [
  { value: 2000, label: "느리게" },
  { value: 1000, label: "보통" },
  { value: 500, label: "빠름" },
] as const;
