"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { STUDIO_COLORS, StudioButton, StudioInput } from "./StudioPrimitives";
import type { MediaType, UniMediaAsset } from "@/lib/database.types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(secs: number | null): string {
  if (!secs) return "";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const MEDIA_TYPE_ICONS: Record<MediaType | "all", React.ReactNode> = {
  all: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  video: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10,9 16,12 10,15" fill="currentColor" stroke="none"/>
    </svg>
  ),
  image: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
    </svg>
  ),
  audio: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
  ),
  document: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
    </svg>
  ),
  presentation: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  caption: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
};

const MEDIA_TYPES: { value: MediaType | "all"; label: string }[] = [
  { value: "all",          label: "All Media" },
  { value: "video",        label: "Videos" },
  { value: "image",        label: "Images" },
  { value: "audio",        label: "Audio" },
  { value: "document",     label: "Documents" },
  { value: "presentation", label: "Presentations" },
  { value: "caption",      label: "Captions" },
];

const MIME_MAP: Record<MediaType, string> = {
  video:        "video/mp4,video/webm,video/quicktime",
  image:        "image/jpeg,image/png,image/gif,image/webp",
  audio:        "audio/mpeg,audio/mp4,audio/wav",
  document:     "application/pdf",
  presentation: "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
  caption:      "text/vtt,text/plain",
};

const S = STUDIO_COLORS;

function AssetIcon({ type }: { type: MediaType }) {
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 8, flexShrink: 0,
      background: "rgba(245,130,32,0.08)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#f58220",
    }}>
      {MEDIA_TYPE_ICONS[type] ?? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
      )}
    </div>
  );
}

// ── Upload progress bar ───────────────────────────────────────────────────────

