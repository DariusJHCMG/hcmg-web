"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Shown in the top bar of SLICE, LiftOff, and HCMG U — admin only.
 * Mirrors the exact behaviour of AdminViewToggle in the main portal:
 *   • When in admin view  → shows "👁 View as LO"  → adds ?lo_view=1
 *   • When in LO view     → shows "← Back to Admin" → removes ?lo_view=1
 */
export function ToolViewToggle() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const isLoView     = searchParams.get("lo_view") === "1";

  const btnClass =
    "inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f2328] shadow-sm transition-colors hover:bg-[#f6f8fa]";

  if (isLoView) {
    // Strip ?lo_view=1 — keep all other params
    const next = new URLSearchParams(searchParams.toString());
    next.delete("lo_view");
    const href = next.size > 0 ? `${pathname}?${next}` : pathname;
    return (
      <Link href={href} className={btnClass}>
        <span>←</span> Back to Admin
      </Link>
    );
  }

  // Add ?lo_view=1
  const next = new URLSearchParams(searchParams.toString());
  next.set("lo_view", "1");
  const href = `${pathname}?${next}`;
  return (
    <Link href={href} className={btnClass}>
      <span>👁</span> View as LO
    </Link>
  );
}
