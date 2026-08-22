"use client";

import { useState } from "react";
import type { Profile, LiftOffRole } from "@/lib/database.types";

// ── Role config ────────────────────────────────────────────────────────────────

const LIFTOFF_ROLES: { value: LiftOffRole; label: string; description: string; color: string }[] = [
  {
    value:       "liftoff_admin",
    label:       "Lift Off Admin",
    description: "Full queue access — all request types, can claim, start & complete anything.",
    color:       "bg-orange-50 border-orange-200 text-orange-700",
  },
  {
    value:       "liftoff_team",
    label:       "Lift Off Team",
    description: "Queue access for all request types except lock requests.",
    color:       "bg-blue-50 border-blue-200 text-blue-700",
  },
  {
    value:       "lock_desk_admin",
    label:       "Lock Desk Admin",
    description: "Queue access for lock requests only — approves and executes rate locks.",
    color:       "bg-green-50 border-green-200 text-green-700",
  },
  {
    value:       "ops_manager",
    label:       "Ops Manager",
    description: "Can assign and reassign requests. Sees all general request types.",
    color:       "bg-purple-50 border-purple-200 text-purple-700",
  },
];

function roleLabels(roles: LiftOffRole[]): string {
  if (!roles || roles.length === 0) return "No Lift Off Role";
  const map: Record<LiftOffRole, string> = {
    liftoff_admin:   "Lift Off Admin",
    liftoff_team:    "Lift Off Team",
    lock_desk_admin: "Lock Desk Admin",
    ops_manager:     "Ops Manager",
  };
  return roles.map(r => map[r] ?? r).join(", ");
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const init  = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return <>{init.toUpperCase()}</>;
}

// ── User row ───────────────────────────────────────────────────────────────────

function UserRow({
  user,
  onRolesSaved,
  onActiveToggled,
}: {
  user: Profile;
  onRolesSaved:    (id: string, roles: LiftOffRole[]) => void;
  onActiveToggled: (id: string, is_active: boolean)   => void;
}) {
  const [editing,    setEditing]    = useState(false);
  const [selected,   setSelected]   = useState<LiftOffRole[]>(user.liftoff_roles ?? []);
  const [saving,     setSaving]     = useState(false);
  const [toggling,   setToggling]   = useState(false);
  const [err,        setErr]        = useState("");

  const hasAnyRole  = user.liftoff_roles.length > 0;
  const isInactive  = !user.is_active;
  const isExternal  = user.liftoff_only;

  function toggleRole(role: LiftOffRole) {
    setSelected(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role],
    );
  }

  async function save() {
    setSaving(true); setErr("");
    const res  = await fetch(`/api/liftoff/users/${user.id}/role`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ liftoff_roles: selected }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data.error ?? "Save failed"); return; }
    onRolesSaved(user.id, selected);
    setEditing(false);
  }

  async function toggleActive() {
    setToggling(true); setErr("");
    const next = !user.is_active;
    const res  = await fetch(`/api/liftoff/users/${user.id}/active`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ is_active: next }),
    });
    const data = await res.json();
    setToggling(false);
    if (!res.ok) { setErr(data.error ?? "Failed"); return; }
    onActiveToggled(user.id, next);
  }

  return (
    <div className={`flex items-center gap-4 border-b border-line py-4 last:border-0 transition-opacity ${isInactive ? "opacity-50" : ""}`}>
      {/* Avatar */}
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.full_name}
          className="h-9 w-9 rounded-full object-cover flex-shrink-0 border border-line" />
      ) : (
        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-white flex-shrink-0 ${isInactive ? "!bg-gray-300" : ""}`}
          style={isInactive ? {} : isExternal
            ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" }
            : { background: "linear-gradient(135deg,#FF9847,#F37021)" }
          }>
          <Initials name={user.full_name} />
        </span>
      )}

      {/* Name / email / badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-bold text-ink truncate">{user.full_name}</p>
          {isExternal && (
            <span className="rounded-full bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 text-[10px] font-bold">
              External
            </span>
          )}
          {isInactive && (
            <span className="rounded-full bg-gray-100 border border-gray-200 text-gray-400 px-2 py-0.5 text-[10px] font-bold">
              Inactive
            </span>
          )}
        </div>
        <p className="text-xs text-muted truncate">{user.email}</p>
        {user.nmls && <p className="text-[10px] text-muted/60">NMLS# {user.nmls}</p>}
        {user.title && isExternal && <p className="text-[10px] text-muted/60">{user.title}</p>}
      </div>

      {/* Role + actions */}
      {!editing ? (
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold border ${
            hasAnyRole ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-gray-50 border-gray-200 text-gray-500"
          }`}>
            {roleLabels(user.liftoff_roles)}
          </span>

          {/* Edit — disabled when inactive */}
          <button
            disabled={isInactive}
            onClick={() => { setEditing(true); setSelected(user.liftoff_roles ?? []); }}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted hover:bg-sand transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Edit
          </button>

          {/* Deactivate / Reactivate */}
          <button
            disabled={toggling}
            onClick={toggleActive}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
              isInactive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            }`}>
            {toggling ? "…" : isInactive ? "Reactivate" : "Deactivate"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 items-end">
          <div className="flex flex-col gap-1.5">
            {LIFTOFF_ROLES.map(r => (
              <label key={r.value} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selected.includes(r.value)}
                  onChange={() => toggleRole(r.value)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                />
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold border ${r.color}`}>{r.label}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button disabled={saving} onClick={save}
              className="rounded-xl px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setEditing(false)}
              className="rounded-xl border border-line px-3 py-2 text-xs font-semibold text-muted hover:bg-sand">
              Cancel
            </button>
          </div>
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
      )}

      {err && !editing && <p className="text-xs text-red-600 w-full mt-1">{err}</p>}
    </div>
  );
}

