"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  lessonId: string;
  courseId: string;
  /** Called by the server when verified watch % changes */
  onVerifiedProgress?: (pct: number) => void;
  /** Called when server confirms lesson completion */
  onServerComplete?: () => void;
}

// How often to send a heartbeat (ms)
const HEARTBEAT_INTERVAL_MS = 5000;
// Inactivity timeout — warn after this many ms with no interaction (ms)
const INACTIVITY_WARN_MS    = 5 * 60 * 1000; // 5 min

export function LessonPlayer({
  lessonId,
  courseId,
  onVerifiedProgress,
  onServerComplete,
}: Props) {
  // ── URL / loading state ─────────────────────────────────────────────────────
  const [videoUrl, setVideoUrl]   = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [urlError, setUrlError]   = useState("");
  const [retryKey, setRetryKey]   = useState(0);

  // ── Playback UI state ───────────────────────────────────────────────────────
  const [started, setStarted]     = useState(false);
  const [videoError, setVideoError] = useState("");
  const [watchPct, setWatchPct]   = useState(0);

  // ── Session / integrity state ───────────────────────────────────────────────
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [inactiveWarn, setInactiveWarn] = useState(false);

  // ── Refs (don't trigger re-render) ─────────────────────────────────────────
  const videoRef          = useRef<HTMLVideoElement>(null);
  const sessionIdRef      = useRef<string | null>(null);
  const lastPositionRef   = useRef<number>(0);
  const seekedRef         = useRef(false);
  const heartbeatTimer    = useRef<ReturnType<typeof setInterval> | null>(null);
  const inactivityTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVisibleRef      = useRef(true);
  const isFocusedRef      = useRef(true);
  const completedRef      = useRef(false);

  // ── Step 1: Fetch signed video URL ─────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setUrlError("");
    setVideoUrl(null);
    setStarted(false);
    setCompleted(false);
    setSessionId(null);
    sessionIdRef.current = null;
    completedRef.current = false;

    fetch(`/api/university/video-url?lesson_id=${lessonId}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.error) setUrlError(d.error);
        else setVideoUrl(d.url ?? null);
      })
      .catch(() => setUrlError("Could not load video. Please try again."))
      .finally(() => setLoading(false));
  }, [lessonId, retryKey]);

  // ── Step 2: Start server session when user clicks Play ──────────────────────
  const startSession = useCallback(async () => {
    try {
      const res = await fetch("/api/university/lesson/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lessonId, course_id: courseId }),
      });
      const data = await res.json();
      if (res.ok && data.session_id) {
        setSessionId(data.session_id);
        sessionIdRef.current = data.session_id;
      }
    } catch {
      // Non-fatal — heartbeats will just fail silently
    }
  }, [lessonId, courseId]);

  // ── Step 3: Heartbeat loop — runs while video is started ───────────────────
  const sendHeartbeat = useCallback(async () => {
    const video = videoRef.current;
    const sid   = sessionIdRef.current;
    if (!sid || !video || completedRef.current) return;

    const position  = video.currentTime;
    const duration  = video.duration || 0;
    const isPlaying = !video.paused && !video.ended;

    try {
      const res = await fetch("/api/university/lesson/session/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id:    sid,
          position_secs: Math.round(position),
          duration_secs: Math.round(duration),
          is_playing:    isPlaying,
          is_visible:    isVisibleRef.current,
          is_focused:    isFocusedRef.current,
          playback_rate: video.playbackRate,
          seeked:        seekedRef.current,
        }),
      });

      seekedRef.current = false; // Reset seek flag after reporting

      if (res.ok) {
        const data = await res.json();
        if (data.watch_pct != null) {
          setWatchPct(data.watch_pct);
          onVerifiedProgress?.(data.watch_pct);
        }
      }
    } catch {
      // Network error — silently continue, will retry next interval
    }

    lastPositionRef.current = video.currentTime;
  }, [onVerifiedProgress]);

  // ── Step 4: Ask server to validate + grant completion ──────────────────────
  const requestCompletion = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid || completedRef.current) return;

    try {
      const res = await fetch("/api/university/lesson/session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        completedRef.current = true;
        setCompleted(true);
        onServerComplete?.();
      }
      // If 422: watch time not sufficient — server says no. Client does nothing.
    } catch {
      // Retry is handled by continued heartbeats + re-request on next video end
    }
  }, [onServerComplete]);

  // ── Heartbeat timer lifecycle ───────────────────────────────────────────────
  useEffect(() => {
    if (!started || !sessionId) return;

    heartbeatTimer.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    return () => {
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    };
  }, [started, sessionId, sendHeartbeat]);

  // ── Visibility / focus detection ────────────────────────────────────────────
  useEffect(() => {
    function onVisibilityChange() {
      isVisibleRef.current = document.visibilityState === "visible";
    }
    function onFocus()  { isFocusedRef.current = true; }
    function onBlur()   { isFocusedRef.current = false; }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur",  onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur",  onBlur);
    };
  }, []);

  // ── Inactivity detection ─────────────────────────────────────────────────────
  const resetInactivity = useCallback(() => {
    setInactiveWarn(false);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (started && !completed) {
      inactivityTimer.current = setTimeout(() => setInactiveWarn(true), INACTIVITY_WARN_MS);
    }
  }, [started, completed]);

  useEffect(() => {
    window.addEventListener("mousemove", resetInactivity);
    window.addEventListener("keydown",   resetInactivity);
    window.addEventListener("click",     resetInactivity);
    return () => {
      window.removeEventListener("mousemove", resetInactivity);
      window.removeEventListener("keydown",   resetInactivity);
      window.removeEventListener("click",     resetInactivity);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [resetInactivity]);

  // ── Play started ─────────────────────────────────────────────────────────────
  const handlePlay = useCallback(() => {
    if (!started) {
      setStarted(true);
      startSession();
      resetInactivity();
    }
    resetInactivity();
  }, [started, startSession, resetInactivity]);

  // ── Seek detection ────────────────────────────────────────────────────────────
  const handleSeeked = useCallback(() => {
    seekedRef.current = true;
  }, []);

  // ── Play via useEffect when started ─────────────────────────────────────────
  useEffect(() => {
    if (started && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [started]);

  // ── Video ended — attempt completion ─────────────────────────────────────────
  const handleEnded = useCallback(() => {
    sendHeartbeat(); // Final heartbeat at 100%
    setTimeout(() => requestCompletion(), 800); // Small delay for heartbeat to land
  }, [sendHeartbeat, requestCompletion]);

  // ── Video error handler ──────────────────────────────────────────────────────
  const handleVideoError = useCallback(() => {
    const v = videoRef.current;
    const code = v?.error?.code;
    const msgs: Record<number, string> = {
      1: "Video loading was aborted.",
      2: "Network error while loading video.",
      3: "Video could not be decoded.",
      4: "Video format not supported by your browser.",
    };
    setVideoError(code ? (msgs[code] ?? `Video error (code ${code})`) : "Could not play video.");
  }, []);

  // ── RENDER ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{
        background: "#071a2e", borderRadius: 12, aspectRatio: "16/9",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "3px solid rgba(245,130,32,0.25)", borderTopColor: "#f58220",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <span style={{ color: "#687383", fontSize: 13 }}>Loading video…</span>
        </div>
      </div>
    );
  }

  if (urlError || !videoUrl) {
    return (
      <div style={{
        background: "#071a2e", borderRadius: 12, aspectRatio: "16/9",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
      }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: "#fff" }}>
          HCMG <span style={{ color: "#f58220" }}>U</span>
        </div>
        <p style={{ color: "#687383", fontSize: 13, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
          {urlError || "Video not available yet."}
        </p>
        <button
          onClick={() => setRetryKey(k => k + 1)}
          style={{
            padding: "9px 20px", borderRadius: 8,
            background: "rgba(245,130,32,0.12)", border: "1.5px solid rgba(245,130,32,0.35)",
            color: "#f58220", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >↺ Try again</button>
      </div>
    );
  }

  // HeyGen embed URL — render as iframe directly in the player
  if (videoUrl.includes("heygen.com/embeds")) {
    return (
      <div style={{ borderRadius: 12, overflow: "hidden", background: "#000", aspectRatio: "16/9" }}>
        <iframe
          src={videoUrl}
          title="Lesson video"
          allow="encrypted-media; fullscreen; autoplay"
          allowFullScreen
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        />
      </div>
    );
  }

  // HeyGen share/videos URL (not yet converted to embed) — show link fallback
  if (videoUrl.includes("heygen.com")) {
    const embedId = videoUrl.match(/([a-f0-9]{32})/)?.[1];
    const embedSrc = embedId ? `https://app.heygen.com/embeds/${embedId}` : null;
    if (embedSrc) {
      return (
        <div style={{ borderRadius: 12, overflow: "hidden", background: "#000", aspectRatio: "16/9" }}>
          <iframe
            src={embedSrc}
            title="Lesson video"
            allow="encrypted-media; fullscreen; autoplay"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          />
        </div>
      );
    }
    return (
      <div style={{
        borderRadius: 12, background: "linear-gradient(145deg,#071a2e,#0d2a48)",
        aspectRatio: "16/9",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
      }}>
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

  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#000", aspectRatio: "16/9" }}>

      {/* Play overlay */}
      {!started && (
        <div
          onClick={() => setStarted(true)}
          style={{
            position: "absolute", inset: 0, zIndex: 2,
            background: "linear-gradient(145deg,#071a2e,#0d2a48)",
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
      {videoError && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 3,
          background: "rgba(7,26,46,0.93)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 12,
        }}>
          <p style={{ color: "#f87171", fontSize: 13, textAlign: "center", maxWidth: 300 }}>{videoError}</p>
          <button
            onClick={() => { setVideoError(""); setRetryKey(k => k + 1); }}
            style={{
              padding: "8px 18px", borderRadius: 8,
              background: "rgba(245,130,32,0.12)", border: "1.5px solid rgba(245,130,32,0.35)",
              color: "#f58220", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >↺ Try again</button>
        </div>
      )}

      {/* Inactivity warning overlay */}
      {inactiveWarn && started && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 4,
          background: "rgba(7,26,46,0.93)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
        }}>
          <div style={{ fontSize: 24 }}>⏸</div>
          <p style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>Still watching?</p>
          <p style={{ color: "#b9c5d0", fontSize: 13 }}>Video paused due to inactivity.</p>
          <button
            onClick={() => {
              setInactiveWarn(false);
              resetInactivity();
              videoRef.current?.play().catch(() => {});
            }}
            style={{
              padding: "10px 24px", borderRadius: 8,
              background: "linear-gradient(135deg,#FF9847,#F37021)",
              border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}
          >▶ Resume</button>
        </div>
      )}

      {/* Verified progress bar */}
      {started && watchPct > 0 && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, zIndex: 5,
          height: 3, width: `${watchPct}%`,
          background: "linear-gradient(90deg,#FF9847,#F37021)",
          transition: "width 0.5s ease",
          pointerEvents: "none",
        }} />
      )}

      {/* Completed badge */}
      {completed && (
        <div style={{
          position: "absolute", top: 12, right: 12, zIndex: 5,
          background: "rgba(52,211,153,0.92)", borderRadius: 6,
          padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#fff",
        }}>
          ✓ Completed
        </div>
      )}

      {/* The video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        playsInline
        preload="metadata"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "contain", display: "block",
          opacity: started ? 1 : 0,
        }}
        onPlay={handlePlay}
        onSeeked={handleSeeked}
        onEnded={handleEnded}
        onError={handleVideoError}
        onPause={sendHeartbeat}
      />
    </div>
  );
}
