"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { TeamVideo } from "@/data/team-videos";

/**
 * Renders a grid of team-video cards. Each card shows a poster + speaker +
 * title. Click → swap the poster for an inline embed iframe (YouTube/Vimeo)
 * or a native <video> element (direct MP4 URLs).
 *
 * Videos without a `videoUrl` render a "Coming soon" placeholder so the
 * section can ship empty and fill in person-by-person without page changes.
 */
export function TeamVideos({ videos }: { videos: TeamVideo[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {videos.map((v) => (
        <VideoCard key={v.slug} video={v} />
      ))}
    </div>
  );
}

function VideoCard({ video }: { video: TeamVideo }) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = video.videoUrl ? normalizeVideoUrl(video.videoUrl) : null;
  const isMp4 = embedUrl ? /\.(mp4|webm|ogv)(\?|$)/i.test(embedUrl) : false;
  const poster = video.videoUrl ? getPosterUrl(video.videoUrl) : null;

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
      {/* Player area */}
      {playing && embedUrl ? (
        <div className="relative aspect-video w-full bg-black">
          {isMp4 ? (
            <video
              src={embedUrl}
              controls
              autoPlay
              className="absolute inset-0 h-full w-full"
              aria-label={`${video.speaker}: ${video.title}`}
            />
          ) : (
            <iframe
              src={`${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
              title={`${video.speaker}: ${video.title}`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => embedUrl && setPlaying(true)}
          disabled={!embedUrl}
          aria-label={
            embedUrl
              ? `Play video: ${video.speaker} on ${video.title}`
              : `${video.speaker}'s video coming soon`
          }
          className={`group relative block aspect-video w-full overflow-hidden bg-brand ${
            embedUrl ? "cursor-pointer" : "cursor-default"
          }`}
        >
          {/* Poster — YouTube auto-thumbnail when available; otherwise initials over gradient */}
          {poster ? (
            <img
              src={poster}
              alt={`${video.speaker} portrait`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <PlaceholderPoster speaker={video.speaker} />
          )}

          {/* Dim overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent"
            aria-hidden
          />

          {/* Play button or "Coming soon" badge */}
          {embedUrl ? (
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

          {/* Speaker label, bottom-left */}
          <div className="absolute bottom-3 left-4 right-4 text-left text-white">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
              {video.speaker}
            </div>
            <div className="mt-0.5 text-base font-bold leading-tight drop-shadow sm:text-lg">
              {video.title}
            </div>
          </div>
        </button>
      )}

      {/* Body copy */}
      <div className="p-5 sm:p-6">
        <p className="text-sm leading-7 text-muted">{video.description}</p>
      </div>
    </div>
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

  // YouTube watch link
  const ytWatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([\w-]+)/);
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`;

  // Vimeo numeric ID
  const vimeo = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  // Anything else (MP4, custom embed URL, etc.)
  return trimmed;
}

function getPosterUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  return null;
}
