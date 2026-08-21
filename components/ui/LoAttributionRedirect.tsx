"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLoAttribution } from "@/lib/lo-attribution";

/**
 * Reads the attributed LO slug from sessionStorage.
 * If /get-started was reached without a ?lo= param but an attribution exists,
 * immediately redirects to the same URL with ?lo= appended so the LO context
 * is loaded server-side and the lead is correctly assigned.
 */
export function LoAttributionRedirect() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only act if no lo param is already present
    if (searchParams.get("lo")) return;
    const slug = getLoAttribution();
    if (!slug) return;

    // Rebuild the URL with the attributed slug prepended
    const params = new URLSearchParams(searchParams.toString());
    params.set("lo", slug);
    router.replace(`/get-started?${params.toString()}`);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
