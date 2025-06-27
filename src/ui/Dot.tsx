import { cva, type VariantProps } from "class-variance-authority";
import twc from "tailwind-styled-components";

const dotVariants = cva("rounded-full shrink-0 self-center ", {
  variants: {
    color: {
      gray: "bg-gray-400",
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      orange: "bg-orange-500",
      cyan: "bg-cyan-500",
      purple: "bg-purple-500",
      emerald: "bg-emerald-500",
    },
    size: {
      sm: "w-2 h-2",
      md: "w-3 h-3",
      lg: "w-4 h-4",
    },
  },
  defaultVariants: {
    color: "gray",
    size: "md",
  },
});

const Dot = twc.div<VariantProps<typeof dotVariants>>`
  ${({ color, size }) => dotVariants({ color, size })}
`;

export default Dot;
