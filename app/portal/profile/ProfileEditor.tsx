"use client";

import { useState, useRef } from "react";
import type { Profile } from "@/lib/database.types";

// ── Default copy auto-filled for every new user ───────────────────
const DEFAULT_HERO_BIO =
  "I'm a licensed mortgage professional at Harris Capital Mortgage Group. I help clients find the right loan program — whether you're buying your first home, moving up, or refinancing. No call centers, no runarounds. Just honest guidance and the best rate I can find you.";

const DEFAULT_ABOUT_HEADLINE =
  "A licensed mortgage professional who puts clients first.";

const DEFAULT_LONG_BIO = [
  "I'm a licensed mortgage loan originator at Harris Capital Mortgage Group (HCMG), serving clients across multiple states with purchase loans, refinances, FHA, VA, and more.",
  "At HCMG we have access to dozens of lenders and hundreds of loan programs — which means I shop the market to find the deal that actually fits your situation, not just whatever one bank happens to offer.",
  "A fuller biography is on the way. In the meantime, start the estimate flow on this page or reach out directly — your file comes straight to me.",
];

const DEFAULT_SPECIALTIES = [
  "Purchase Loans", "Refinance", "FHA / VA", "First-Time Buyers",
];

interface Props { profile: Profile; }

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const init = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);
  return <>{init.toUpperCase()}</>;
}

