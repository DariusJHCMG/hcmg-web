"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// IntroVideoModal
//
// Fullscreen overlay shown to every HCMG U member on their first visit.
// Rules:
//   • Blocks the entire UI until dismissed
//   • Video must reach 80% watched before "I've watched it" button unlocks
//   • On dismiss → POST /api/university/intro-video/complete
//   • Never shown again after completion (server tracks per-profile)
// ─────────────────────────────────────────────────────────────────────────────

const UNLOCK_PCT = 80; // % of video that must be watched to unlock dismiss

interface Props {
  videoUrl: string;
  onDismiss: () => void;
}

export function IntroVideoModal({ videoUrl, onDismiss }: Props) {
  const videoRef       = useRef<HTMLVideoElement>(null);
  const [watchPct,     setWatchPct]     = useState(0);
  const [canDismiss,   setCanDismiss]   = useState(false);
  const [dismissing,   setDismissing]   = useState(false);
  const [videoError,   setVideoError]   = useState(false);

  // Track highest watch percentage as video plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (!video.duration) return;
      const pct = Math.min(100, Math.round((video.currentTime / video.duration) * 100));
      setWatchPct(prev => {
        const next = Math.max(prev, pct);
        if (next >= UNLOCK_PCT) setCanDismiss(true);
        return next;
      });
    };

    const onEnded = () => setCanDismiss(true);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended",      onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended",      onEnded);
    };
  }, []);

  async function handleDismiss() {
    if (!canDismiss || dismissing) return;
    setDismissing(true);
    try {
      await fetch("/api/university/intro-video/complete", { method: "POST" });
    } catch { /* swallow — modal still dismisses */ }
    onDismiss();
  }

  const progressColor = canDismiss ? "#22c55e" : "#f58220";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(6,24,42,0.97)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        width: "100%", maxWidth: 820,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 18,
      }}>
        {/* HCMG U wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#FF9847,#F37021)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#fff",
          }}>H</div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "Manrope, system-ui" }}>
            Welcome to HCMG U
          </span>
        </div>
        {/* Small skip label — visible but grayed until unlocked */}
        <span style={{ fontSize: 12, color: canDismiss ? "#94a3b8" : "#3b4a5a" }}>
          {canDismiss ? "Ready to continue ↓" : `Watch ${UNLOCK_PCT - watchPct}% more to continue`}
        </span>
      </div>

      {/* Video container */}
      <div style={{
        width: "100%", maxWidth: 820,
        borderRadius: 14,
        overflow: "hidden",
        background: "#000",
        position: "relative",
        aspectRatio: "16 / 9",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        {videoError ? (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            color: "#94a3b8", gap: 12,
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: 13 }}>Video unavailable. Please contact your admin.</span>
            <button
              onClick={() => { setVideoError(false); setCanDismiss(true); }}
              style={{
                marginTop: 8, padding: "8px 20px", borderRadius: 8, border: "none",
                background: "rgba(245,130,32,0.15)", color: "#f58220",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              Skip intro
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            playsInline
            onError={() => setVideoError(true)}
            style={{ width: "100%", height: "100%", display: "block", background: "#000" }}
          />
        )}
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 820, marginTop: 16 }}>
        <div style={{
          height: 5, borderRadius: 3,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 3,
            background: progressColor,
            width: `${watchPct}%`,
            transition: "width 0.3s ease, background 0.4s ease",
          }} />
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: 6,
        }}>
          <span style={{ fontSize: 11, color: "#687383" }}>
            Intro — A message from the CEO
          </span>
          <span style={{ fontSize: 11, color: canDismiss ? "#22c55e" : "#687383", fontWeight: canDismiss ? 700 : 400 }}>
            {canDismiss ? "✓ Complete" : `${watchPct}% watched`}
          </span>
        </div>
      </div>

      {/* Dismiss button */}
      <div style={{ width: "100%", maxWidth: 820, marginTop: 20 }}>
        <button
          onClick={handleDismiss}
          disabled={!canDismiss || dismissing}
          title={!canDismiss ? `Watch ${UNLOCK_PCT - watchPct}% more to continue` : undefined}
          style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: canDismiss
              ? "linear-gradient(135deg,#FF9847,#F37021)"
              : "rgba(255,255,255,0.06)",
            color: canDismiss ? "#fff" : "#3b4a5a",
            fontSize: 15, fontWeight: 700,
            cursor: canDismiss ? "pointer" : "not-allowed",
            transition: "background 0.4s, color 0.4s",
            letterSpacing: "-0.2px",
          }}
        >
          {dismissing
            ? "Saving…"
            : canDismiss
            ? "✓ I've watched it — Enter HCMG U"
            : `🔒 Watch ${UNLOCK_PCT - watchPct}% more to continue`}
        </button>
      </div>

      {/* Footer note */}
      <p style={{ marginTop: 14, fontSize: 11, color: "#3b4a5a", textAlign: "center", maxWidth: 420, lineHeight: 1.6 }}>
        This intro is required for all HCMG U members. It will only be shown once.
      </p>
    </div>
  );
}
