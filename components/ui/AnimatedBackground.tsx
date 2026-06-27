"use client";

export default function AnimatedBackground() {
  return (
    <div aria-hidden="true">
      {/* Blue Glow */}
      <div className="pointer-events-none absolute left-10 top-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />

      {/* Purple Glow */}
      <div className="pointer-events-none absolute right-20 top-96 h-72 w-72 rounded-full bg-violet-500/20 blur-[140px]" />

      {/* Cyan Glow */}
      <div className="pointer-events-none absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-[160px]" />
    </div>
  );
}