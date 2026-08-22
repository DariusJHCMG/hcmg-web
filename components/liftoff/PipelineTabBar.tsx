"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/liftoff/pipeline",     label: "📊 Kanban" },
  { href: "/liftoff/pipeline/sla", label: "⏱ SLA Tracker" },
];

export function PipelineTabBar() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 border-b border-line mb-6">
      {TABS.map(tab => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-5 py-2.5 text-sm font-bold transition-all border-b-2 -mb-px ${
              active
                ? "border-[#142850] text-ink"
                : "border-transparent text-muted hover:text-ink hover:border-line"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
