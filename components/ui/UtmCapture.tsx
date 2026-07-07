"use client";

import { useEffect } from "react";
import { captureUtms } from "@/lib/utm";

/**
 * Mount once in the root layout (or any page layout).
 * Silently reads UTM params from the current URL and persists them
 * to sessionStorage so they survive navigation within the same tab.
 * Renders nothing.
 */
export function UtmCapture() {
  useEffect(() => {
    captureUtms();
  }, []);
  return null;
}
