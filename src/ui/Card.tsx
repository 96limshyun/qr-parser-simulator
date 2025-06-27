// src/components/ui/Card.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import twc from "tailwind-styled-components";

import type { HTMLAttributes } from "react";

const cardVariants = cva("rounded-xl shadow-2xl border inline-block", {
  variants: {
    tone: {
      default: "bg-gray-800 border-gray-700",
      subtle: "bg-gray-900/60 border-gray-700",
      primary: "bg-blue-900/40 border-blue-700",
      success: "bg-emerald-900/40 border-emerald-700",
    },
    padding: {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    tone: "default",
    padding: "md",
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = twc.div<CardProps>`
  ${({ tone, padding, className }) => twMerge(cardVariants({ tone, padding }), className)}
`;

export default Card;
