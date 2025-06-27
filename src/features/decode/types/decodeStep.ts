import type { DECODE_STEPS } from "@/features/decode/step";

export type DecodeStep = (typeof DECODE_STEPS)[number]["step"];
