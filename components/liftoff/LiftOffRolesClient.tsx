"use client";

import { useState } from "react";
import type { Profile, LiftOffRole } from "@/lib/database.types";

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

function UserRow({ user, onSaved }: { user: Profile; onSaved: (id: string, roles: LiftOffRole[]) => void }) {
  const [editing, setEditing]   = useState(false);
  const [selected, setSelected] = useState<LiftOffRole[]>(user.liftoff_roles ?? []);
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState("");

  const hasAnyRole = user.liftoff_roles.length > 0;

  function toggleRole(role: LiftOffRole) {
    setSelected(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  }

  async function save() {
    setSaving(true); setErr("");
    const res = await fetch(`/api/liftoff/users/${user.id}/role`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ liftoff_roles: selected }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data.error ?? "Save failed"); return; }
    onSaved(user.id, selected);
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

      {/* Current Lift Off role pill(s) */}
      {!editing ? (
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold border ${hasAnyRole ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
            {roleLabels(user.liftoff_roles)}
          </span>
          <button onClick={() => { setEditing(true); setSelected(user.liftoff_roles ?? []); }}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted hover:bg-sand transition-colors">
            Edit
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
    </div>
  );
}

export function LiftOffRolesClient({ initialUsers }: { initialUsers: Profile[] }) {
  const [users, setUsers] = useState<Profile[]>(initialUsers);

  function handleSaved(id: string, roles: LiftOffRole[]) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, liftoff_roles: roles } : u));
  }

  // Group by whether they have any role
  const withRole    = users.filter(u => u.liftoff_roles.length > 0);
  const withoutRole = users.filter(u => u.liftoff_roles.length === 0);

  return (
    <div className="space-y-6">
      {/* Role legend */}
      <div className="grid gap-3 sm:grid-cols-4">
        {LIFTOFF_ROLES.map(r => (
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