export function ProfileEditor({ profile }: Props) {
  const [fullName,      setFullName]      = useState(profile.full_name ?? "");
  const [phone,         setPhone]         = useState(profile.phone ?? "");
  const [notifyEmail,   setNotifyEmail]   = useState(profile.notify_email ?? "");
  const [linkedin,      setLinkedin]      = useState(profile.linkedin ?? "");
  const [shortBio,      setShortBio]      = useState(profile.short_bio ?? "");
  const [avatarUrl,     setAvatarUrl]     = useState(profile.avatar_url ?? "");
  // New page content fields — fall back to defaults if not yet set
  const [heroBio,       setHeroBio]       = useState(profile.hero_bio       ?? DEFAULT_HERO_BIO);
  const [aboutHeadline, setAboutHeadline] = useState(profile.about_headline ?? DEFAULT_ABOUT_HEADLINE);
  const [longBioRaw,    setLongBioRaw]    = useState(
    (profile.long_bio ?? DEFAULT_LONG_BIO).join("\n\n")
  );
  const [yearsExp,      setYearsExp]      = useState<string>(
    profile.years_experience != null ? String(profile.years_experience) : ""
  );
  const [specialtiesRaw, setSpecialtiesRaw] = useState(
    (profile.specialties ?? DEFAULT_SPECIALTIES).join(", ")
  );

  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [banner,     setBanner]     = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setBanner({ type: "error", msg: "Photo must be under 2 MB." }); return; }
    setUploading(true); setBanner(null);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/portal/profile/avatar", { method: "POST", body: form });
    if (res.ok) { const { url } = await res.json(); setAvatarUrl(url); setBanner({ type: "success", msg: "Photo updated." }); }
    else { const { error } = await res.json().catch(() => ({ error: "Upload failed." })); setBanner({ type: "error", msg: error ?? "Upload failed." }); }
    setUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setBanner(null);

    // Parse long_bio: split on blank lines
    const longBioParsed = longBioRaw
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    // Parse specialties: comma-separated
    const specialtiesParsed = specialtiesRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch("/api/portal/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name:        fullName.trim()       || null,
        phone:            phone.trim()          || null,
        notify_email:     notifyEmail.trim()    || null,
        linkedin:         linkedin.trim()       || null,
        short_bio:        shortBio.trim()       || null,
        avatar_url:       avatarUrl             || null,
        hero_bio:         heroBio.trim()        || null,
        about_headline:   aboutHeadline.trim()  || null,
        long_bio:         longBioParsed.length  ? longBioParsed : null,
        years_experience: yearsExp ? parseInt(yearsExp, 10) : null,
        specialties:      specialtiesParsed.length ? specialtiesParsed : null,
      }),
    });

    if (res.ok) setBanner({ type: "success", msg: "Profile saved." });
    else { const { error } = await res.json().catch(() => ({ error: "Save failed." })); setBanner({ type: "error", msg: error ?? "Save failed." }); }
    setSaving(false);
  }

  const IC = "input-base w-full";

  return (
    <form onSubmit={handleSave} className="space-y-8">

      {/* Status banner */}
      {banner && (
        <div className={`flex items-center justify-between rounded-xl px-5 py-3 text-sm font-semibold ${
          banner.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {banner.msg}
          <button type="button" onClick={() => setBanner(null)} className="ml-4 text-inherit opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* ── Avatar ── */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="mb-5 text-sm font-black uppercase tracking-[0.16em] text-muted">Photo</h2>
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="h-24 w-24 rounded-2xl object-cover object-top border border-line shadow-soft" />
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
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink shadow-soft transition-all hover:border-accent hover:text-accent disabled:opacity-50">
              {uploading ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            <p className="mt-2 text-xs text-muted">JPG, PNG or WebP · max 2 MB</p>
            {avatarUrl && (
              <button type="button" onClick={() => setAvatarUrl("")} className="mt-1 text-xs font-semibold text-red-500 hover:text-red-700">Remove photo</button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      {/* ── Basic info ── */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="mb-5 text-sm font-black uppercase tracking-[0.16em] text-muted">Basic Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" required>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Your full name" className={IC} />
          </Field>
          <Field label="Title / Role">
            <input type="text" value={profile.title ?? "—"} readOnly className={IC + " cursor-not-allowed opacity-60"} />
            <p className="mt-1 text-[11px] text-muted">Contact admin to update your title</p>
          </Field>
          <Field label="Phone">
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(702) 555-0100" className={IC} />
          </Field>
          <Field label="Notification Email">
            <input type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} placeholder="you@hcmgloans.com" className={IC} />
            <p className="mt-1 text-[11px] text-muted">Lead alerts are sent here</p>
          </Field>
          <Field label="LinkedIn URL">
            <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourname" className={IC} />
          </Field>
          <Field label="Years of Experience">
            <input type="number" min={0} max={50} value={yearsExp} onChange={(e) => setYearsExp(e.target.value)}
              placeholder="e.g. 8" className={IC} />
            <p className="mt-1 text-[11px] text-muted">Shown in your Quick Facts</p>
          </Field>
          <Field label="NMLS#">
            <input type="text" value={profile.nmls ?? "—"} readOnly className={IC + " cursor-not-allowed opacity-60"} />
            <p className="mt-1 text-[11px] text-muted">Contact admin to update NMLS#</p>
          </Field>
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft space-y-6">
        <div>
          <h2 className="mb-1 text-sm font-black uppercase tracking-[0.16em] text-muted">Your Profile Page Content</h2>
          <p className="text-xs text-muted">
            This copy appears on your personal team page. Defaults are pre-filled — edit them to make it your own.
          </p>
        </div>

        {/* Short bio (card / find-a-loan-officer) */}
        <Field label="Short Bio" hint="2–3 sentences. Shown in search results and the team page card.">
          <textarea value={shortBio} onChange={(e) => setShortBio(e.target.value)}
            rows={3} maxLength={500} placeholder="Tell clients a bit about yourself…" className={IC + " resize-none"} />
          <p className="mt-1 text-right text-[11px] text-muted">{shortBio.length}/500</p>
        </Field>

        {/* Hero bio */}
        <Field label="Hero Intro" hint="2 short paragraphs shown in the hero section of your page. First-person tone works best.">
          <textarea value={heroBio} onChange={(e) => setHeroBio(e.target.value)}
            rows={4} maxLength={600} className={IC + " resize-none"} />
          <p className="mt-1 text-right text-[11px] text-muted">{heroBio.length}/600</p>
        </Field>

        {/* About headline */}
        <Field label="About Section Headline" hint="One sentence. Shown as the heading of your About section.">
          <input type="text" value={aboutHeadline} onChange={(e) => setAboutHeadline(e.target.value)}
            maxLength={120} placeholder="A lender who believes…" className={IC} />
        </Field>

        {/* Long bio */}
        <Field label="Full Bio" hint="Separate paragraphs with a blank line. Shown in your About section.">
          <textarea value={longBioRaw} onChange={(e) => setLongBioRaw(e.target.value)}
            rows={8} className={IC + " resize-y font-mono text-sm"} />
          <p className="mt-1 text-[11px] text-muted">Separate paragraphs with a blank line between them.</p>
        </Field>

        {/* Specialties */}
        <Field label="Specialties" hint="Comma-separated. Shown as tags on your page.">
          <input type="text" value={specialtiesRaw} onChange={(e) => setSpecialtiesRaw(e.target.value)}
            placeholder="Purchase Loans, Refinance, FHA / VA, First-Time Buyers" className={IC} />
          <p className="mt-1 text-[11px] text-muted">e.g. Purchase Loans, Refinance, FHA / VA, Jumbo</p>
        </Field>
      </div>

      {/* ── Save ── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white px-6 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">Changes appear on your profile page immediately after saving.</p>
        <button type="submit" disabled={saving}
          className="w-full rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
          style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>

    </form>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-muted">
        {label}{required && <span className="ml-0.5 text-accent">*</span>}
      </label>
      {hint && <p className="mb-2 text-[11px] text-muted/70">{hint}</p>}
      {children}
    </div>
  );
}
