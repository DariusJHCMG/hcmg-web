"use client";

/**
 * PushPermission — shown once after login to request notification permission.
 * Does NOT use the browser's native permission dialog directly — shows a
 * friendly HCMG-branded prompt first, then requests permission on explicit tap.
 */

import { useEffect, useState } from "react";

const PUSH_DISMISSED_KEY = "hcmg-push-dismissed";

export function PushPermission() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show if: push is supported, permission not yet granted/denied, not dismissed
    if (
      !("PushManager" in window) ||
      !("serviceWorker" in navigator) ||
      Notification.permission !== "default" ||
      sessionStorage.getItem(PUSH_DISMISSED_KEY)
    ) return;

    // Small delay so it doesn't appear on top of the login redirect
    const t = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(t);
  }, []);

  async function allow() {
    setShow(false);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      // Fetch public VAPID key
      const res = await fetch("/api/push/vapid-key");
      if (!res.ok) return;
      const { publicKey } = await res.json();

      // Get SW registration
      const reg = await navigator.serviceWorker.ready;

      // Subscribe
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Save to server
      const sub = subscription.toJSON();
      await fetch("/api/push/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          endpoint: sub.endpoint,
          keys:     sub.keys,
        }),
      });
    } catch (err) {
      console.error("[push] subscribe error:", err);
    }
  }

  function dismiss() {
    sessionStorage.setItem(PUSH_DISMISSED_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
      zIndex: 9998, width: "calc(100% - 32px)", maxWidth: 380,
      background: "#fff",
      border: "1px solid #E2E8F0",
      borderRadius: 16,
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      overflow: "hidden",
      fontFamily: "-apple-system, 'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Accent bar */}
      <div style={{ height: 3, background: "linear-gradient(90deg,#142850,#F37021)" }} />

      <div style={{ padding: "16px 16px 12px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <img src="/icons/icon-192.png" alt="HCMG"
          style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, border: "1px solid #E2E8F0" }} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800, color: "#1A2B42" }}>
            Stay on top of your work
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>
            Get notified about new leads, Lift Off updates, and goal milestones.
          </p>
        </div>
        <button onClick={dismiss} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#94A3B8", fontSize: 16, padding: 2, flexShrink: 0,
          fontFamily: "inherit",
        }}>✕</button>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "0 16px 16px" }}>
        <button onClick={dismiss} style={{
          flex: 1, padding: "10px 0", borderRadius: 10,
          border: "1px solid #E2E8F0", background: "#F8FAFC",
          fontSize: 13, fontWeight: 700, color: "#64748B",
          cursor: "pointer", fontFamily: "inherit",
        }}>
          Not now
        </button>
        <button onClick={allow} style={{
          flex: 2, padding: "10px 0", borderRadius: 10,
          border: "none", background: "linear-gradient(135deg,#FF9847,#F37021)",
          fontSize: 13, fontWeight: 800, color: "#fff",
          cursor: "pointer", fontFamily: "inherit",
          boxShadow: "0 4px 12px rgba(243,112,33,0.3)",
        }}>
          Turn on notifications
        </button>
      </div>
    </div>
  );
}

/** Convert a URL-safe base64 VAPID public key to a Uint8Array for the browser API. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
