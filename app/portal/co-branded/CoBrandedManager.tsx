"use client";

import { useState, useEffect, useRef } from "react";

interface CoBrandedPage {
  id: string;
  lo_slug: string;
  realtor_slug: string;
  realtor_name: string;
  realtor_company: string;
  realtor_phone: string | null;
  realtor_email: string | null;
  realtor_license: string | null;
  realtor_photo_url: string | null;
  realtor_logo_url: string | null;
  headline: string | null;
  is_active: boolean;
  clicks: number;
  created_at: string;
}

const SITE = typeof window !== "undefined" ? window.location.origin : "https://getorangekey.com";

// ── Helpers ───────────────────────────────────────────────────────

function initials(name: string) {
  const w = name.trim().split(/\s+/);
  return (w[0]?.[0] ?? "") + (w[1]?.[0] ?? "");
}

function relDate(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d < 1) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Image upload helper ────────────────────────────────────────────

function useImageUpload(kind: "realtor-photo" | "realtor-logo") {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  async function upload(file: File): Promise<string | null> {
    setUploading(true); setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    const res = await fetch("/api/portal/co-branded/upload", { method: "POST", body: form });
    setUploading(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Upload failed"); return null; }
    const { url } = await res.json();
    return url;
  }

  return { uploading, error, ref, upload };
}

// ── Share modal ────────────────────────────────────────────────────

function ShareModal({ page, loSlug, onClose }: { page: CoBrandedPage; loSlug: string; onClose: () => void }) {
  const url = `${SITE}/co/${loSlug}/${page.realtor_slug}`;
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailErr, setEmailErr] = useState("");

  function copy() {
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  async function sendEmail() {
    if (!page.realtor_email) return;
    setSending(true); setEmailErr("");
    const res = await fetch(`/api/portal/co-branded/${page.id}/share`, { method: "POST" });
    setSending(false);
    if (res.ok) setSent(true);
    else { const d = await res.json().catch(() => ({})); setEmailErr(d.error ?? "Failed to send"); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white shadow-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent mb-0.5">Share Page</p>
            <h3 className="text-base font-extrabold text-ink leading-tight">{page.realtor_name}</h3>
            <p className="text-xs text-muted">{page.realtor_company}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-sand text-muted hover:text-ink transition-colors text-lg">×</button>
        </div>

        <div className="p-6 space-y-5">
          {/* URL copy */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">Page URL</p>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-sand px-3 py-2.5">
              <span className="flex-1 truncate text-sm font-mono text-ink/70">{url}</span>
              <button onClick={copy}
                className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${copied ? "bg-green-100 text-green-700" : "bg-white border border-line text-ink hover:border-accent hover:text-accent"}`}>
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Email realtor */}
          {page.realtor_email ? (
            <div className="rounded-2xl border border-line bg-sand p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">Email the Realtor</p>
              <p className="mb-3 text-sm text-muted">Send {page.realtor_name.split(" ")[0]} a ready-made email with the link and instructions.</p>
              {sent ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                  <span>✓</span> Email sent to {page.realtor_email}
                </div>
              ) : (
                <>
                  <button onClick={sendEmail} disabled={sending}
                    className="primary-button !py-2.5 !px-5 !text-sm w-full justify-center disabled:opacity-50">
                    {sending ? "Sending…" : `✉️  Send to ${page.realtor_email}`}
                  </button>
                  {emailErr && <p className="mt-2 text-xs font-semibold text-red-600">{emailErr}</p>}
                </>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-sand p-4 text-sm text-muted">
              No realtor email on file — add one by editing this page to enable email sharing.
            </div>
          )}

          {/* Quick actions */}
          <div className="flex gap-2">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="secondary-button flex-1 justify-center !py-2.5 !text-sm">
              Preview page →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Create / Edit form ─────────────────────────────────────────────

function PageForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<CoBrandedPage>;
  onSave: (data: Partial<CoBrandedPage>) => Promise<void>;
  onCancel: () => void;
}) {
  const [realtorName,    setRealtorName]    = useState(initial?.realtor_name    ?? "");
  const [company,        setCompany]        = useState(initial?.realtor_company ?? "");
  const [phone,          setPhone]          = useState(initial?.realtor_phone   ?? "");
  const [email,          setEmail]          = useState(initial?.realtor_email   ?? "");
  const [license,        setLicense]        = useState(initial?.realtor_license ?? "");
  const [headline,       setHeadline]       = useState(initial?.headline        ?? "");
  const [photoUrl,       setPhotoUrl]       = useState(initial?.realtor_photo_url ?? "");
  const [logoUrl,        setLogoUrl]        = useState(initial?.realtor_logo_url  ?? "");
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState("");

  const photo = useImageUpload("realtor-photo");
  const logo  = useImageUpload("realtor-logo");

  const IC = "input-base w-full";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await onSave({ realtor_name: realtorName, realtor_company: company, realtor_phone: phone || null,
        realtor_email: email || null, realtor_license: license || null, headline: headline || null,
        realtor_photo_url: photoUrl || null, realtor_logo_url: logoUrl || null });
    } catch (err) {
      setError(String(err));
      setSaving(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>, kind: "photo" | "logo") {
    const file = e.target.files?.[0]; if (!file) return;
    const uploader = kind === "photo" ? photo : logo;
    const url = await uploader.upload(file);
    if (url) { kind === "photo" ? setPhotoUrl(url) : setLogoUrl(url); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
      )}

      {/* Realtor Identity */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h3 className="mb-5 text-sm font-black uppercase tracking-[0.16em] text-muted">Realtor Info</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-muted">Full Name <span className="text-accent">*</span></label>
            <input type="text" required value={realtorName} onChange={e => setRealtorName(e.target.value)}
              placeholder="Jane Smith" className={IC} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-muted">Brokerage / Company <span className="text-accent">*</span></label>
            <input type="text" required value={company} onChange={e => setCompany(e.target.value)}
              placeholder="Smith Realty Group" className={IC} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-muted">Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(702) 555-0100" className={IC} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-muted">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@smithrealty.com" className={IC} />
            <p className="mt-1 text-[11px] text-muted">Used for the Share → Email Realtor feature</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-muted">Real Estate License #</label>
            <input type="text" value={license} onChange={e => setLicense(e.target.value)} placeholder="NV-12345" className={IC} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-muted">Custom Headline</label>
            <input type="text" value={headline} onChange={e => setHeadline(e.target.value)}
              placeholder="Let's get your clients to the closing table." className={IC} />
            <p className="mt-1 text-[11px] text-muted">Appears on the page hero. Leave blank for default.</p>
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h3 className="mb-5 text-sm font-black uppercase tracking-[0.16em] text-muted">Photos & Branding</h3>
        <div className="grid gap-6 sm:grid-cols-2">

          {/* Realtor photo */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-muted">Realtor Photo</label>
            <div className="flex items-center gap-4">
              {photoUrl ? (
                <img src={photoUrl} alt="Realtor" className="h-20 w-20 rounded-2xl object-cover object-top border border-line shadow-soft flex-shrink-0" />
              ) : (
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-line bg-sand text-2xl font-black text-muted/40">
                  {realtorName ? initials(realtorName).toUpperCase() : "?"}
                </div>
              )}
              <div>
                <button type="button" onClick={() => photo.ref.current?.click()} disabled={photo.uploading}
                  className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-ink shadow-soft hover:border-accent hover:text-accent transition-all disabled:opacity-50">
                  {photo.uploading ? "Uploading…" : photoUrl ? "Change photo" : "Upload photo"}
                </button>
                {photoUrl && (
                  <button type="button" onClick={() => setPhotoUrl("")}
                    className="mt-1 block text-[11px] font-semibold text-red-500 hover:text-red-700">Remove</button>
                )}
                {photo.error && <p className="mt-1 text-[11px] text-red-600">{photo.error}</p>}
                <p className="mt-1 text-[11px] text-muted">JPG, PNG, WebP · max 3 MB</p>
              </div>
            </div>
            <input ref={photo.ref} type="file" accept="image/*" className="hidden"
              onChange={e => handlePhotoChange(e, "photo")} />
          </div>

          {/* Company logo */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-muted">Company Logo</label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-20 w-20 rounded-2xl object-contain border border-line bg-white shadow-soft flex-shrink-0 p-2" />
              ) : (
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-line bg-sand text-xs font-bold text-muted/40 text-center px-2">
                  Logo
                </div>
              )}
              <div>
                <button type="button" onClick={() => logo.ref.current?.click()} disabled={logo.uploading}
                  className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-ink shadow-soft hover:border-accent hover:text-accent transition-all disabled:opacity-50">
                  {logo.uploading ? "Uploading…" : logoUrl ? "Change logo" : "Upload logo"}
                </button>
                {logoUrl && (
                  <button type="button" onClick={() => setLogoUrl("")}
                    className="mt-1 block text-[11px] font-semibold text-red-500 hover:text-red-700">Remove</button>
                )}
                {logo.error && <p className="mt-1 text-[11px] text-red-600">{logo.error}</p>}
                <p className="mt-1 text-[11px] text-muted">Square logo works best · max 3 MB</p>
              </div>
            </div>
            <input ref={logo.ref} type="file" accept="image/*" className="hidden"
              onChange={e => handlePhotoChange(e, "logo")} />
          </div>

        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onCancel}
          className="rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-semibold text-muted shadow-soft hover:text-ink transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="rounded-xl px-7 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
          {saving ? "Saving…" : initial?.id ? "Save changes" : "Create page →"}
        </button>
      </div>
    </form>
  );
}

// ── Page row card ──────────────────────────────────────────────────

function PageCard({
  page,
  loSlug,
  onToggle,
  onShare,
  onEdit,
  onDelete,
}: {
  page: CoBrandedPage;
  loSlug: string;
  onToggle: (id: string, active: boolean) => void;
  onShare: (page: CoBrandedPage) => void;
  onEdit: (page: CoBrandedPage) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const url = `/co/${loSlug}/${page.realtor_slug}`;

  return (
    <div className={`rounded-2xl border bg-white shadow-soft transition-all ${page.is_active ? "border-line" : "border-line/60 opacity-70"}`}>
      <div className="flex items-start gap-4 p-5">

        {/* Realtor photo / initials */}
        <div className="flex-shrink-0">
          {page.realtor_photo_url ? (
            <img src={page.realtor_photo_url} alt={page.realtor_name}
              className="h-14 w-14 rounded-2xl object-cover object-top border border-line shadow-soft" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-base font-extrabold text-white shadow-soft"
              style={{ background: "linear-gradient(135deg,#7c5cd8,#5b4bc4)" }}>
              {initials(page.realtor_name).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-bold text-ink leading-tight">{page.realtor_name}</p>
              <p className="text-sm text-muted">{page.realtor_company}</p>
            </div>
            {/* Status badge */}
            <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${page.is_active ? "bg-green-50 text-green-700 border border-green-200" : "bg-sand text-muted border border-line"}`}>
              {page.is_active ? "Live" : "Paused"}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span>{page.clicks} click{page.clicks !== 1 ? "s" : ""}</span>
            <span>·</span>
            <span>Created {relDate(page.created_at)}</span>
            {page.realtor_license && <><span>·</span><span>Lic# {page.realtor_license}</span></>}
          </div>

          {/* URL pill */}
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-sand px-2.5 py-1 text-[11px] font-mono text-muted hover:text-accent transition-colors">
            /co/{loSlug}/{page.realtor_slug} ↗
          </a>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between gap-2 border-t border-line/60 px-5 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <a href={`/portal/co-branded/${page.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs font-bold text-accent shadow-soft hover:bg-accent/10 transition-all">
            View Details →
          </a>
          <button onClick={() => onShare(page)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-soft hover:border-accent hover:text-accent transition-all">
            Share
          </button>
          <button onClick={() => onEdit(page)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-soft hover:border-accent hover:text-accent transition-all">
            Edit
          </button>
          <button onClick={() => onToggle(page.id, !page.is_active)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${page.is_active ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"}`}>
            {page.is_active ? "Pause" : "Activate"}
          </button>
        </div>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-red-600">Delete permanently?</span>
            <button onClick={() => onDelete(page.id)}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition-colors">Yes, delete</button>
            <button onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-bold text-red-500 shadow-soft hover:border-red-200 hover:bg-red-50 transition-all">
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────

export function CoBrandedManager({ loSlug, loName }: { loSlug: string; loName: string }) {
  const [pages,     setPages]     = useState<CoBrandedPage[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [view,      setView]      = useState<"list" | "create" | "edit">("list");
  const [editing,   setEditing]   = useState<CoBrandedPage | null>(null);
  const [sharing,   setSharing]   = useState<CoBrandedPage | null>(null);
  const [banner,    setBanner]    = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/portal/co-branded")
      .then(r => r.json())
      .then(d => setPages(d.pages ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function showBanner(type: "success" | "error", msg: string) {
    setBanner({ type, msg });
    setTimeout(() => setBanner(null), 4000);
  }

  async function handleCreate(data: Partial<CoBrandedPage>) {
    const res = await fetch("/api/portal/co-branded", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to create");
    setPages(p => [json.page, ...p]);
    setView("list");
    showBanner("success", `Page for ${json.page.realtor_name} created! Share it below.`);
  }

  async function handleEdit(data: Partial<CoBrandedPage>) {
    if (!editing) return;
    const res = await fetch(`/api/portal/co-branded/${editing.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to save");
    setPages(p => p.map(pg => pg.id === editing.id ? { ...pg, ...data } : pg));
    setEditing(null); setView("list");
    showBanner("success", "Page updated.");
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch(`/api/portal/co-branded/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: active }),
    });
    setPages(p => p.map(pg => pg.id === id ? { ...pg, is_active: active } : pg));
    showBanner("success", active ? "Page is now live." : "Page paused.");
  }

  async function handleDelete(id: string) {
    await fetch(`/api/portal/co-branded/${id}`, { method: "DELETE" });
    setPages(p => p.filter(pg => pg.id !== id));
    showBanner("success", "Page deleted.");
  }

  // ── Render ─────────────────────────────────────────────────────

  if (view === "create") {
    return (
      <div>
        <button onClick={() => setView("list")}
          className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink transition-colors">
          ← Back to pages
        </button>
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-ink">New Co-Branded Page</h2>
          <p className="mt-1 text-sm text-muted">Fill in the realtor's info to generate a shareable co-branded funnel page.</p>
        </div>
        <PageForm onSave={handleCreate} onCancel={() => setView("list")} />
      </div>
    );
  }

  if (view === "edit" && editing) {
    return (
      <div>
        <button onClick={() => { setView("list"); setEditing(null); }}
          className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink transition-colors">
          ← Back to pages
        </button>
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-ink">Edit: {editing.realtor_name}</h2>
          <p className="mt-1 text-sm text-muted">{editing.realtor_company}</p>
        </div>
        <PageForm initial={editing} onSave={handleEdit} onCancel={() => { setView("list"); setEditing(null); }} />
      </div>
    );
  }

  // List view
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Co-Branded Pages</h1>
          <p className="mt-1 text-sm text-muted">
            Create shareable funnel pages that feature you and a realtor partner side by side.
          </p>
        </div>
        <button onClick={() => setView("create")}
          className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-orange transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
          + New Page
        </button>
      </div>

      {/* Banner */}
      {banner && (
        <div className={`mb-4 flex items-center justify-between rounded-xl px-5 py-3 text-sm font-semibold ${banner.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          {banner.msg}
          <button onClick={() => setBanner(null)} className="ml-4 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* How it works — shown only when empty */}
      {!loading && pages.length === 0 && (
        <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
            style={{ background: "linear-gradient(135deg,rgba(243,112,33,0.12),rgba(255,152,71,0.08))" }}>
            🤝
          </div>
          <h3 className="mb-2 text-lg font-extrabold text-ink">No co-branded pages yet</h3>
          <p className="mx-auto mb-6 max-w-sm text-sm leading-6 text-muted">
            Partner with realtors by creating a shared page — your info, their info, one link they can send to every buyer client.
          </p>
          <div className="mx-auto mb-8 grid max-w-lg gap-3 sm:grid-cols-3 text-left">
            {[
              { n: "1", t: "Enter realtor info", d: "Name, company, photo, logo, contact details." },
              { n: "2", t: "Get a shareable link", d: "A branded page goes live instantly at /co/you/them." },
              { n: "3", t: "Realtor shares it", d: "Every lead they send comes tagged directly to you." },
            ].map(s => (
              <div key={s.n} className="rounded-xl border border-line bg-sand p-4">
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: "var(--ok-gradient)" }}>{s.n}</div>
                <p className="text-xs font-bold text-ink mb-1">{s.t}</p>
                <p className="text-[11px] text-muted leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setView("create")}
            className="primary-button !px-7 !py-3.5">
            Create your first page →
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-28 animate-pulse rounded-2xl border border-line bg-white" />)}
        </div>
      )}

      {/* Page cards */}
      {!loading && pages.length > 0 && (
        <div className="space-y-4">
          {pages.map(pg => (
            <PageCard
              key={pg.id}
              page={pg}
              loSlug={loSlug}
              onToggle={handleToggle}
              onShare={setSharing}
              onEdit={p => { setEditing(p); setView("edit"); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Share modal */}
      {sharing && <ShareModal page={sharing} loSlug={loSlug} onClose={() => setSharing(null)} />}
    </div>
  );
}
