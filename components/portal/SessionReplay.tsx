"use client";

import { useEffect, useRef, useState } from "react";

interface ReplayMeta {
  recordingId: string;
  sessionId:   string;
  duration:    number;
  startTime:   string;
  viewCount:   number;
  clickCount:  number;
  snapshots:   Record<string, unknown[]> | null;
  blobKeys:    string[] | null;
}

interface Props {
  leadId:   string;
  leadName: string;
}

type Status = "idle" | "loading" | "no_key" | "no_recording" | "ready" | "error";

function formatDuration(secs: number): string {
  if (!secs) return "0s";
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function SessionReplay({ leadId, leadName }: Props) {
  const [status, setStatus]   = useState<Status>("idle");
  const [meta, setMeta]       = useState<ReplayMeta | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  const playerRef             = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const replayerRef           = useRef<any>(null);
  const rafRef                = useRef<number>(0);

  async function load() {
    setStatus("loading");
    try {
      const res  = await fetch(`/api/portal/leads/${leadId}/replay`);
      const json = await res.json();

      if (res.status === 503) { setStatus("no_key"); return; }
      if (res.status === 404) { setStatus("no_recording"); return; }
      if (!res.ok)            { setStatus("error"); return; }

      setMeta(json);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  // Build and start the rrweb Replayer once meta is loaded and user hits Play
  async function startReplay() {
    if (!meta?.snapshots || !playerRef.current) {
      // No inline snapshots — open PostHog fallback
      const phHost    = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
      const projectId = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;
      if (projectId) {
        window.open(
          `${phHost}/project/${projectId}/replay/${meta?.recordingId}`,
          "_blank",
        );
      }
      return;
    }

    setPlaying(true);

    // Dynamically import rrweb Replayer from PostHog's bundle
    const rrweb = await import(
      /* webpackChunkName: "rrweb" */
      "posthog-js/dist/rrweb.js"
    ) as { Replayer: new (events: unknown[], opts: unknown) => unknown };

    // Flatten events from all windows, sorted by timestamp
    const allEvents = Object.values(meta.snapshots)
      .flat()
      .sort((a: any, b: any) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

    if (allEvents.length === 0) {
      setPlaying(false);
      setStatus("no_recording");
      return;
    }

    // Clear previous player
    if (playerRef.current) playerRef.current.innerHTML = "";
    cancelAnimationFrame(rafRef.current);

    const replayer = new rrweb.Replayer(allEvents, {
      root:               playerRef.current,
      skipInactive:       true,
      showWarning:        false,
      showDebug:          false,
      blockClass:         "rr-block",
      liveMode:           false,
      insertStyleRules:   [],
      triggerFocus:       false,
      UNSAFE_replayCanvas: false,
    }) as any;

    replayerRef.current = replayer;
    replayer.play();

    // Track progress
    const totalMs = (meta.duration ?? 0) * 1000;
    const tick = () => {
      if (!replayerRef.current) return;
      try {
        const elapsed = replayerRef.current.getCurrentTime?.() ?? 0;
        setProgress(totalMs > 0 ? Math.min((elapsed / totalMs) * 100, 100) : 0);
      } catch { /* ignore */ }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function pauseResume() {
    if (!replayerRef.current) return;
    const state = replayerRef.current.service?.state?.value;
    if (state === "playing") {
      replayerRef.current.pause();
      setPlaying(false);
    } else {
      replayerRef.current.play();
      setPlaying(true);
    }
  }

  function seek(pct: number) {
    if (!replayerRef.current || !meta?.duration) return;
    replayerRef.current.pause((pct / 100) * meta.duration * 1000);
    setProgress(pct);
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // ── Render ──────────────────────────────────────────────────────

  if (status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <p className="text-sm text-[#8b949e] max-w-sm text-center">
          Load the session recording for <strong className="text-white">{leadName}</strong> — every click, scroll, and page they visited before submitting.
        </p>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl bg-[#f37021] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
        >
          <span>▶</span> Load Session Recording
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-[#f37021] border-t-transparent animate-spin" />
        <p className="text-sm text-[#8b949e]">Fetching recording…</p>
      </div>
    );
  }

  if (status === "no_key") {
    return (
      <div className="flex flex-col items-center py-10 gap-3 text-center">
        <p className="text-sm text-[#8b949e] max-w-sm">
          PostHog Personal API Key not configured. Add <code className="text-[#f37021]">POSTHOG_PERSONAL_API_KEY</code> to your Vercel env vars to enable in-portal replay.
        </p>
      </div>
    );
  }

  if (status === "no_recording") {
    return (
      <div className="flex flex-col items-center py-10 gap-3 text-center">
        <p className="text-2xl">🎬</p>
        <p className="text-sm font-semibold text-white">No recording yet</p>
        <p className="text-xs text-[#8b949e] max-w-xs">
          This lead submitted before session recording was active, or the recording hasn&apos;t finished processing yet (can take up to 2 minutes).
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center py-8 gap-3">
        <p className="text-sm text-red-400">Failed to load recording. Check your PostHog API key.</p>
        <button onClick={load} className="text-xs text-[#f37021] underline">Retry</button>
      </div>
    );
  }

  // ── Ready state ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* Meta bar */}
      {meta && (
        <div className="flex flex-wrap items-center gap-4 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8b949e]">Duration</span>
            <span className="text-sm font-bold text-white">{formatDuration(meta.duration)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8b949e]">Clicks</span>
            <span className="text-sm font-bold text-white">{meta.clickCount ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8b949e]">Views</span>
            <span className="text-sm font-bold text-white">{meta.viewCount ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8b949e]">Recorded</span>
            <span className="text-sm font-bold text-white">{new Date(meta.startTime).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Player shell */}
      <div className="relative rounded-xl border border-[#30363d] bg-[#0d1117] overflow-hidden">
        {/* Browser chrome mock */}
        <div className="flex items-center gap-2 border-b border-[#30363d] bg-[#161b22] px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-500/60" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
          <span className="h-3 w-3 rounded-full bg-green-500/60" />
          <div className="mx-3 flex-1 rounded bg-[#0d1117] px-3 py-1 text-[11px] text-[#8b949e] font-mono">
            hcmg-web.vercel.app
          </div>
        </div>

        {/* rrweb render target */}
        <div
          ref={playerRef}
          className="relative w-full bg-white"
          style={{ minHeight: 480, maxHeight: 600, overflow: "hidden" }}
        />

        {/* Play overlay when not started */}
        {!replayerRef.current && (
          <div
            className="absolute inset-0 top-10 flex items-center justify-center bg-[#0d1117]/80 cursor-pointer"
            onClick={startReplay}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f37021] shadow-lg transition hover:scale-105">
                <span className="ml-1 text-2xl text-white">▶</span>
              </div>
              <p className="text-sm font-semibold text-white">Play Recording</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {replayerRef.current && (
        <div className="flex items-center gap-3">
          <button
            onClick={pauseResume}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#f37021] text-white transition hover:opacity-90"
          >
            {playing ? "⏸" : "▶"}
          </button>
          {/* Scrub bar */}
          <div className="relative flex-1 h-2 rounded-full bg-[#30363d] cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seek(((e.clientX - rect.left) / rect.width) * 100);
            }}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: "var(--ok-gradient)" }}
            />
          </div>
          <span className="flex-shrink-0 text-[11px] font-mono text-[#8b949e]">
            {formatDuration((progress / 100) * (meta?.duration ?? 0))} / {formatDuration(meta?.duration ?? 0)}
          </span>
        </div>
      )}
    </div>
  );
}
