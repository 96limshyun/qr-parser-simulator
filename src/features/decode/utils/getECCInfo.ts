import type { ECBlockInfo } from "@/types/ECCTable";

import { ECC_TABLE } from "@/constants/eccTable";

export function getECCInfo(
  version: number,
  ecLevel: "L" | "M" | "Q" | "H",
): ECBlockInfo | undefined {
  return ECC_TABLE[version]?.[ecLevel];
}
