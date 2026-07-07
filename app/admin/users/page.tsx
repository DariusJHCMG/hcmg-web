"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import type { Profile, Role } from "@/lib/database.types";

const ROLES: Role[] = ["admin", "developer", "loan_officer"];
const ROLE_COLORS: Record<string, string> = {
  admin:        "bg-orange-50 text-orange-700",
  developer:    "bg-blue-50 text-blue-700",
  loan_officer: "bg-purple-50 text-purple-700",
};

const blank = { email: "", password: "", full_name: "", role: "loan_officer" as Role, lo_slug: "", nmls: "", phone: "", notify_email: "" };

export default function UsersPage() {
  const [users, setUsers]     = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(blank);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const supabase = createBrowserClient();

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("full_name");
    setUsers((data ?? []) as Profile[]);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) { setMsg({ type: "err", text: json.error ?? "Failed to create user." }); }
    else { setMsg({ type: "ok", text: `User ${form.email} created.` }); setForm(blank); fetchUsers(); }
    setSaving(false);
  }

  async function toggleActive(id: string, is_active: boolean) {
    await (supabase.from("profiles") as any).update({ is_active: !is_active }).eq("id", id);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_active: !is_active } : u));
  }

  async function changeRole(id: string, role: Role) {
    await (supabase.from("profiles") as any).update({ role }).eq("id", id);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
  }

  const inputClass = "rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">User Accounts</h1>
        <p className="mt-1 text-sm text-muted">Create and manage portal login accounts for your team.</p>
      </div>

      {/* Create user form */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="mb-4 font-bold text-ink">Create New Account</h2>
        <form onSubmit={createUser} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-ink">Full Name *</label>
            <input required className={inputClass + " w-full"} placeholder="Lamont Harris Jr." value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink">Role *</label>
            <select required className={inputClass + " w-full"} value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as Role }))}>
              {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink">Email *</label>
            <input required type="email" className={inputClass + " w-full"} placeholder="email@hcmg.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink">Password *</label>
            <input required type="password" className={inputClass + " w-full"} placeholder="Min 8 chars" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink">LO Slug (if LO)</label>
            <input className={inputClass + " w-full"} placeholder="lamont-harris-jr" value={form.lo_slug} onChange={(e) => setForm((p) => ({ ...p, lo_slug: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink">NMLS#</label>
            <input className={inputClass + " w-full"} placeholder="1234567" value={form.nmls} onChange={(e) => setForm((p) => ({ ...p, nmls: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink">Lead Notify Email</label>
            <input type="email" className={inputClass + " w-full"} placeholder="Defaults to login email" value={form.notify_email} onChange={(e) => setForm((p) => ({ ...p, notify_email: e.target.value }))} />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-4">
            <button type="submit" disabled={saving} className="primary-button !py-2.5 !px-6 !text-sm disabled:opacity-50">
              {saving ? "Creating…" : "Create account →"}
            </button>
            {msg && (
              <p className={`text-sm font-semibold ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>
            )}
          </div>
        </form>
      </div>

      {/* Users table */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-sand text-xs font-semibold uppercase tracking-[0.1em] text-muted/70">
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">LO Slug</th>
                <th className="px-5 py-3 text-left">NMLS</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-muted/60">Loading…</td></tr>}
              {!loading && users.map((u, i) => (
                <tr key={u.id} className={i % 2 === 0 ? "bg-white" : "bg-sand/40"}>
                  <td className="px-5 py-3 font-semibold text-ink">{u.full_name}</td>
                  <td className="px-5 py-3 text-muted">{u.email}</td>
                  <td className="px-5 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value as Role)}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold cursor-pointer border-none outline-none ${ROLE_COLORS[u.role]}`}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-muted font-mono text-xs">{u.lo_slug ?? "—"}</td>
                  <td className="px-5 py-3 text-muted">{u.nmls ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${u.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(u.id, u.is_active)}
                      className="text-xs font-semibold text-muted hover:text-accent transition-colors"
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
