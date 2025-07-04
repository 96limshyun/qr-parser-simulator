import type { ModeIndicatorBitsType } from "@/features/encode/types/encodeInfoType";
import type { ECLevel } from "@/types/ECCTable";
import type { Mode } from "@/types/versionCapacityTableType";

import { ALPHANUMERIC_TABLE } from "@/constants/alphanumericTable";
import { ECC_TABLE } from "@/constants/eccTable";

const getCharCountBitLength = (version: number, mode: Mode, data: string) => {
  let charCountBitLength = 0;

  if (version <= 9) {
    if (mode === "Numeric") charCountBitLength = 10;
    if (mode === "Alphanumeric") charCountBitLength = 9;
    if (mode === "Byte") charCountBitLength = 8;
    if (mode === "Kanji") charCountBitLength = 8;
  } else if (version <= 26) {
    if (mode === "Numeric") charCountBitLength = 12;
    if (mode === "Alphanumeric") charCountBitLength = 11;
    if (mode === "Byte") charCountBitLength = 16;
    if (mode === "Kanji") charCountBitLength = 10;
  } else {
    if (mode === "Numeric") charCountBitLength = 14;
    if (mode === "Alphanumeric") charCountBitLength = 13;
    if (mode === "Byte") charCountBitLength = 16;
    if (mode === "Kanji") charCountBitLength = 12;
  }

  const lengthBits = data.length.toString(2).padStart(charCountBitLength, "0");

  return lengthBits;
};

const encodeAlphanumeric = (data: string): string => {
  let bits = "";

  for (let i = 0; i < data.length; i += 2) {
    if (i + 1 < data.length) {
      const first = ALPHANUMERIC_TABLE.indexOf(data[i]);
      const second = ALPHANUMERIC_TABLE.indexOf(data[i + 1]);
      const value = 45 * first + second;
      bits += value.toString(2).padStart(11, "0");
    } else {
      const first = ALPHANUMERIC_TABLE.indexOf(data[i]);
      bits += first.toString(2).padStart(6, "0");
    }
  }

  return bits;
};

const encodeNumeric = (data: string): string => {
  let bits = "";
  let i = 0;

  while (i < data.length) {
    if (i + 3 <= data.length) {
      const chunk = data.substr(i, 3);
      bits += parseInt(chunk, 10).toString(2).padStart(10, "0");
      i += 3;
    } else if (i + 2 <= data.length) {
      const chunk = data.substr(i, 2);
      bits += parseInt(chunk, 10).toString(2).padStart(7, "0");
      i += 2;
    } else {
      const chunk = data.substr(i, 1);
      bits += parseInt(chunk, 10).toString(2).padStart(4, "0");
      i += 1;
    }
  }

  return bits;
};

const encodeByte = (data: string): string => {
  let bits = "";

  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);

  for (let i = 0; i < encoded.length; i++) {
    bits += encoded[i].toString(2).padStart(8, "0");
  }

  return bits;
};

const getTotalBits = (version: number, ecLevel: ECLevel) => {
  const eccInfo = ECC_TABLE[version]?.[ecLevel];
  if (!eccInfo) {
    throw new Error(`ECC info not found for version ${version} / level ${ecLevel}`);
  }
  return eccInfo.totalDataCodewords * 8;
};

export const buildBitStream = ({
  mode,
  modeIndicatorBits,
  version,
  data,
  ecLevel,
}: {
  mode: Mode;
  modeIndicatorBits: ModeIndicatorBitsType;
  version: number;
  data: string;
  ecLevel: ECLevel;
}) => {
  let bitstream = modeIndicatorBits + getCharCountBitLength(version, mode, data);

  let dataBits = "";
  if (mode === "Alphanumeric") {
    dataBits = encodeAlphanumeric(data);
  } else if (mode === "Numeric") {
    dataBits = encodeNumeric(data);
  } else if (mode === "Byte") {
    dataBits = encodeByte(data);
  } else {
    throw new Error(`Mode ${mode} not implemented yet.`);
  }

  bitstream += dataBits;

  const totalBits = getTotalBits(version, ecLevel);
  const remaining = totalBits - bitstream.length;
  const terminatorLength = Math.min(4, remaining);
  bitstream += "0".repeat(terminatorLength);

  const extraBits = bitstream.length % 8;
  if (extraBits !== 0) {
    bitstream += "0".repeat(8 - extraBits);
  }

  const padBytes = ["11101100", "00010001"];
  let i = 0;
  while (bitstream.length + 8 <= totalBits) {
    bitstream += padBytes[i % 2];
    i++;
  }

  const remainingBits = totalBits - bitstream.length;
  if (remainingBits > 0) {
    bitstream += padBytes[i % 2].slice(0, remainingBits);
  }

  if (bitstream.length > totalBits) {
    bitstream = bitstream.slice(0, totalBits);
  }

  return bitstream;
};
