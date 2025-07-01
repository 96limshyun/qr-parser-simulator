export type SpeedOption = {
  value: number;
  label: string;
};

export const SPEED_OPTIONS: SpeedOption[] = [
  { value: 3500, label: "매우 느리게" },
  { value: 2500, label: "느리게" },
  { value: 2000, label: "보통" },
  { value: 1000, label: "빠르게" },
  { value: 500, label: "매우 빠르게" },
] as const;