interface UploadItem {
  id: string;
  name: string;
  progress: number; // 0–100
  error: string | null;
  done: boolean;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface MediaLibraryProps {
  /** If provided, renders as a picker modal with this filter pre-selected */
  pickMode?: MediaType;
  /** Called when user selects an asset in pick mode */
  onPick?: (asset: UniMediaAsset) => void;
  /** Called to dismiss picker */
  onClose?: () => void;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MediaLibrary({ pickMode, onPick, onClose }: MediaLibraryProps) {
  const [activeType, setActiveType] = useState<MediaType | "all">(pickMode ?? "all");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [assets, setAssets]         = useState<UniMediaAsset[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [uploads, setUploads]       = useState<UploadItem[]>([]);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editName, setEditName]     = useState("");
  const fileRef                     = useRef<HTMLInputElement>(null);
  const searchTimer                 = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (t: MediaType | "all", q: string, pg: number) => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(pg) });
      if (t !== "all") params.set("type", t);
      if (q.trim()) params.set("search", q.trim());
      const res = await fetch(`/api/university/admin/media?${params}`);
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to load media"); return; }
      setAssets(json.assets);
      setTotal(json.total);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeType, search, page); }, [activeType, page, load]);

  // Debounce search
  function onSearchChange(val: string) {
    setSearch(val);
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(activeType, val, 1), 350);
  }

  function handleTabChange(t: MediaType | "all") {
    setActiveType(t); setPage(1); setSearch("");
    load(t, "", 1);
  }

  // ── Upload flow ─────────────────────────────────────────────────────────────

  function detectMediaType(file: File): MediaType {
    const m = file.type;
    if (m.startsWith("video/")) return "video";
    if (m.startsWith("image/")) return "image";
    if (m.startsWith("audio/")) return "audio";
    if (m === "application/pdf") return "document";
    if (m.includes("powerpoint") || m.includes("presentationml")) return "presentation";
    if (m === "text/vtt" || m === "text/plain") return "caption";
    return "document";
  }

  async function uploadFile(file: File) {
    const uid    = crypto.randomUUID();
    const media_type = detectMediaType(file);

    setUploads(u => [...u, { id: uid, name: file.name, progress: 0, error: null, done: false }]);

    const setProgress = (p: number) =>
      setUploads(u => u.map(x => x.id === uid ? { ...x, progress: p } : x));
    const setUploadError = (e: string) =>
      setUploads(u => u.map(x => x.id === uid ? { ...x, error: e } : x));
    const setDone = () =>
      setUploads(u => u.map(x => x.id === uid ? { ...x, done: true, progress: 100 } : x));

    try {
      // 1. Get signed upload URL
      const urlRes = await fetch("/api/university/admin/media/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, media_type }),
      });
      const urlJson = await urlRes.json();
      if (!urlRes.ok) { setUploadError(urlJson.error ?? "Upload failed"); return; }

      const { upload_url, storage_path } = urlJson;

      // 2. Upload via XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", e => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 95));
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`HTTP ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.open("PUT", upload_url);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });

      setProgress(97);

      // 3. Register asset in DB
      const regRes = await fetch("/api/university/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:         file.name.replace(/\.[^.]+$/, ""),
          media_type,
          storage_path,
          mime_type:  file.type || null,
          file_size:  file.size || null,
        }),
      });
      const regJson = await regRes.json();
      if (!regRes.ok) { setUploadError(regJson.error ?? "Registration failed"); return; }

      setDone();
      // Refresh library
      load(activeType, search, 1);
      setPage(1);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(f => uploadFile(f));
  }

  // ── Drag and drop ───────────────────────────────────────────────────────────

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  // ── Rename ──────────────────────────────────────────────────────────────────

  async function saveRename(assetId: string) {
    if (!editName.trim()) return;
    await fetch(`/api/university/admin/media/${assetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditingId(null);
    load(activeType, search, page);
  }

  // ── Archive ─────────────────────────────────────────────────────────────────

  async function archiveAsset(assetId: string) {
    if (!confirm("Archive this asset? It will be hidden from the library.")) return;
    await fetch(`/api/university/admin/media/${assetId}`, { method: "DELETE" });
    load(activeType, search, page);
  }

  // ── Pagination ──────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(total / 40);

  // ── Layout ──────────────────────────────────────────────────────────────────

  const isModal = !!pickMode;

  return (
    <div style={{
      fontFamily: "-apple-system, 'Segoe UI', system-ui, sans-serif",
      background: S.white, minHeight: isModal ? "auto" : "100vh",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${S.border}`,
        padding: "20px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: S.text }}>
            {isModal ? `Select ${pickMode ? MEDIA_TYPES.find(t => t.value === pickMode)?.label ?? "Media" : "Media"}` : "Media Library"}
          </h1>
          {!isModal && (
            <p style={{ margin: "2px 0 0", fontSize: 13, color: S.textMuted }}>
              Upload and manage training media assets
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {onClose && (
            <StudioButton variant="ghost" size="sm" onClick={onClose}>✕ Close</StudioButton>
          )}
          {!isModal && (
            <StudioButton variant="primary" size="sm" onClick={() => fileRef.current?.click()}>
              ↑ Upload Media
            </StudioButton>
          )}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={activeType !== "all" ? MIME_MAP[activeType as MediaType] : undefined}
            style={{ display: "none" }}
            onChange={e => handleFiles(e.target.files)}
          />
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Left sidebar — type filter */}
        <div style={{
          width: 180, flexShrink: 0, borderRight: `1px solid ${S.border}`,
          padding: "16px 0",
        }}>
          {MEDIA_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => handleTabChange(t.value)}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                width: "100%", padding: "9px 18px", border: "none",
                background: activeType === t.value ? "rgba(245,130,32,0.08)" : "transparent",
                color: activeType === t.value ? S.orange : S.text,
                fontWeight: activeType === t.value ? 700 : 400,
                fontSize: 13, cursor: "pointer", textAlign: "left",
                borderRight: activeType === t.value ? `2px solid ${S.orange}` : "2px solid transparent",
              }}
            >
              <span style={{ display: "flex", alignItems: "center" }}>{MEDIA_TYPE_ICONS[t.value]}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
          {/* Search + upload button in modal */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <StudioInput
                placeholder="Search media..."
                value={search}
                onChange={e => onSearchChange(e.target.value)}
              />
            </div>
            {isModal && (
              <StudioButton variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                ↑ Upload
              </StudioButton>
            )}
          </div>

          {/* Upload drop zone (always visible) */}
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            style={{
              border: `2px dashed ${S.border}`, borderRadius: 10,
              padding: "20px 24px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 16,
              background: S.surface, cursor: "pointer",
            }}
            onClick={() => fileRef.current?.click()}
          >
            <div style={{ color: S.textMuted, display: "flex", alignItems: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: S.text }}>
                Drop files here or click to upload
              </div>
              <div style={{ fontSize: 12, color: S.textMuted, marginTop: 2 }}>
                Videos, images, audio, documents, presentations, captions (VTT)
              </div>
            </div>
          </div>

          {/* Upload progress */}
          {uploads.filter(u => !u.done).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              {uploads.filter(u => !u.done).map(u => (
                <div key={u.id} style={{
                  background: S.surface, border: `1px solid ${S.border}`,
                  borderRadius: 8, padding: "10px 14px", marginBottom: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: S.text, fontWeight: 500 }}>{u.name}</span>
                    <span style={{ fontSize: 12, color: u.error ? S.red : S.textMuted }}>
                      {u.error ?? `${u.progress}%`}
                    </span>
                  </div>
                  {!u.error && (
                    <div style={{ height: 4, background: S.border, borderRadius: 2 }}>
                      <div style={{
                        height: 4, borderRadius: 2,
                        width: `${u.progress}%`,
                        background: S.orange,
                        transition: "width 0.2s",
                      }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(248,113,113,0.1)", border: `1px solid rgba(248,113,113,0.3)`,
              borderRadius: 8, padding: "10px 14px", marginBottom: 16,
              fontSize: 13, color: S.redDark,
            }}>
              {error}
            </div>
          )}

          {/* Asset count */}
          {!loading && (
            <div style={{ fontSize: 12, color: S.textMuted, marginBottom: 12 }}>
              {total} asset{total !== 1 ? "s" : ""}
              {search && ` matching "${search}"`}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  height: 72, background: S.surface, borderRadius: 8,
                  border: `1px solid ${S.border}`, animation: "pulse 1.5s infinite",
                }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && assets.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: S.textMuted }}>
              <div style={{ marginBottom: 12, display: "flex", justifyContent: "center", opacity: 0.4 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: S.text, marginBottom: 6 }}>
                No media yet
              </div>
              <div style={{ fontSize: 13, marginBottom: 16 }}>
                {search ? `No results for "${search}"` : "Upload your first media asset to get started"}
              </div>
              {!search && (
                <StudioButton variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                  ↑ Upload Media
                </StudioButton>
              )}
            </div>
          )}

          {/* Asset grid */}
          {!loading && assets.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {assets.map(asset => (
                <div
                  key={asset.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: 8,
                    border: `1px solid transparent`,
                    cursor: isModal ? "pointer" : "default",
                    transition: "all 0.12s",
                    background: "transparent",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = S.surface)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  onClick={() => isModal && onPick?.(asset)}
                >
                  <AssetIcon type={asset.media_type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {editingId === asset.id ? (
                      <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") saveRename(asset.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                          style={{
                            flex: 1, fontSize: 13, padding: "3px 7px",
                            borderRadius: 5, border: `1.5px solid ${S.orange}`,
                            fontFamily: "inherit",
                          }}
                        />
                        <button
                          onClick={() => saveRename(asset.id)}
                          style={{
                            padding: "3px 10px", fontSize: 12, borderRadius: 5,
                            background: S.orange, color: S.white, border: "none",
                            cursor: "pointer", fontWeight: 600,
                          }}
                        >Save</button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            padding: "3px 10px", fontSize: 12, borderRadius: 5,
                            background: "transparent", color: S.textMuted,
                            border: `1px solid ${S.border}`, cursor: "pointer",
                          }}
                        >Cancel</button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, fontWeight: 600, color: S.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {asset.name}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: S.textMuted, textTransform: "capitalize" }}>
                        {asset.media_type}
                      </span>
                      {asset.file_size && (
                        <span style={{ fontSize: 11, color: S.textMuted }}>
                          {formatBytes(asset.file_size)}
                        </span>
                      )}
                      {asset.duration_secs && (
                        <span style={{ fontSize: 11, color: S.textMuted }}>
                          {formatDuration(asset.duration_secs)}
                        </span>
                      )}
                    </div>
                  </div>
                  {isModal && (
                    <StudioButton variant="secondary" size="sm" onClick={() => onPick?.(asset)}>
                      Select
                    </StudioButton>
                  )}
                  {!isModal && (
                    <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { setEditingId(asset.id); setEditName(asset.name); }}
                        title="Rename"
                        style={{
                          padding: "5px 10px", fontSize: 12, borderRadius: 6,
                          background: "transparent", border: `1px solid ${S.border}`,
                          cursor: "pointer", color: S.textMuted,
                        }}
                      >Rename</button>
                      <button
                        onClick={() => archiveAsset(asset.id)}
                        title="Archive"
                        style={{
                          padding: "5px 10px", fontSize: 12, borderRadius: 6,
                          background: "transparent", border: `1px solid ${S.border}`,
                          cursor: "pointer", color: S.red,
                        }}
                      >Archive</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
              <StudioButton
                variant="ghost" size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >← Prev</StudioButton>
              <span style={{ fontSize: 13, color: S.textMuted, alignSelf: "center" }}>
                Page {page} of {totalPages}
              </span>
              <StudioButton
                variant="ghost" size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >Next →</StudioButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MediaPicker modal ─────────────────────────────────────────────────────────

interface MediaPickerProps {
  mediaType: MediaType;
  onPick: (asset: UniMediaAsset) => void;
  onClose: () => void;
}

export function MediaPicker({ mediaType, onPick, onClose }: MediaPickerProps) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(6,24,42,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: S.white, borderRadius: 14,
        width: "min(900px, 100%)", height: "min(680px, 90vh)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
      }}>
        <MediaLibrary pickMode={mediaType} onPick={onPick} onClose={onClose} />
      </div>
    </div>
  );
}
