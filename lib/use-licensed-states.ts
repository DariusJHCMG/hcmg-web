"use client";

import { useState, useEffect } from "react";

export interface LicensedState {
  code: string;
  label: string;
}

let cache: LicensedState[] | null = null;
let inflight: Promise<LicensedState[]> | null = null;

async function fetchStates(): Promise<LicensedState[]> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetch("/api/licensed-states")
      .then((r) => r.json())
      .then((d) => {
        cache = (d.states ?? []) as LicensedState[];
        inflight = null;
        return cache;
      })
      .catch(() => {
        inflight = null;
        return [] as LicensedState[];
      });
  }
  return inflight;
}

/**
 * Returns the list of active licensed states from admin settings.
 * Fetches once per page load (module-level cache), so all funnel components
 * on a page share a single request.
 */
export function useLicensedStates(): LicensedState[] {
  const [states, setStates] = useState<LicensedState[]>(cache ?? []);

  useEffect(() => {
    if (cache) { setStates(cache); return; }
    fetchStates().then(setStates);
  }, []);

  return states;
}
