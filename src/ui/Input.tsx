import { forwardRef, useId, Fragment, type ReactNode, type InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import twc from "tailwind-styled-components";

import { primitiveVariants } from "./variants";

import type { PrimitiveVariantProps } from "./variants";

type VariantStrict = NonNullable<PrimitiveVariantProps>;

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "color" | "type">
  & VariantStrict & {
    htmlType?: "text" | "number" | "file";
    label?: ReactNode;
    fileAccept?: "image" | "*";
    multi?: boolean;
    capture?: "user" | "environment";
  };

const acceptMap = {
  "image": "image/*",
  "*": "*",
} as const;

const StyledInput = twc.input<VariantStrict>`
  ${({ tone, size, full, rounded, className }) =>
    twMerge(primitiveVariants({ tone, size, full, rounded }), className)}
`;

const StyledLabel = twc.label<VariantStrict>`
  ${({ tone, size, full, rounded, className }) =>
    twMerge(
      primitiveVariants({ tone, size, full, rounded }),
      "cursor-pointer select-none",
      className,
    )}
`;

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    tone,
    size,
    full,
    rounded,
    className,

    htmlType = "text",
    label = "이미지를 선택해주세요.",
    fileAccept = "*",
    multi,
    capture,

    id: idProp,
    ...rest
  } = props;

  const generatedId = useId();
  const id = idProp ?? generatedId;

  if (htmlType === "file") {
    return (
      <Fragment>
        <input
          ref={ref}
          id={id}
          type="file"
          accept={acceptMap[fileAccept]}
          multiple={multi}
          capture={capture}
          className="hidden"
          {...rest}
        />

        <StyledLabel
          htmlFor={id}
          tone={tone}
          size={size}
          full={full}
          rounded={rounded}
          className={className}
        >
          {label}
        </StyledLabel>
      </Fragment>
    );
  }

  return (
    <StyledInput
      ref={ref}
      id={id}
      type={htmlType}
      tone={tone}
      size={size}
      full={full}
      rounded={rounded}
      className={className}
      {...rest}
    />
  );
});

Input.displayName = "Input";
export default Input;
