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
  const reportedComplete        = useRef(false);
  const lastReportPct           = useRef(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    setVideoUrl(null);
    fetch(`/api/university/video-url?lesson_id=${lessonId}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setVideoUrl(d.url ?? null);
      })
      .catch(() => setError("Could not load video. Please try again."))
      .finally(() => setLoading(false));
  }, [lessonId, retryKey]);

  function handleTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
    const video = e.currentTarget;
    if (!video.duration) return;
    const pct = Math.round((video.currentTime / video.duration) * 100);

    // Report every 5% change
    if (pct - lastReportPct.current >= 5 || pct === 100) {
      lastReportPct.current = pct;
      onProgress?.(pct);
    }

    // Mark complete at 90%
    if (pct >= 90 && !reportedComplete.current) {
      reportedComplete.current = true;
      onComplete?.();
    }
  }

  if (loading) {
    return (
      <div style={{
        background: "#071a2e",
        borderRadius: 12,
        height: 360,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ color: "#687383", fontSize: 13 }}>Loading lesson…</div>
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <div style={{
        background: "#071a2e",
        borderRadius: 12,
        height: 360,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 16,
      }}>
        <div style={{ fontSize: 32 }}>HCMG <strong style={{ color: "#f58220" }}>U</strong></div>
        <p style={{ color: "#687383", fontSize: 13, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
          {error || "Video not yet available for this lesson."}
        </p>
        <button
          onClick={() => { reportedComplete.current = false; lastReportPct.current = 0; setRetryKey(k => k + 1); }}
          style={{
            padding: "9px 20px", borderRadius: 8,
            background: "rgba(245,130,32,0.15)", border: "1.5px solid rgba(245,130,32,0.4)",
            color: "#f58220", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          ↺ Try again
        </button>
      </div>
    );
  }

  // HeyGen share links can't be iframed — show a play-in-new-tab card instead
  const isHeyGen = videoUrl.includes("heygen.com");

  if (isHeyGen) {
    return (
      <div style={{
        position: "relative", borderRadius: 12, overflow: "hidden",
        background: "linear-gradient(145deg, #071a2e, #0d2a48)",
        aspectRatio: "16/9",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16,
      }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>
          HCMG <span style={{ color: "#f58220" }}>U</span>
        </div>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg,#FF9847,#F37021)",
            textDecoration: "none", fontSize: 22, color: "#fff",
          }}
        >▶</a>
        <p style={{ color: "#b9c5d0", fontSize: 13 }}>Opens in HeyGen viewer</p>
      </div>
    );
  }

  // Native video (Supabase signed URL or direct MP4)
  return (
    <div style={{
      position: "relative", borderRadius: 12, overflow: "hidden",
      background: "#000", aspectRatio: "16/9",
    }}>
      {!started && (
        <div
          style={{
            position: "absolute", inset: 0, zIndex: 2,
            background: "linear-gradient(145deg, #071a2e, #0d2a48)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 16, cursor: "pointer",
          }}
          onClick={() => setStarted(true)}
        >
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>
            HCMG <span style={{ color: "#f58220" }}>U</span>
          </div>
          <button
            type="button"
            style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg,#FF9847,#F37021)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, color: "#fff",
            }}
          >▶</button>
          <p style={{ color: "#b9c5d0", fontSize: 13 }}>Click to play</p>
        </div>
      )}
      <video
        ref={(el) => { if (el && started) { el.play().catch(() => {}); } }}
        src={videoUrl}
        controls
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "contain", display: "block",
          opacity: started ? 1 : 0,
        }}
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
}
