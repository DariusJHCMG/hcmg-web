"use client";

/**
 * StartingNowAdminSwitcher
 * Admin-only control bar that lets an admin toggle between:
 *  - "My View"  — their own referrals
 *  - "View LO"  — a specific LO's referrals (selected from a dropdown)
 *
 * Drives navigation via ?lo=<profileId> search param so the server
 * component re-fetches the correct scoped data on every change.
 */

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface LO {
  id: string;
  full_name: string;
}

interface Props {
  myId: string;
  los: LO[];          // all active loan officers (excluding admins)
  currentLoId: string | null; // null = "My View"
}

export function StartingNowAdminSwitcher({ myId, los, currentLoId }: Props) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [dropdownLo, setDropdownLo] = useState(currentLoId ?? "");

  function navigate(loId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (loId) {
      params.set("lo", loId);
    } else {
      params.delete("lo");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const isMyView = !currentLoId || currentLoId === myId;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* My View button */}
      <button
        onClick={() => { setDropdownLo(""); navigate(null); }}
        className={`rounded-xl px-4 py-2 text-sm font-bold border transition-all ${
          isMyView
            ? "border-orange-400 bg-orange-50 text-orange-700"
            : "border-line bg-white text-muted hover:border-orange-200 hover:text-ink"
        }`}
      >
        My View
      </button>

      {/* View Other LO — dropdown */}
      <div className="flex items-center gap-2">
        <select
          value={dropdownLo}
          onChange={e => {
            const val = e.target.value;
            setDropdownLo(val);
            if (val) navigate(val);
          }}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all
                      focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400
                      ${!isMyView
                        ? "border-orange-400 bg-orange-50 text-orange-700"
                        : "border-line bg-white text-muted"
                      }`}
        >
          <option value="">View Another LO…</option>
          {los.map(lo => (
            <option key={lo.id} value={lo.id}>{lo.full_name}</option>
          ))}
        </select>
        {isPending && (
          <svg className="animate-spin h-4 w-4 text-orange-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        )}
      </div>

      {/* Active filter badge */}
      {!isMyView && (
        <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-700">
          Viewing: {los.find(l => l.id === currentLoId)?.full_name ?? currentLoId}
        </span>
      )}
    </div>
  );
}
