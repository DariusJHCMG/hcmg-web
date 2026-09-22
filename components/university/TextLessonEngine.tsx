"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TextLessonEngine
//
// Integrity engine for text, assignment, and audio lessons.
// Mirrors LessonPlayer's architecture:
//   • Starts a server session on mount
//   • Sends heartbeats every 5s with is_visible, is_focused, scroll_pct
//   • Server accumulates dwell_secs and scroll_pct (never trusted from client)
//   • Calls /session/complete — only the server decides when the lesson is done
//   • Shows a requirement checklist (dwell progress + scroll progress)
//   • "Mark as Complete" button is locked until server watch_pct reaches threshold
//   • Inactivity overlay after 5 minutes of no interaction
// ─────────────────────────────────────────────────────────────────────────────

const HEARTBEAT_INTERVAL_MS = 5_000;
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const COMPLETE_THRESHOLD    = 95; // watch_pct from server must be >= this to unlock

interface Props {
  lessonId:    string;
  courseId:    string;
  children:    React.ReactNode;
  /** Called when the server has confirmed completion */
  onServerComplete: () => void;
  /** Called on every heartbeat with the latest server watch_pct */
  onVerifiedProgress?: (pct: number) => void;
}

export function TextLessonEngine({ lessonId, courseId, children, onServerComplete, onVerifiedProgress }: Props) {
  const sessionIdRef       = useRef<string | null>(null);
  const sessionStartedRef  = useRef(false);
  const completedRef       = useRef(false);
  const isVisibleRef       = useRef(true);
  const isFocusedRef       = useRef(true);
  const scrollPctRef       = useRef(0);
  const heartbeatTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef         = useRef<HTMLDivElement>(null);

  const [watchPct,       setWatchPct]       = useState(0);
  const [sessionError,   setSessionError]   = useState<string | null>(null);
  const [completing,     setCompleting]     = useState(false);
  const [completeError,  setCompleteError]  = useState<string | null>(null);
  const [showInactivity, setShowInactivity] = useState(false);

  // ── Inactivity tracker ──────────────────────────────────────────────────────
  const resetInactivity = useCallback(() => {
    setShowInactivity(false);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => setShowInactivity(true), INACTIVITY_TIMEOUT_MS);
  }, []);

  // ── Session start ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionStartedRef.current) return;
    sessionStartedRef.current = true;

    fetch("/api/university/lesson/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_id: lessonId, course_id: courseId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.session_id) {
          sessionIdRef.current = data.session_id;
        } else {
          setSessionError(data.error ?? "Could not start session");
        }
      })
      .catch(() => setSessionError("Network error — session could not be started"));
  }, [lessonId, courseId]);

  // ── Heartbeat loop ──────────────────────────────────────────────────────────
  const sendHeartbeat = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid || completedRef.current) return;

    try {
      const res = await fetch("/api/university/lesson/session/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sid,
          is_visible:  isVisibleRef.current,
          is_focused:  isFocusedRef.current,
          scroll_pct:  scrollPctRef.current,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data.watch_pct === "number") {
        setWatchPct(data.watch_pct);
        onVerifiedProgress?.(data.watch_pct);
      }
    } catch { /* network blip — skip */ }
  }, [onVerifiedProgress]);

  useEffect(() => {
    heartbeatTimerRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    };
  }, [sendHeartbeat]);

  // ── Visibility / focus listeners ────────────────────────────────────────────
  useEffect(() => {
    const onVis = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) resetInactivity();
    };
    const onFocus = () => { isFocusedRef.current = true;  resetInactivity(); };
    const onBlur  = () => { isFocusedRef.current = false; };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur",  onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur",  onBlur);
    };
  }, [resetInactivity]);

  // ── Scroll tracker (IntersectionObserver on sentinel at bottom of content) ──
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const onScroll = () => {
      resetInactivity();
      const el     = container;
      const scrolled = el.scrollTop + el.clientHeight;
      const total    = el.scrollHeight;
      if (total > 0) {
        const pct = Math.min(100, Math.round((scrolled / total) * 100));
        if (pct > scrollPctRef.current) scrollPctRef.current = pct;
      }
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    // Also track window scroll for non-overflowing content
    const onWindowScroll = () => {
      resetInactivity();
      const scrolled = window.scrollY + window.innerHeight;
      const total    = document.documentElement.scrollHeight;
      if (total > 0) {
        const pct = Math.min(100, Math.round((scrolled / total) * 100));
        if (pct > scrollPctRef.current) scrollPctRef.current = pct;
      }
    };
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onWindowScroll);
    };
  }, [resetInactivity]);

  // ── Mouse / key movement resets inactivity ──────────────────────────────────
  useEffect(() => {
    const events = ["mousemove", "keydown", "touchstart", "click"] as const;
    events.forEach(e => window.addEventListener(e, resetInactivity, { passive: true }));
    resetInactivity(); // start timer on mount
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [resetInactivity]);

  // ── Complete handler ────────────────────────────────────────────────────────
  async function handleComplete() {
    const sid = sessionIdRef.current;
    if (!sid || completing || completedRef.current) return;
    setCompleting(true);
    setCompleteError(null);

    // Final heartbeat to flush latest state
    await sendHeartbeat();

    try {
      const res = await fetch("/api/university/lesson/session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid }),
      });
      const data = await res.json();
      if (data.ok) {
        completedRef.current = true;
        if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
        onServerComplete();
      } else if (data.failures?.length) {
        const msgs = (data.failures as { message: string }[]).map(f => f.message);
        setCompleteError(msgs.join(" "));
      } else {
        setCompleteError(data.error ?? "Could not complete lesson. Please try again.");
      }
    } catch {
      setCompleteError("Network error — please try again.");
    } finally {
      setCompleting(false);
    }
  }

  const canComplete = watchPct >= COMPLETE_THRESHOLD;

  // ── Requirement checklist items ─────────────────────────────────────────────
  // We derive visual states from watch_pct (a weighted blend from heartbeat)
  // The real gate is the server, but showing progress helps learners know what's needed.
  const dwellProgress  = Math.min(100, Math.round(watchPct / 0.7));   // ~70% weight
  const scrollProgress = Math.min(100, scrollPctRef.current);

  return (
    <div style={{ position: "relative" }}>
      {/* Inactivity overlay */}
      {showInactivity && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(6,24,42,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 16,
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: "36px 40px",
            textAlign: "center", maxWidth: 360,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⏸</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#071a2e", fontFamily: "Manrope, system-ui", marginBottom: 8 }}>
              Still there?
            </div>
            <p style={{ fontSize: 14, color: "#687383", margin: "0 0 20px", lineHeight: 1.6 }}>
              Your session has been paused due to inactivity.
              Click to resume where you left off.
            </p>
            <button
              onClick={() => { setShowInactivity(false); resetInactivity(); }}
              style={{
                width: "100%", padding: "12px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg,#FF9847,#F37021)",
                color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
              }}
            >
              Resume lesson
            </button>
          </div>
        </div>
      )}

      {/* Session error */}
      {sessionError && (
        <div style={{
          marginBottom: 16, padding: "12px 16px", borderRadius: 10,
          background: "rgba(185,28,28,0.07)", border: "1.5px solid rgba(185,28,28,0.25)",
          fontSize: 13, color: "#b91c1c",
        }}>
          ⚠ {sessionError}
        </div>
      )}

      {/* Lesson content */}
      <div ref={contentRef}>
        {children}
      </div>

      {/* Requirement checklist + complete button */}
      <div style={{
        marginTop: 24, padding: "20px 22px", borderRadius: 12,
        background: "#f7f8fa", border: "1.5px solid #dfe4e8",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope, system-ui" }}>
          Lesson requirements
        </div>

        {/* Dwell progress row */}
        <RequirementRow
          label="Reading time"
          pct={Math.min(100, Math.round((dwellProgress / 100) * 100))}
          done={watchPct >= COMPLETE_THRESHOLD}
        />

        {/* Scroll progress row */}
        <RequirementRow
          label="Content scrolled"
          pct={scrollProgress}
          done={scrollProgress >= 80}
        />

        {/* Server watch_pct bar */}
        <div style={{ marginTop: 14, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "#687383" }}>Overall progress</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#142234" }}>{watchPct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 4, background: "#e2e8f0", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              background: watchPct >= COMPLETE_THRESHOLD
                ? "linear-gradient(90deg,#22c55e,#16a34a)"
                : "linear-gradient(90deg,#f58220,#f37021)",
              width: `${watchPct}%`,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {completeError && (
          <div style={{
            marginBottom: 12, padding: "10px 14px", borderRadius: 8,
            background: "rgba(185,28,28,0.06)", border: "1.5px solid rgba(185,28,28,0.2)",
            fontSize: 12, color: "#b91c1c",
          }}>
            ⚠ {completeError}
          </div>
        )}

        <button
          onClick={handleComplete}
          disabled={!canComplete || completing || !sessionIdRef.current}
          title={!canComplete ? `Keep reading — ${COMPLETE_THRESHOLD - watchPct}% more progress needed` : undefined}
          style={{
            width: "100%", padding: "13px", borderRadius: 10, border: "none",
            background: canComplete
              ? "linear-gradient(135deg,#FF9847,#F37021)"
              : "#e2e8f0",
            color: canComplete ? "#fff" : "#9ca3af",
            fontSize: 14, fontWeight: 700,
            cursor: canComplete ? "pointer" : "not-allowed",
            transition: "background 0.3s, color 0.3s",
          }}
        >
          {completing ? "Completing…" : canComplete ? "✓ Mark as complete" : `🔒 Keep reading (${watchPct}% / ${COMPLETE_THRESHOLD}%)`}
        </button>
      </div>
    </div>
  );
}

// ── Sub-component: single requirement row ────────────────────────────────────
function RequirementRow({ label, pct, done }: { label: string; pct: number; done: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{
            width: 18, height: 18, borderRadius: "50%",
            background: done ? "rgba(34,197,94,0.15)" : "rgba(100,116,139,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, flexShrink: 0,
          }}>
            {done ? "✓" : "○"}
          </span>
          <span style={{ fontSize: 12, color: done ? "#16a34a" : "#687383", fontWeight: done ? 700 : 400 }}>
            {label}
          </span>
        </div>
        <span style={{ fontSize: 11, color: done ? "#16a34a" : "#9ca3af", fontWeight: 600 }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 3, background: "#e2e8f0", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 3,
          background: done ? "#22c55e" : "#94a3b8",
          width: `${pct}%`,
          transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}
