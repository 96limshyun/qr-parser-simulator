import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import twc from "tailwind-styled-components";

import type { ReactNode } from "react";

const buttonVariants = cva(
  "inline-flex items-center gap-2 rounded-lg transition-colors \
  focus:outline-none focus:ring-offset-2 disabled:opacity-50 \
  disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      intent: {
        primary: "bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white",
        secondary: "bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white",
        danger: "bg-red-600 hover:bg-red-700 text-white",
        ghost: "bg-gray-900/50 hover:bg-gray-700/50 text-white",
      },

      size: {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-3 text-base",
      },

      layout: {
        inline: "",
        block: "w-full text-left",
      },

      active: {
        true: "bg-gray-700 border border-gray-600",
        false: "",
      },
    },

    defaultVariants: {
      intent: "primary",
      size: "md",
      layout: "inline",
      active: false,
    },
  },
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

const Button = twc.button<ButtonProps>`
  ${({ intent, size, layout, active, className }) =>
    twMerge(
      buttonVariants({
        intent,
        size,
        layout,
        active,
      }),
      className,
    )}
`;

export default Button;
