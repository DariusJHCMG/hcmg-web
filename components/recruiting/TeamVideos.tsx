"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import type { TeamVideo } from "@/data/team-videos";

/**
 * Renders a grid of team-video cards. Each card shows a poster + speaker +
 * title. Click → play inline.
 *
 * YouTube videos use the auto-thumbnail as the poster.
 * Self-hosted MP4s use the native <video> element with `preload="metadata"`
 * and a `#t=0.5` URL hint so the browser seeks to a frame and renders it
 * as a static preview (no separate poster image files required).
 */
export function TeamVideos({ videos }: { videos: TeamVideo[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {videos.map((v) => (
        <VideoCard key={v.slug} video={v} />
      ))}
    </div>
  );
}

function aspectClass(aspect: TeamVideo["aspect"]): string {
  switch (aspect) {
    case "landscape":
      return "aspect-video";
    case "square":
      return "aspect-square";
    case "portrait":
    default:
      return "aspect-[9/16]";
  }
}

function VideoCard({ video }: { video: TeamVideo }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const embedUrl = video.videoUrl ? normalizeVideoUrl(video.videoUrl) : null;
  const isMp4 = embedUrl ? /\.(mp4|webm|ogv)(\?|$)/i.test(embedUrl) : false;
  const ytPoster = video.videoUrl ? getPosterUrl(video.videoUrl) : null;
  const aspect = aspectClass(video.aspect);

  function handleMp4Play() {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        /* autoplay block — controls are visible, user can press play */
      });
    }
    setPlaying(true);
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
      {isMp4 && embedUrl ? (
        // ── MP4 path: <video> always rendered so first frame previews ──
        <div className={`group relative w-full bg-black ${aspect}`}>
          <video
            ref={videoRef}
            src={`${embedUrl}#t=0.5`}
            controls={playing}
            preload="metadata"
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            onPlay={() => setPlaying(true)}
            onEnded={() => setPlaying(false)}
            aria-label={`${video.speaker}: ${video.title}`}
          />
          {!playing && (
            <button
              type="button"
              onClick={handleMp4Play}
              className="absolute inset-0"
              aria-label={`Play video: ${video.speaker} on ${video.title}`}
            >
              <CardOverlay speaker={video.speaker} title={video.title} hasVideo />
            </button>
          )}
        </div>
      ) : playing && embedUrl ? (
        // ── YouTube/Vimeo iframe playing state ──
        <div className={`relative w-full bg-black ${aspect}`}>
          <iframe
            src={`${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
            title={`${video.speaker}: ${video.title}`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        // ── YouTube poster OR no-video placeholder ──
        <button
          type="button"
          onClick={() => embedUrl && setPlaying(true)}
          disabled={!embedUrl}
          aria-label={
            embedUrl
              ? `Play video: ${video.speaker} on ${video.title}`
              : `${video.speaker}'s video coming soon`
          }
          className={`group relative block w-full overflow-hidden bg-brand ${aspect} ${
            embedUrl ? "cursor-pointer" : "cursor-default"
          }`}
        >
          {ytPoster ? (
            <img
              src={ytPoster}
              alt={`${video.speaker} portrait`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <PlaceholderPoster speaker={video.speaker} />
          )}
          <CardOverlay
            speaker={video.speaker}
            title={video.title}
            hasVideo={Boolean(embedUrl)}
          />
        </button>
      )}

      {/* Body copy */}
      <div className="p-5 sm:p-6">
        <p className="text-sm leading-7 text-muted">{video.description}</p>
      </div>
    </div>
  );
}

function CardOverlay({
  speaker,
  title,
  hasVideo,
}: {
  speaker: string;
  title: string;
  hasVideo: boolean;
}) {
  return (
    <>
      {/* Dim gradient so the speaker label is readable on any frame */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent"
        aria-hidden
      />
      {hasVideo ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-accent transition-transform duration-300 group-hover:scale-110">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink">
          Coming soon
        </div>
      )}
      <div className="absolute bottom-3 left-4 right-4 text-left text-white">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
          {speaker}
        </div>
        <div className="mt-0.5 text-base font-bold leading-tight drop-shadow sm:text-lg">{title}</div>
      </div>
    </>
  );
}

function PlaceholderPoster({ speaker }: { speaker: string }) {
  const initials = speaker
    .replace(/['"()]/g, "")
    .replace(/\s+(Sr\.?|Jr\.?|II|III|IV)$/i, "")
    .split(/\s+/)
    .filter((w) => /[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-brand">
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, rgba(243,112,33,0.55) 0%, transparent 55%)",
        }}
      />
      <span
        className="relative font-extrabold text-white"
        style={{ fontSize: "clamp(48px, 9vw, 96px)", letterSpacing: 1 }}
      >
        {initials || "HCMG"}
      </span>
      <span aria-hidden className="absolute left-3 top-3 h-3 w-3" style={{ background: "#F37021" }} />
    </div>
  );
}

// ── URL helpers ────────────────────────────────────────────────────

function normalizeVideoUrl(url: string): string {
  const trimmed = url.trim();

  const ytWatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([\w-]+)/);
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`;

  const vimeo = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return trimmed;
}

function getPosterUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  return null;
}
