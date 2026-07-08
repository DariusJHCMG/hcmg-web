"use client";

import { useEffect } from "react";

// Fires a single POST to /api/portal/ping on mount.
// Updates last_seen_at for the current user. Renders nothing.
export function PortalPing() {
  useEffect(() => {
    fetch("/api/portal/ping", { method: "POST" }).catch(() => {});
  }, []);
  return null;
}