// ── Invite modal ───────────────────────────────────────────────────────────────

function InviteModal({ onClose, onInvited }: {
  onClose:   () => void;
  onInvited: (user: Partial<Profile>) => void;
}) {
  const [fullName,       setFullName]       = useState("");
  const [email,          setEmail]          = useState("");
  const [title,          setTitle]          = useState("");
  const [selectedRoles,  setSelectedRoles]  = useState<LiftOffRole[]>([]);
  const [saving,         setSaving]         = useState(false);
  const [err,            setErr]            = useState("");
  const [done,           setDone]           = useState(false);

  function toggleRole(role: LiftOffRole) {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role],
    );
  }

  async function submit() {
    setErr("");
    if (!fullName.trim()) { setErr("Full name is required."); return; }
    if (!email.trim())    { setErr("Email is required."); return; }
    if (selectedRoles.length === 0) { setErr("Select at least one role."); return; }

    setSaving(true);
    const res  = await fetch("/api/liftoff/users/invite", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        full_name:     fullName.trim(),
        email:         email.trim().toLowerCase(),
        liftoff_roles: selectedRoles,
        title:         title.trim() || undefined,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data.error ?? "Invite failed."); return; }

    onInvited({
      id:            `invited-${Date.now()}`,
      full_name:     fullName.trim(),
      email:         email.trim().toLowerCase(),
      liftoff_roles: selectedRoles,
      liftoff_only:  true,
      is_active:     true,
      role:          "loan_officer",
      title:         title.trim() || null,
      avatar_url:    null,
      nmls:          null,
    });
    setDone(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <p className="text-sm font-extrabold text-ink">Invite External Member</p>
            <p className="text-xs text-muted mt-0.5">
              Lift Off access only — not shown on website, no portal access.
            </p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors text-lg leading-none">✕</button>
        </div>

        {done ? (
          <div className="px-6 py-8 text-center space-y-3">
            <p className="text-3xl">✉️</p>
            <p className="text-sm font-bold text-ink">Invite sent!</p>
            <p className="text-xs text-muted">{email} will receive a sign-in link to access Lift Off.</p>
            <button onClick={onClose}
              className="mt-2 rounded-xl px-4 py-2 text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
              Done
            </button>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Jordan Patel"
                className="w-full rounded-xl border border-line bg-sand px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-[#142850]/30"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jordan@contractor.com"
                className="w-full rounded-xl border border-line bg-sand px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-[#142850]/30"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Title / Label <span className="text-muted/50">(optional)</span></label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Contract Lock Desk"
                className="w-full rounded-xl border border-line bg-sand px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-[#142850]/30"
              />
            </div>

            {/* Roles */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-2">Lift Off Role(s) <span className="text-red-500">*</span></label>
              <div className="space-y-2">
                {LIFTOFF_ROLES.map(r => (
                  <label key={r.value} className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(r.value)}
                      onChange={() => toggleRole(r.value)}
                      className="mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                    />
                    <div>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold border ${r.color}`}>{r.label}</span>
                      <p className="text-[11px] text-muted mt-0.5">{r.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {err && <p className="text-xs text-red-600 font-semibold">{err}</p>}

            <div className="flex gap-2 pt-1">
              <button
                disabled={saving}
                onClick={submit}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
                {saving ? "Sending invite…" : "Send Invite"}
              </button>
              <button onClick={onClose}
                className="rounded-xl border border-line px-4 py-2.5 text-xs font-semibold text-muted hover:bg-sand">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function LiftOffRolesClient({ initialUsers }: { initialUsers: Profile[] }) {
  const [users,        setUsers]       = useState<Profile[]>(initialUsers);
  const [showInvite,   setShowInvite]  = useState(false);

  function handleRolesSaved(id: string, roles: LiftOffRole[]) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, liftoff_roles: roles } : u));
  }

  function handleActiveToggled(id: string, is_active: boolean) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active } : u));
  }

  function handleInvited(partial: Partial<Profile>) {
    // Optimistically add to list — real data loads on next page visit
    setUsers(prev => [
      ...prev,
      {
        // sensible defaults for a freshly-invited external user
        id: partial.id ?? `tmp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tenant_id: "", slice_role: "loan_officer",
        lo_slug: null, phone: null, notify_email: null,
        show_on_website: false, title: partial.title ?? null,
        short_bio: null, offices: null, linkedin: null,
        licensed_states: null, hero_bio: null, about_headline: null,
        long_bio: null, years_experience: null, specialties: null,
        calendar_url: null, application_url: null, last_seen_at: null,
        branch_id: null, manager_id: null, arive_lo_id: null,
        porchy_user_id: null, last_login_at: null,
        ...partial,
      } as Profile,
    ]);
    setShowInvite(false);
  }

  // Segment users
  const withRole    = users.filter(u => u.liftoff_roles.length > 0);
  const hcmgOnly    = users.filter(u => u.liftoff_roles.length === 0 && !u.liftoff_only);

  return (
    <div className="space-y-6">
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInvited={handleInvited}
        />
      )}

      {/* Role legend */}
      <div className="grid gap-3 sm:grid-cols-4">
        {LIFTOFF_ROLES.map(r => (
          <div key={r.value} className={`rounded-2xl border p-4 ${r.color}`}>
            <p className="text-xs font-bold">{r.label}</p>
            <p className="text-[11px] mt-1 opacity-80">{r.description}</p>
          </div>
        ))}
      </div>

      {/* Team members with Lift Off access (includes externals) */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="border-b border-line px-6 py-4 bg-sand flex items-center justify-between">
          <div>
            <h2 className="font-bold text-ink text-sm">Team Members with Lift Off Access</h2>
            <p className="text-xs text-muted">
              {withRole.filter(u => u.is_active).length} active
              {withRole.filter(u => !u.is_active).length > 0 && (
                <span className="ml-1 text-muted/60">· {withRole.filter(u => !u.is_active).length} inactive</span>
              )}
            </p>
          </div>
          {/* Invite button */}
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors">
            <span>+</span> Invite External Member
          </button>
        </div>
        <div className="px-6">
          {withRole.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted/60">No roles assigned yet.</p>
          ) : (
            withRole.map(u => (
              <UserRow
                key={u.id}
                user={u}
                onRolesSaved={handleRolesSaved}
                onActiveToggled={handleActiveToggled}
              />
            ))
          )}
        </div>
      </div>

      {/* HCMG users without a role (no external users here) */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="border-b border-line px-6 py-4 bg-sand">
          <h2 className="font-bold text-ink text-sm">HCMG Users — Assign a Role</h2>
          <p className="text-xs text-muted">{hcmgOnly.length} without a Lift Off role</p>
        </div>
        <div className="px-6">
          {hcmgOnly.map(u => (
            <UserRow
              key={u.id}
              user={u}
              onRolesSaved={handleRolesSaved}
              onActiveToggled={handleActiveToggled}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
