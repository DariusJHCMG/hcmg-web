"use client";

import { useState } from "react";
import { LookupSlideOver } from "@/components/liftoff/LookupSlideOver";

export function LookupButton({ context }: { context: "ops" | "helpdesk" | "pipeline" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-muted hover:border-[#142850]/40 hover:text-ink transition-colors"
      >
        🔍 Quick Lookup
      </button>
      <LookupSlideOver open={open} onClose={() => setOpen(false)} context={context} />
    </>
  );
}
