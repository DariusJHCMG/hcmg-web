"use client";

import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// IntroVideoSettings
//
// Admin panel card that lets admins set the intro video storage path.
// The path should be:
//   • A path in the `uni-media` Supabase storage bucket  (e.g. "intro/ceo-welcome.mp4")
//   • OR a full HTTPS URL (e.g. HeyGen share link, Vimeo, etc.)
// ─────────────────────────────────────────────────────────────────────────────

export function IntroVideoSettings() {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [inputValue,  setInputValue]  = useState<string>("");
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/university/admin/settings")
      .then(r => r.json())
      .then(data => {
        const row = (data.settings ?? []).find((s: { key: string; value: string | null }) => s.key === "intro_video_path");
        const val = row?.value ?? "";
        setCurrentPath(val);
        setInputValue(val);
      })
      .catch(() => setError("Could not load settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/university/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "intro_video_path", value: inputValue.trim() || null }),
      });
      if (!res.ok) throw new Error("Save failed");
      setCurrentPath(inputValue.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Could not save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const isDirty = inputValue.trim() !== currentPath;

  return (
    <div style={{
      border: "1.5px solid #dfe4e8", borderRadius: 12,
      background: "#fff", marginBottom: 32,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid #dfe4e8",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        {/* Video icon */}
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: "rgba(245,130,32,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f58220" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#071a2e" }}>Intro Video</div>
          <div style={{ fontSize: 12, color: "#687383" }}>
            CEO welcome video shown to every member on first login
          </div>
        </div>
        {/* Status pill */}
        <div style={{ marginLeft: "auto" }}>
          {currentPath ? (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 8,
              background: "rgba(34,197,94,0.12)", color: "#16a34a",
            }}>● Active</span>
          ) : (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 8,
              background: "rgba(245,130,32,0.12)", color: "#f58220",
            }}>○ Not set</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px" }}>
        {loading ? (
          <div style={{ fontSize: 13, color: "#687383" }}>Loading…</div>
        ) : (
          <>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#142234", marginBottom: 6 }}>
              Video path or URL
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); setSaved(false); }}
                placeholder="intro/ceo-welcome.mp4  or  https://…"
                style={{
                  flex: 1, padding: "9px 12px", borderRadius: 8,
                  border: "1.5px solid #dfe4e8",
                  fontSize: 13, color: "#071a2e",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
                style={{
                  padding: "9px 18px", borderRadius: 8, border: "none",
                  background: isDirty
                    ? "linear-gradient(135deg,#FF9847,#F37021)"
                    : "#e2e8f0",
                  color: isDirty ? "#fff" : "#9ca3af",
                  fontSize: 13, fontWeight: 700,
                  cursor: isDirty ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                {saving ? "Saving…" : saved ? "✓ Saved" : "Save"}
              </button>
            </div>
            <p style={{ fontSize: 11, color: "#687383", marginTop: 7, lineHeight: 1.6 }}>
              Enter a path inside the <strong>uni-media</strong> Supabase storage bucket (e.g.{" "}
              <code style={{ background: "#f0f2f5", padding: "1px 5px", borderRadius: 4, fontSize: 10 }}>intro/ceo-welcome.mp4</code>),
              or paste a full HTTPS video URL. Leave blank to disable the intro modal.
            </p>
            {error && (
              <div style={{
                marginTop: 8, padding: "8px 12px", borderRadius: 8,
                background: "rgba(185,28,28,0.06)", border: "1.5px solid rgba(185,28,28,0.2)",
                fontSize: 12, color: "#b91c1c",
              }}>
                ⚠ {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
