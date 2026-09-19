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
  const reportedComplete        = useRef(false);
  const lastReportPct           = useRef(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/university/video-url?lesson_id=${lessonId}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setVideoUrl(d.url ?? null);
      })
      .catch(() => setError("Could not load video. Please try again."))
      .finally(() => setLoading(false));
  }, [lessonId]);

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
        gap: 12,
      }}>
        <div style={{ fontSize: 32 }}>HCMG <strong style={{ color: "#f58220" }}>U</strong></div>
        <p style={{ color: "#687383", fontSize: 13 }}>
          {error || "Video not yet available for this lesson."}
        </p>
      </div>
    );
  }

  // If the token is an iframe-embeddable URL (HeyGen share links)
  const isEmbed = videoUrl.startsWith("https://app.heygen.com") ||
                  videoUrl.startsWith("https://share.heygen.com");

  if (isEmbed) {
    return (
      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 12, overflow: "hidden" }}>
        <iframe
          src={videoUrl}
          allow="autoplay; fullscreen"
          allowFullScreen
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            border: "none",
          }}
          title="Lesson video"
        />
      </div>
    );
  }

  // Native video (Supabase storage or direct URL)
  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#000" }}>
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
          <button style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg,#FF9847,#F37021)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, color: "#fff",
          }}>▶</button>
          <p style={{ color: "#b9c5d0", fontSize: 13 }}>Click to play</p>
        </div>
      )}
      <video
        src={videoUrl}
        controls
        style={{ width: "100%", display: "block", maxHeight: 480 }}
        onTimeUpdate={handleTimeUpdate}
        autoPlay={started}
      />
    </div>
  );
}
