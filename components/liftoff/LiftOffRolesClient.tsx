"use client";

import { useState } from "react";
import type { Profile, LiftOffRole } from "@/lib/database.types";

const LIFTOFF_ROLES: { value: LiftOffRole | ""; label: string; description: string; color: string }[] = [
  {
    value:       "",
    label:       "No Lift Off Role",
    description: "Standard access only — cannot access the ops queue.",
    color:       "bg-gray-50 border-gray-200 text-gray-500",
  },
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
];

function roleMeta(role: LiftOffRole | null) {
  return LIFTOFF_ROLES.find(r => r.value === (role ?? "")) ?? LIFTOFF_ROLES[0];
}

function UserRow({ user, onSaved }: { user: Profile; onSaved: (id: string, role: LiftOffRole | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<LiftOffRole | "">(user.liftoff_role ?? "");
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState("");

  const meta = roleMeta(user.liftoff_role);

  async function save() {
    setSaving(true); setErr("");
    const res = await fetch(`/api/liftoff/users/${user.id}/role`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ liftoff_role: selected || null }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data.error ?? "Save failed"); return; }
    onSaved(user.id, (selected as LiftOffRole) || null);
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-4 border-b border-line py-4 last:border-0">
      {/* Avatar */}
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.full_name}
          className="h-9 w-9 rounded-full object-cover flex-shrink-0 border border-line" />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
          {user.full_name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join("").toUpperCase()}
        </span>
      )}

      {/* Name / role */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ink truncate">{user.full_name}</p>
        <p className="text-xs text-muted truncate">{user.email}</p>
        {user.nmls && <p className="text-[10px] text-muted/60">NMLS# {user.nmls}</p>}
      </div>

      {/* Current Lift Off role pill */}
      {!editing ? (
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold border ${meta.color}`}>
            {meta.label}
          </span>
          <button onClick={() => { setEditing(true); setSelected(user.liftoff_role ?? ""); }}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted hover:bg-sand transition-colors">
            Edit
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <select
            value={selected}
            onChange={e => setSelected(e.target.value as LiftOffRole | "")}
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-orange-400/40"
          >
            {LIFTOFF_ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <button disabled={saving} onClick={save}
            className="rounded-xl px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button onClick={() => setEditing(false)}
            className="rounded-xl border border-line px-3 py-2 text-xs font-semibold text-muted hover:bg-sand">
            Cancel
          </button>
          {err && <p className="w-full text-xs text-red-600">{err}</p>}
        </div>
      )}
    </div>
  );
}

export function LiftOffRolesClient({ initialUsers }: { initialUsers: Profile[] }) {
  const [users, setUsers] = useState<Profile[]>(initialUsers);

  function handleSaved(id: string, role: LiftOffRole | null) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, liftoff_role: role } : u));
  }

  // Group by whether they have a role
  const withRole    = users.filter(u => u.liftoff_role);
  const withoutRole = users.filter(u => !u.liftoff_role);

  return (
    <div className="space-y-6">
      {/* Role legend */}
      <div className="grid gap-3 sm:grid-cols-3">
        {LIFTOFF_ROLES.filter(r => r.value !== "").map(r => (
          <div key={r.value} className={`rounded-2xl border p-4 ${r.color}`}>
            <p className="text-xs font-bold">{r.label}</p>
            <p className="text-[11px] mt-1 opacity-80">{r.description}</p>
          </div>
        ))}
      </div>

      {/* Users with Lift Off roles */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="border-b border-line px-6 py-4 bg-sand">
          <h2 className="font-bold text-ink text-sm">Team Members with Lift Off Access</h2>
          <p className="text-xs text-muted">{withRole.length} assigned</p>
        </div>
        <div className="px-6">
          {withRole.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted/60">No roles assigned yet. Use the list below to assign roles.</p>
          ) : (
            withRole.map(u => (
              <UserRow key={u.id} user={u} onSaved={handleSaved} />
            ))
          )}
        </div>
      </div>

      {/* All other users */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="border-b border-line px-6 py-4 bg-sand">
          <h2 className="font-bold text-ink text-sm">All Users — Assign a Role</h2>
          <p className="text-xs text-muted">{withoutRole.length} without a Lift Off role</p>
        </div>
        <div className="px-6">
          {withoutRole.map(u => (
            <UserRow key={u.id} user={u} onSaved={handleSaved} />
          ))}
        </div>
      </div>
    </div>
  );
}
