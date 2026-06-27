import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export default function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={props.type ?? "button"}
      className={clsx(
        "relative overflow-hidden rounded-xl px-6 py-3 font-semibold",
        "transition-all duration-300 ease-out will-change-transform",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "active:scale-[0.98]",
        {
          "bg-blue-600 text-white hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_10px_30px_rgba(37,99,235,0.25)]":
            variant === "primary",

          "border border-gray-700 bg-transparent text-white hover:-translate-y-0.5 hover:border-blue-500 hover:bg-gray-900 hover:shadow-[0_10px_30px_rgba(15,23,42,0.35)]":
            variant === "secondary",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}