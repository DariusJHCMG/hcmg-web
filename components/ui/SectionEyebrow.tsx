import { ReactNode } from "react";

export function SectionEyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mb-4 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent ${className}`}
      style={{ background: "rgba(243,112,33,0.07)" }}>
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </div>
  );
}
