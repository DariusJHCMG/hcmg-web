"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  lessonId: string;
  onProgress?: (pct: number) => void;
  onComplete?: () => void;
}

export function LessonPlayer({ lessonId, onProgress, onComplete }: Props) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [started, setStarted]   = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [videoError, setVideoError] = useState("");
  const videoRef                = useRef<HTMLVideoElement>(null);
  const reportedComplete        = useRef(false);
  const lastReportPct           = useRef(0);

  // Fetch signed URL from server
  useEffect(() => {
    setLoading(true);
    setError("");
    setVideoUrl(null);
    setStarted(false);
    setVideoError("");
    reportedComplete.current = false;
    lastReportPct.current = 0;

    fetch(`/api/university/video-url?lesson_id=${lessonId}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setVideoUrl(d.url ?? null);
      })
      .catch(() => setError("Could not load video. Please try again."))
      .finally(() => setLoading(false));
  }, [lessonId, retryKey]);

  // Play the video when user clicks the overlay
  useEffect(() => {
    if (started && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — user still has native controls to press play
      });
    }
  }, [started]);

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const pct = Math.round((video.currentTime / video.duration) * 100);

    if (pct - lastReportPct.current >= 5 || pct === 100) {
      lastReportPct.current = pct;
      onProgress?.(pct);
    }

    if (pct >= 90 && !reportedComplete.current) {
      reportedComplete.current = true;
      onComplete?.();
    }
  }

  function handleVideoError() {
    const video = videoRef.current;
    const code = video?.error?.code;
    const msgs: Record<number, string> = {
      1: "Video loading was aborted.",
      2: "Network error while loading video.",
      3: "Video could not be decoded — the file may be corrupted.",
      4: "Video format not supported by your browser.",
    };
    setVideoError(code ? (msgs[code] ?? `Video error (code ${code})`) : "Could not play video.");
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        background: "#071a2e", borderRadius: 12, aspectRatio: "16/9",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "3px solid rgba(245,130,32,0.3)",
            borderTopColor: "#f58220",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ color: "#687383", fontSize: 13 }}>Loading video…</div>
        </div>
      </div>
    );
  }

  // ── Error / no video ─────────────────────────────────────────────────────────
  if (error || !videoUrl) {
    return (
      <div style={{
        background: "#071a2e", borderRadius: 12, aspectRatio: "16/9",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 16,
      }}>
        <div style={{ fontSize: 32 }}>HCMG <strong style={{ color: "#f58220" }}>U</strong></div>
        <p style={{ color: "#687383", fontSize: 13, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
          {error || "Video not yet available for this lesson."}
        </p>
        <button
          onClick={() => setRetryKey(k => k + 1)}
          style={{
            padding: "9px 20px", borderRadius: 8,
            background: "rgba(245,130,32,0.15)", border: "1.5px solid rgba(245,130,32,0.4)",
            color: "#f58220", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >↺ Try again</button>
      </div>
    );
  }

  // ── HeyGen share link — can't be embedded, open externally ──────────────────
  if (videoUrl.includes("heygen.com")) {
    return (
      <div style={{
        borderRadius: 12, overflow: "hidden",
        background: "linear-gradient(145deg, #071a2e, #0d2a48)",
        aspectRatio: "16/9",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16,
      }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>
          HCMG <span style={{ color: "#f58220" }}>U</span>
        </div>
        <a
          href={videoUrl} target="_blank" rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg,#FF9847,#F37021)",
            textDecoration: "none", fontSize: 26, color: "#fff",
          }}
        >▶</a>
        <p style={{ color: "#b9c5d0", fontSize: 13 }}>Click to open in HeyGen viewer</p>
      </div>
    );
  }

  // ── Native video (Supabase signed URL) ───────────────────────────────────────
  return (
    <div style={{
      position: "relative", borderRadius: 12, overflow: "hidden",
      background: "#000", aspectRatio: "16/9",
    }}>

      {/* Custom play overlay — shown before user starts */}
      {!started && (
        <div
          onClick={() => setStarted(true)}
          style={{
            position: "absolute", inset: 0, zIndex: 2,
            background: "linear-gradient(145deg, #071a2e, #0d2a48)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 16, cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>
            HCMG <span style={{ color: "#f58220" }}>U</span>
          </div>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg,#FF9847,#F37021)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, color: "#fff",
            boxShadow: "0 8px 32px rgba(245,130,32,0.4)",
          }}>▶</div>
          <p style={{ color: "#b9c5d0", fontSize: 13 }}>Click to play</p>
        </div>
      )}

      {/* Video error overlay */}
      {videoError && started && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 3,
          background: "rgba(7,26,46,0.92)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 12,
        }}>
          <p style={{ color: "#f87171", fontSize: 13, textAlign: "center", maxWidth: 300 }}>{videoError}</p>
          <button
            onClick={() => { setVideoError(""); setRetryKey(k => k + 1); }}
            style={{
              padding: "8px 18px", borderRadius: 8,
              background: "rgba(245,130,32,0.15)", border: "1.5px solid rgba(245,130,32,0.4)",
              color: "#f58220", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >↺ Try again</button>
        </div>
      )}

      <video
        ref={videoRef}
        src={videoUrl}
        controls
        playsInline
        preload="metadata"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "contain",
          display: "block",
          opacity: started ? 1 : 0,
        }}
        onTimeUpdate={handleTimeUpdate}
        onError={handleVideoError}
        onPlay={() => { if (!started) setStarted(true); }}
      />
    </div>
  );
}
