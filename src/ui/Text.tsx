import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import twc from "tailwind-styled-components";

import type { ReactNode } from "react";

const textVariants = cva("", {
  variants: {
    fontSize: {
      "xs": "text-xs",
      "sm": "text-sm",
      "md": "text-base",
      "lg": "text-lg",
      "xl": "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
    },
    fontWeight: {
      thin: "font-thin",
      normal: "font-normal",
      medium: "font-medium",
      bold: "font-bold",
      extraBold: "font-extrabold",
    },
    color: {
      gray400: "text-gray-400",
      gray300: "text-gray-300",
      red: "text-red-500",
      blue: "text-blue-500",
      green: "text-green-500",
      yellow: "text-yellow-500",
      orange: "text-orange-500",
      cyan: "text-cyan-500",
    },
  },
  defaultVariants: {
    color: "gray300",
    fontSize: "md",
    fontWeight: "normal",
  },
});

interface TextProps extends VariantProps<typeof textVariants> {
  children: ReactNode;
  className?: string;
}

const Text = twc.p<TextProps>`
  ${({ fontSize, fontWeight, color, className }) => twMerge(textVariants({ fontSize, fontWeight, color }), className)}
`;

export default Text;
