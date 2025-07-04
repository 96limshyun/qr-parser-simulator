import { ENCODE_STEPS } from "@/features/encode/step";

export type EncodeStep = (typeof ENCODE_STEPS)[number]["step"];
