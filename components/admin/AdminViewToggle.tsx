"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Shown in the admin top bar. Toggles between the admin portal and the
 * LO-facing portal so admins can preview what loan officers see.
 */
export function AdminViewToggle() {
  const pathname = usePathname();
  const isInPortal = pathname.startsWith("/portal");

  if (isInPortal) {
    return (
      <Link
        href="/admin"
        className="hidden items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-sm transition-colors hover:bg-sand sm:flex"
      >
        <span>←</span> Back to Admin
      </Link>
    );
  }

  return (
    <Link
      href="/portal"
      className="hidden items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-sm transition-colors hover:bg-sand sm:flex"
    >
      <span>👁</span> View as LO
    </Link>
  );
}
