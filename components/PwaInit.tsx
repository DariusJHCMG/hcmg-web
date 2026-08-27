"use client";

/**
 * PwaInit — mounts in every authenticated layout.
 * 1. Registers the service worker
 * 2. On new SW activation (controllerchange) — silently reloads the page
 * 3. Polls for updates every 30s so long-lived sessions catch deploys quickly
 * 4. Listens for NOTIFICATION_CLICK messages from the SW and navigates
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PwaInit() {
  const router = useRouter();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let reg: ServiceWorkerRegistration | null = null;

    navigator.serviceWorker
      .register("/sw.js")
      .then((r) => {
        reg = r;
        // Poll every 30s — catches new deploys on long-lived sessions
        const interval = setInterval(() => r.update(), 30_000);
        return () => clearInterval(interval);
      })
      .catch(() => {/* SW not critical */});

    // New SW activated → reload to get fresh assets
    let reloading = false;
    function onControllerChange() {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    }
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    // Deep-link navigation from push notification click
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "NOTIFICATION_CLICK" && event.data.url) {
        router.push(event.data.url);
      }
    }
    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
