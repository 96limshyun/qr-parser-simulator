import { cva, type VariantProps } from "class-variance-authority";

export const primitiveVariants = cva(
  "inline-flex items-center gap-2 rounded-lg transition-colors \
  focus:outline-none focus:ring-offset-2 disabled:opacity-50 \
  disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      tone: {
        primary: "bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white",
        secondary: "bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white",
        danger: "bg-red-600 hover:bg-red-700 text-white",
        ghost: "bg-gray-900/50 hover:bg-gray-700/50 text-white",
      },
      size: {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-1 text-sm",
        lg: "px-5 py-2 text-sm",
      },
      full: {
        true: "w-full",
        false: "",
      },
      rounded: {
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      tone: "primary",
      size: "md",
      full: false,
      rounded: "md",
    },
  },
);

export type PrimitiveVariantProps = VariantProps<typeof primitiveVariants>;
