import { ReactNode } from "react";
import clsx from "clsx";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export default function GlassCard({
  children,
  className,
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        "group relative overflow-hidden rounded-3xl",
        "border border-white/10",
        "bg-white/5 backdrop-blur-xl",
        "shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
        "transition-all duration-500 ease-out will-change-transform",
        "hover:-translate-y-1.5",
        "hover:border-blue-400/40",
        "hover:shadow-[0_20px_60px_rgba(59,130,246,0.2)]",
        className
      )}
    >
      {/* Glow */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}