import { ReactNode } from "react";
import clsx from "clsx";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({
  children,
  className,
}: CardProps) {
  return (
    <div
      className={clsx(
        "group h-full rounded-3xl border border-white/10",
        "bg-white/5 backdrop-blur-xl",
        "transition-all duration-500 ease-out will-change-transform",
        "hover:-translate-y-1.5 hover:border-blue-500/40",
        "hover:shadow-[0_20px_60px_rgba(37,99,235,.2)]",
        "p-5 sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}