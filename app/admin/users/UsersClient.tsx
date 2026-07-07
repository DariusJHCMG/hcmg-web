"use client";

import { useState } from "react";
import type { Profile, Role } from "@/lib/database.types";

// ── Constants ─────────────────────────────────────────────────────

const ROLES: Role[] = ["admin", "developer", "loan_officer"];

const ROLE_COLORS: Record<string, string> = {
  admin:        "bg-orange-50 text-orange-700 border-orange-200",
  developer:    "bg-blue-50 text-blue-700 border-blue-200",
  loan_officer: "bg-purple-50 text-purple-700 border-purple-200",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", developer: "Developer", loan_officer: "Loan Officer",
};

const blankCreate = {
  email: "", password: "", full_name: "", role: "loan_officer" as Role,
  lo_slug: "", nmls: "", phone: "", notify_email: "", title: "",
  short_bio: "", offices: "", linkedin: "",
};

// ── Input helper ──────────────────────────────────────────────────

const IC = "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 transition";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-ink">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-muted/60">{hint}</p>}
    </div>
  );
}

// ── Edit Drawer ───────────────────────────────────────────────────

function EditDrawer({ user, onClose, onSaved }: {
  user: Profile;
  onClose: () => void;
  onSaved: (updated: Profile) => void;
}) {
  const [form, setForm] = useState({
    full_name:       user.full_name,
    role:            user.role,
    phone:           user.phone ?? "",
    notify_email:    user.notify_email ?? "",
    nmls:            user.nmls ?? "",
    lo_slug:         user.lo_slug ?? "",
    title:           user.title ?? "",
    short_bio:       user.short_bio ?? "",
    offices:         (user.offices ?? []).join(", "),
    linkedin:        user.linkedin ?? "",
    licensed_states: (user.licensed_states ?? []).join(", "),
    show_on_website: user.show_on_website,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true); setErr("");
    const payload: Record<string, unknown> = {
      ...form,
      offices:         form.offices ? form.offices.split(",").map((s) => s.trim()).filter(Boolean) : [],
      licensed_states: form.licensed_states ? form.licensed_states.split(",").map((s) => s.trim()).filter(Boolean) : [],
      linkedin:        form.linkedin || undefined,
    };
    const res  = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) { setErr(json.error ?? "Save failed."); setSaving(false); return; }
    onSaved({ ...user, ...payload, offices: payload.offices as string[], licensed_states: payload.licensed_states as string[] } as Profile);
    setSaving(false);
    onClose();
  }

  return (
    <tr>
      <td colSpan={6} className="p-0">
        <div className="border-b border-line bg-sand/60 px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-bold text-ink">Edit — {user.full_name}</p>
            <button onClick={onClose} className="text-sm text-muted hover:text-ink">✕ Close</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Identity */}
            <Field label="Full Name *">
              <input className={IC} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
            </Field>
            <Field label="Role *">
              <select className={IC} value={form.role} onChange={(e) => set("role", e.target.value)}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </Field>
            <Field label="Job Title" hint="Shown on team page (e.g. 'Loan Officer', 'CEO')">
              <input className={IC} placeholder="Loan Officer" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Phone">
              <input className={IC} placeholder="702-555-0101" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
            <Field label="NMLS#">
              <input className={IC} placeholder="1234567" value={form.nmls} onChange={(e) => set("nmls", e.target.value)} />
            </Field>
            <Field label="LO Slug" hint="URL slug for funnel link + team page">
              <input className={IC} placeholder="cason-knight" value={form.lo_slug} onChange={(e) => set("lo_slug", e.target.value)} />
            </Field>
            <Field label="Lead Notify Email" hint="Where new lead emails go (defaults to login email)">
              <input type="email" className={IC} placeholder="cason@hcmgloans.com" value={form.notify_email} onChange={(e) => set("notify_email", e.target.value)} />
            </Field>
            <Field label="LinkedIn URL">
              <input type="url" className={IC} placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
            </Field>
            <Field label="Offices" hint="Comma separated: Las Vegas, NV, Houston, TX">
              <input className={IC} placeholder="Las Vegas, NV, Houston, TX" value={form.offices} onChange={(e) => set("offices", e.target.value)} />
            </Field>
            <Field label="Licensed States" hint="Comma separated: NV, TX, FL">
              <input className={IC} placeholder="NV, TX, FL" value={form.licensed_states} onChange={(e) => set("licensed_states", e.target.value)} />
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Short Bio" hint="1–2 sentences shown on the public team page">
                <textarea className={IC + " h-20 resize-none"} placeholder="Licensed mortgage loan originator at HCMG…"
                  value={form.short_bio} onChange={(e) => set("short_bio", e.target.value)} />
              </Field>
            </div>

            {/* Website visibility */}
            <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="h-4 w-4 accent-accent rounded"
                  checked={form.show_on_website} onChange={(e) => set("show_on_website", e.target.checked)} />
                <span className="text-sm font-semibold text-ink">Show on public team page</span>
              </label>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <button onClick={save} disabled={saving}
              className="primary-button !py-2.5 !px-6 !text-sm disabled:opacity-50">
              {saving ? "Saving…" : "Save changes →"}
            </button>
            <button onClick={onClose} className="secondary-button !py-2.5 !px-5 !text-sm">Cancel</button>
            {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────

export function UsersClient({ initialUsers }: { initialUsers: Profile[] }) {
  const [users, setUsers]       = useState<Profile[]>(initialUsers);
  const [form, setForm]         = useState(blankCreate);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [editId, setEditId]     = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fld = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const payload = {
      ...form,
      offices: form.offices ? form.offices.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
    const res  = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      setMsg({ type: "err", text: json.error ?? "Failed to create user." });
    } else {
      setMsg({ type: "ok", text: `✅ ${form.full_name} created.` });
      setForm(blankCreate);
      setShowCreate(false);
      window.location.reload();
    }
    setSaving(false);
  }

  async function toggleActive(u: Profile) {
    const next = !u.is_active;
    await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: next }),
    });
    setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, is_active: next } : x));
  }

  const los     = users.filter((u) => u.role === "loan_officer");
  const admins  = users.filter((u) => u.role !== "loan_officer");
  const active  = users.filter((u) => u.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Users</h1>
          <p className="mt-0.5 text-sm text-muted">
            {users.length} accounts · {active} active · {los.length} loan officers · {admins.length} admin/dev
          </p>
        </div>
        <button onClick={() => setShowCreate((x) => !x)} className="primary-button !py-2.5 !px-5 !text-sm">
          {showCreate ? "✕ Cancel" : "+ Add user"}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="mb-5 font-bold text-ink">New Account</h2>
          <form onSubmit={createUser} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Full Name *">
              <input required className={IC} placeholder="Cason Thomas Knight" value={form.full_name} onChange={(e) => fld("full_name", e.target.value)} />
            </Field>
            <Field label="Role *">
              <select required className={IC} value={form.role} onChange={(e) => fld("role", e.target.value)}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </Field>
            <Field label="Job Title" hint="e.g. 'Loan Officer', 'CEO'">
              <input className={IC} placeholder="Loan Officer" value={form.title} onChange={(e) => fld("title", e.target.value)} />
            </Field>
            <Field label="Email *">
              <input required type="email" className={IC} placeholder="cason@hcmgloans.com" value={form.email} onChange={(e) => fld("email", e.target.value)} />
            </Field>
            <Field label="Password *">
              <input required type="password" className={IC} placeholder="Min 8 chars" value={form.password} onChange={(e) => fld("password", e.target.value)} />
            </Field>
            <Field label="Phone">
              <input className={IC} placeholder="702-555-0101" value={form.phone} onChange={(e) => fld("phone", e.target.value)} />
            </Field>
            <Field label="NMLS#">
              <input className={IC} placeholder="1234567" value={form.nmls} onChange={(e) => fld("nmls", e.target.value)} />
            </Field>
            <Field label="LO Slug" hint="Used in /go/[slug] funnel link">
              <input className={IC} placeholder="cason-knight" value={form.lo_slug} onChange={(e) => fld("lo_slug", e.target.value)} />
            </Field>
            <Field label="Lead Notify Email">
              <input type="email" className={IC} placeholder="Defaults to login email" value={form.notify_email} onChange={(e) => fld("notify_email", e.target.value)} />
            </Field>
            <Field label="Offices" hint="Comma separated">
              <input className={IC} placeholder="Las Vegas, NV, Houston, TX" value={form.offices} onChange={(e) => fld("offices", e.target.value)} />
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Short Bio" hint="Shown on public team page">
                <textarea className={IC + " h-20 resize-none"} placeholder="Licensed mortgage loan originator at HCMG…"
                  value={form.short_bio} onChange={(e) => fld("short_bio", e.target.value)} />
              </Field>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-4">
              <button type="submit" disabled={saving} className="primary-button !py-2.5 !px-6 !text-sm disabled:opacity-50">
                {saving ? "Creating…" : "Create account →"}
              </button>
              {msg && <p className={`text-sm font-semibold ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
            </div>
          </form>
        </div>
      )}

      {/* Users table */}
      {[
        { label: "Loan Officers", members: los },
        { label: "Admin & Dev", members: admins },
      ].map(({ label, members }) => members.length === 0 ? null : (
        <div key={label} className="rounded-2xl border border-line bg-white overflow-hidden">
          <div className="border-b border-line bg-sand/60 px-5 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted/70">{label} · {members.length}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-xs font-semibold uppercase tracking-[0.1em] text-muted/60">
                  <th className="px-5 py-3 text-left">Member</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-left">NMLS / Slug</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Website</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((u) => (
                  <>
                    <tr key={u.id} className={`border-b border-line/50 transition-colors ${editId === u.id ? "bg-sand/40" : "hover:bg-sand/30"}`}>
                      {/* Member */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white"
                            style={{ background: u.is_active ? "var(--ok-gradient)" : "#d1d5db" }}>
                            {u.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <p className="font-bold text-ink leading-tight">{u.full_name}</p>
                            <p className="text-xs text-muted/70">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Role */}
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${ROLE_COLORS[u.role]}`}>
                          {ROLE_LABELS[u.role]}
                        </span>
                      </td>
                      {/* NMLS / slug */}
                      <td className="px-5 py-3 text-xs text-muted">
                        {u.nmls && <p className="font-mono">NMLS# {u.nmls}</p>}
                        {u.lo_slug && <p className="font-mono text-accent">/go/{u.lo_slug}</p>}
                        {!u.nmls && !u.lo_slug && <span className="text-muted/40">—</span>}
                      </td>
                      {/* Status */}
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${u.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"}`}>
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      {/* Website */}
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${u.show_on_website ? "bg-blue-50 text-blue-700" : "bg-sand text-muted"}`}>
                          {u.show_on_website ? "Visible" : "Hidden"}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setEditId(editId === u.id ? null : u.id)}
                            className="text-xs font-bold text-accent hover:underline">
                            {editId === u.id ? "Close" : "Edit"}
                          </button>
                          <span className="text-line">|</span>
                          <button onClick={() => toggleActive(u)}
                            className={`text-xs font-bold transition-colors ${u.is_active ? "text-red-500 hover:text-red-700" : "text-green-600 hover:text-green-800"}`}>
                            {u.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editId === u.id && (
                      <EditDrawer
                        key={`edit-${u.id}`}
                        user={u}
                        onClose={() => setEditId(null)}
                        onSaved={(updated) => {
                          setUsers((prev) => prev.map((x) => x.id === updated.id ? updated : x));
                          setEditId(null);
                        }}
                      />
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
