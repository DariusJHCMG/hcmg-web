"use client";

/**
 * PwaInit — mounts in every authenticated layout.
 * 1. Registers the service worker
 * 2. Listens for SW updates and shows a "New version" banner
 * 3. Listens for NOTIFICATION_CLICK messages from the SW and navigates
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function PwaInit() {
  const router = useRouter();
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // When a new SW is waiting, offer the update banner
        function checkWaiting() {
          if (reg.waiting) setShowUpdate(true);
        }
        checkWaiting();
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", checkWaiting);
        });
      })
      .catch(() => {/* silent — SW not critical */});

    // When the SW activates a new version, auto-reload
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });

    // Deep-link navigation from notification click
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "NOTIFICATION_CLICK" && event.data.url) {
        router.push(event.data.url);
      }
    }
    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!showUpdate) return null;

  return (
    <div style={{
      position: "fixed", bottom: 72, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, width: "calc(100% - 32px)", maxWidth: 380,
      background: "#142850", color: "#fff", borderRadius: 14,
      padding: "12px 16px", display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      fontFamily: "-apple-system, 'Segoe UI', system-ui, sans-serif",
    }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
        🔄 New version available
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: "#F37021", color: "#fff", border: "none",
          borderRadius: 8, padding: "6px 14px", fontSize: 12,
          fontWeight: 800, cursor: "pointer", flexShrink: 0,
          fontFamily: "inherit",
        }}
      >
        Update
      </button>
    </div>
  );
}
