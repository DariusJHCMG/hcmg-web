"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface LO { slug: string; name: string; }

export function AnalyticsScopeSwitcher({ los, currentView, currentLo }: {
  los: LO[];
  currentView: string;
  currentLo: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function nav(view: string, lo = "") {
    const p = new URLSearchParams(params.toString());
    p.set("view", view);
    if (lo) p.set("lo", lo); else p.delete("lo");
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Scope pills */}
      <div className="flex items-center gap-1 rounded-xl border border-line bg-white p-1">
        {[
          { key: "company",  label: "Company-wide" },
          { key: "personal", label: "My Analytics"  },
          { key: "user",     label: "By User"       },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => nav(v.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              currentView === v.key ? "text-white shadow-sm" : "text-muted hover:text-ink"
            }`}
            style={currentView === v.key ? { background: "var(--ok-gradient)" } : {}}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* User picker — only shown in "user" view */}
      {currentView === "user" && (
        <select
          value={currentLo}
          onChange={(e) => nav("user", e.target.value)}
          className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-ink
                     focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <option value="">— Select a loan officer —</option>
          {los.map((lo) => (
            <option key={lo.slug} value={lo.slug}>{lo.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}
