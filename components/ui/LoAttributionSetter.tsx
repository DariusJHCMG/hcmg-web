"use client";

import { useEffect } from "react";
import { setLoAttribution } from "@/lib/lo-attribution";

/**
 * Invisible component — call on any per-LO page to record the LO slug
 * in sessionStorage so attribution follows the visitor site-wide.
 */
export function LoAttributionSetter({ slug }: { slug: string }) {
  useEffect(() => {
    setLoAttribution(slug);
  }, [slug]);

  return null;
}
