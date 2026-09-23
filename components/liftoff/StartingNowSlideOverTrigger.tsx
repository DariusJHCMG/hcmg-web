"use client";

/**
 * StartingNowSlideOverTrigger
 * Thin client shell that renders the header layout + "New Referral" button
 * and owns the slide-over open state.
 * The parent page.tsx is a server component — this is the only client boundary needed.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StartingNowSlideOver } from "@/components/liftoff/StartingNowSlideOver";

export function StartingNowSlideOverTrigger({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSubmitted() {
    setOpen(false);
    router.refresh(); // re-runs server component to reload the referrals table
  }

  return (
    <>
      <div className="flex items-start justify-between">
        {children}
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity
                     hover:opacity-90 flex-shrink-0 ml-4"
          style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}
        >
          + New Referral
        </button>
      </div>

      <StartingNowSlideOver
        open={open}
        onClose={() => setOpen(false)}
        onSubmitted={handleSubmitted}
      />
    </>
  );
}
