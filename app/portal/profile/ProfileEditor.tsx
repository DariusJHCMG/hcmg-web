"use client";

import { useState, useRef } from "react";
import type { Profile } from "@/lib/database.types";

interface Props {
  profile: Profile;
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const init = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);
  return <>{init.toUpperCase()}</>;
}

export function ProfileEditor({ profile }: Props) {
  const [fullName,     setFullName]     = useState(profile.full_name ?? "");
  const [phone,        setPhone]        = useState(profile.phone ?? "");
  const [notifyEmail,  setNotifyEmail]  = useState(profile.notify_email ?? "");
  const [linkedin,     setLinkedin]     = useState(profile.linkedin ?? "");
  const [shortBio,     setShortBio]     = useState(profile.short_bio ?? "");
  const [avatarUrl,    setAvatarUrl]    = useState(profile.avatar_url ?? "");

  const [saving,       setSaving]       = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [banner,       setBanner]       = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  // ── Avatar upload ──────────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size guard: 2 MB max
    if (file.size > 2 * 1024 * 1024) {
      setBanner({ type: "error", msg: "Photo must be under 2 MB." });
      return;
    }

    setUploading(true);
    setBanner(null);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/portal/profile/avatar", {
      method: "POST",
      body: form,
    });

    if (res.ok) {
      const { url } = await res.json();
      setAvatarUrl(url);
      setBanner({ type: "success", msg: "Photo updated." });
    } else {
      const { error } = await res.json().catch(() => ({ error: "Upload failed." }));
      setBanner({ type: "error", msg: error ?? "Upload failed." });
    }

    setUploading(false);
  }

  // ── Save profile fields ────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setBanner(null);

    const res = await fetch("/api/portal/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name:    fullName.trim()    || null,
        phone:        phone.trim()       || null,
        notify_email: notifyEmail.trim() || null,
        linkedin:     linkedin.trim()    || null,
        short_bio:    shortBio.trim()    || null,
        avatar_url:   avatarUrl          || null,
      }),
    });

    if (res.ok) {
      setBanner({ type: "success", msg: "Profile saved." });
    } else {
      const { error } = await res.json().catch(() => ({ error: "Save failed." }));
      setBanner({ type: "error", msg: error ?? "Save failed." });
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">

      {/* Status banner */}
      {banner && (
        <div className={`flex items-center justify-between rounded-xl px-5 py-3 text-sm font-semibold
          ${banner.type === "success"
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
          }`}>
          {banner.msg}
          <button type="button" onClick={() => setBanner(null)} className="ml-4 text-inherit opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* ── Avatar ── */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="mb-5 text-sm font-black uppercase tracking-[0.16em] text-muted">Photo</h2>
        <div className="flex items-center gap-6">
          {/* Preview */}
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="h-24 w-24 rounded-2xl object-cover object-top border border-line shadow-soft"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-line text-3xl font-black text-white shadow-soft"
                   style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
                <Initials name={fullName || "?"} />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80">
                <span className="text-xs font-bold text-accent">Uploading…</span>
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink
                         shadow-soft transition-all hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {uploading ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            <p className="mt-2 text-xs text-muted">JPG, PNG or WebP · max 2 MB</p>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl("")}
                className="mt-1 text-xs font-semibold text-red-500 hover:text-red-700"
              >
                Remove photo
              </button>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <p className="mt-4 rounded-lg bg-sand px-4 py-3 text-xs text-muted">
          <span className="font-bold text-ink">Note:</span> your photo is used in the portal and on your
          personal funnel page — but <span className="font-semibold">not</span> on the public Team page
          (that page shows initials only).
        </p>
      </div>

      {/* ── Basic info ── */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="mb-5 text-sm font-black uppercase tracking-[0.16em] text-muted">Basic Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" required>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Your full name"
              className="input-base"
            />
          </Field>
          <Field label="Title / Role">
            <input
              type="text"
              value={profile.title ?? "—"}
              readOnly
              className="input-base cursor-not-allowed opacity-60"
            />
            <p className="mt-1 text-[11px] text-muted">Contact admin to update your title</p>
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(702) 555-0100"
              className="input-base"
            />
          </Field>
          <Field label="Notification Email">
            <input
              type="email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="you@hcmgloans.com"
              className="input-base"
            />
            <p className="mt-1 text-[11px] text-muted">Lead alerts are sent here</p>
          </Field>
          <Field label="LinkedIn URL">
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/yourname"
              className="input-base"
            />
          </Field>
          {/* Read-only fields */}
          <Field label="NMLS#">
            <input
              type="text"
              value={profile.nmls ?? "—"}
              readOnly
              className="input-base cursor-not-allowed opacity-60"
            />
            <p className="mt-1 text-[11px] text-muted">Contact admin to update NMLS#</p>
          </Field>
        </div>
      </div>

      {/* ── Bio ── */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="mb-1 text-sm font-black uppercase tracking-[0.16em] text-muted">Short Bio</h2>
        <p className="mb-4 text-xs text-muted">
          Shown on your personal funnel page and in the Find a Loan Officer results.
          Keep it to 2–3 sentences.
        </p>
        <textarea
          value={shortBio}
          onChange={(e) => setShortBio(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Tell clients a bit about yourself and your approach to lending…"
          className="input-base w-full resize-none"
        />
        <p className="mt-1 text-right text-[11px] text-muted">{shortBio.length}/500</p>
      </div>

      {/* ── Save ── */}
      <div className="flex items-center justify-between rounded-2xl border border-line bg-white px-6 py-4 shadow-soft">
        <p className="text-xs text-muted">Changes are reflected immediately across the portal.</p>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>

    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-muted">
        {label}{required && <span className="ml-0.5 text-accent">*</span>}
      </label>
      {children}
    </div>
  );
}
