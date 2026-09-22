"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// IntroVideoModal
//
// Fullscreen overlay shown to every HCMG U member on their first visit.
//
// Supports two video modes detected automatically from the URL:
//   • Native <video> tag  — for direct .mp4 / storage URLs
//     → tracks timeupdate events; unlocks at UNLOCK_PCT (80%)
//   • iframe embed        — for HeyGen, Vimeo, YouTube, etc.
//     → 158s visible dwell timer (2m 8s video + 30s buffer)
//     → progress bar counts up in real time
//
// Rules:
//   • Blocks the entire UI until dismissed
//   • Button stays locked until threshold is met
//   • On dismiss → POST /api/university/intro-video/complete
//   • Never shown again after completion (server tracks per-profile)
// ─────────────────────────────────────────────────────────────────────────────

const UNLOCK_PCT         = 80;   // % of native video that must be watched
const IFRAME_UNLOCK_SECS = 158;  // 2 min 8 sec + 30 sec buffer

function isIframeUrl(url: string): boolean {
  return (
    url.includes("heygen.com/embeds") ||
    url.includes("vimeo.com") ||
    url.includes("youtube.com/embed") ||
    url.includes("youtu.be") ||
    (!url.startsWith("http") === false && !url.endsWith(".mp4") && !url.endsWith(".mov") && !url.endsWith(".webm"))
  );
}

interface Props {
  videoUrl: string;
  onDismiss: () => void;
}

export function IntroVideoModal({ videoUrl, onDismiss }: Props) {
  const useIframe = isIframeUrl(videoUrl);

  // ── Native video state ──────────────────────────────────────────────────────
  const videoRef     = useRef<HTMLVideoElement>(null);
  const [watchPct,   setWatchPct]   = useState(0);
  const [videoError, setVideoError] = useState(false);

  // ── iframe dwell-time state ─────────────────────────────────────────────────
  const dwellRef         = useRef(0);
  const dwellIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [dwellSecs,  setDwellSecs]  = useState(0);

  // ── Shared ──────────────────────────────────────────────────────────────────
  const [canDismiss, setCanDismiss] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  // ── Native video: track playback progress ───────────────────────────────────
  useEffect(() => {
    if (useIframe) return;
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
    const onEnded = () => { setWatchPct(100); setCanDismiss(true); };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended",      onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended",      onEnded);
    };
  }, [useIframe]);

  // ── iframe: count visible dwell seconds from mount ───────────────────────────
  useEffect(() => {
    if (!useIframe) return;

    dwellIntervalRef.current = setInterval(() => {
      if (document.hidden) return;
      dwellRef.current += 1;
      const secs = dwellRef.current;
      setDwellSecs(secs);
      if (secs >= IFRAME_UNLOCK_SECS) {
        setCanDismiss(true);
        if (dwellIntervalRef.current) clearInterval(dwellIntervalRef.current);
      }
    }, 1000);

    return () => {
      if (dwellIntervalRef.current) clearInterval(dwellIntervalRef.current);
    };
  }, [useIframe]);

  // ── Dismiss ─────────────────────────────────────────────────────────────────
  async function handleDismiss() {
    if (!canDismiss || dismissing) return;
    setDismissing(true);
    try {
      await fetch("/api/university/intro-video/complete", { method: "POST" });
    } catch { /* swallow — modal still dismisses */ }
    onDismiss();
  }

  // ── Derived display values ──────────────────────────────────────────────────
  const progressPct = useIframe
    ? Math.min(100, Math.round((dwellSecs / IFRAME_UNLOCK_SECS) * 100))
    : watchPct;

  const progressColor = canDismiss ? "#22c55e" : "#f58220";

  const lockLabel = useIframe
    ? `Watch for ${IFRAME_UNLOCK_SECS - dwellSecs}s more to continue`
    : `Watch ${UNLOCK_PCT - watchPct}% more to continue`;

  // ── Embed src: normalise HeyGen share URL → embed URL ───────────────────────
  const embedSrc = videoUrl.includes("app.heygen.com/videos/")
    ? videoUrl.replace(
        /app\.heygen\.com\/videos\/welcome-to-hcmg-university-([a-f0-9]+)/,
        "app.heygen.com/embeds/$1"
      ).replace(/app\.heygen\.com\/videos\/([a-f0-9]+)/, "app.heygen.com/embeds/$1")
    : videoUrl;

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
        <span style={{ fontSize: 12, color: canDismiss ? "#94a3b8" : "#3b4a5a" }}>
          {canDismiss ? "Ready to continue ↓" : lockLabel}
        </span>
      </div>

      {/* Video container */}
      <div style={{
        width: "100%", maxWidth: 820,
        borderRadius: 14, overflow: "hidden",
        background: "#000", position: "relative",
        aspectRatio: "16 / 9",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        {useIframe ? (
          <iframe
            src={embedSrc}
            title="Welcome to HCMG University"
            allow="encrypted-media; fullscreen; autoplay"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          />
        ) : videoError ? (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            color: "#94a3b8", gap: 12,
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
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
        <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3,
            background: progressColor,
            width: `${progressPct}%`,
            transition: "width 0.5s ease, background 0.4s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 11, color: "#687383" }}>
            Intro — A message from the CEO
          </span>
          <span style={{ fontSize: 11, color: canDismiss ? "#22c55e" : "#687383", fontWeight: canDismiss ? 700 : 400 }}>
            {canDismiss ? "✓ Complete" : useIframe ? `${dwellSecs}s / ${IFRAME_UNLOCK_SECS}s` : `${watchPct}% watched`}
          </span>
        </div>
      </div>

      {/* Dismiss button */}
      <div style={{ width: "100%", maxWidth: 820, marginTop: 20 }}>
        <button
          onClick={handleDismiss}
          disabled={!canDismiss || dismissing}
          title={!canDismiss ? lockLabel : undefined}
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
            : `🔒 ${lockLabel}`}
        </button>
      </div>

      {/* Footer note */}
      <p style={{ marginTop: 14, fontSize: 11, color: "#3b4a5a", textAlign: "center", maxWidth: 420, lineHeight: 1.6 }}>
        This intro is required for all HCMG U members. It will only be shown once.
      </p>
    </div>
  );
}
