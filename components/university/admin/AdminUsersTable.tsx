"use client";

import { useState, useMemo } from "react";
import type { UniversityRole } from "@/lib/database.types";

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_active: boolean | null;
  employment_status: string | null;
  university_access: boolean | null;
  university_role: UniversityRole | null;
  department: string | null;
  last_login_at: string | null;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const UNI_ROLES: UniversityRole[] = ["learner", "trainer", "manager", "university_admin"];

const ROLE_LABELS: Record<UniversityRole, string> = {
  learner:          "Learner",
  trainer:          "Trainer",
  manager:          "Manager",
  university_admin: "Admin",
};

function EditableRow({ u, index }: { u: UserRow; index: number }) {
  const [uAccess, setUAccess] = useState(u.university_access ?? false);
  const [uRole, setURole]     = useState<UniversityRole>(u.university_role ?? "learner");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const dirty =
    uAccess !== (u.university_access ?? false) ||
    uRole   !== (u.university_role ?? "learner");

  async function save() {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/university/admin/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ university_access: uAccess, university_role: uRole }),
      });
      if (res.ok) {
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2500);
      } else {
        setSaveState("error");
      }
    } catch {
      setSaveState("error");
    }
  }

  return (
    <tr style={{ borderBottom: "1px solid #dfe4e8", background: index % 2 === 0 ? "#fff" : "#f7f8fa" }}>
      <td style={{ padding: "12px 14px" }}>
        <div style={{ fontWeight: 600, color: "#071a2e", fontSize: 13 }}>{u.full_name ?? "—"}</div>
        <div style={{ fontSize: 11, color: "#687383" }}>{u.role ?? "—"}</div>
      </td>
      <td style={{ padding: "12px 14px", fontSize: 12, color: "#687383" }}>{u.email ?? "—"}</td>
      <td style={{ padding: "12px 14px", fontSize: 12, color: "#687383" }}>{u.department ?? "—"}</td>
      <td style={{ padding: "12px 14px" }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
          background: u.is_active ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
          color: u.is_active ? "#34d399" : "#f87171",
        }}>
          {u.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      {/* Editable: U Access */}
      <td style={{ padding: "12px 14px" }}>
        <select
          value={uAccess ? "yes" : "no"}
          onChange={e => { setUAccess(e.target.value === "yes"); setSaveState("idle"); }}
          style={{
            padding: "4px 8px", borderRadius: 6, fontSize: 12, fontFamily: "inherit",
            border: "1.5px solid #dfe4e8", background: "#fff", cursor: "pointer",
          }}
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </td>
      {/* Editable: U Role */}
      <td style={{ padding: "12px 14px" }}>
        <select
          value={uRole}
          onChange={e => { setURole(e.target.value as UniversityRole); setSaveState("idle"); }}
          style={{
            padding: "4px 8px", borderRadius: 6, fontSize: 12, fontFamily: "inherit",
            border: "1.5px solid #dfe4e8", background: "#fff", cursor: "pointer",
          }}
        >
          {UNI_ROLES.map(r => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </td>
      <td style={{ padding: "12px 14px", fontSize: 11, color: "#687383" }}>
        {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : "—"}
      </td>
      {/* Save / status */}
      <td style={{ padding: "12px 14px", minWidth: 80 }}>
        {saveState === "error" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#f87171", fontWeight: 700 }}>Failed</span>
            <button
              onClick={() => setSaveState("idle")}
              style={{ fontSize: 10, color: "#687383", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
            >
              Dismiss
            </button>
          </div>
        ) : saveState === "saved" ? (
          <span style={{ fontSize: 11, color: "#34d399", fontWeight: 700 }}>✓ Saved</span>
        ) : dirty ? (
          <button
            onClick={save}
            disabled={saveState === "saving"}
            style={{
              fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 6,
              background: "linear-gradient(135deg,#FF9847,#F37021)",
              color: "#fff", border: "none", cursor: "pointer",
              opacity: saveState === "saving" ? 0.6 : 1,
              fontFamily: "inherit",
            }}
          >
            {saveState === "saving" ? "Saving…" : "Save"}
          </button>
        ) : null}
      </td>
    </tr>
  );
}

export function AdminUsersTable({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [filterAccess, setFilterAccess] = useState<"all" | "yes" | "no">("all");
  const [filterRole, setFilterRole] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(u => {
      const textMatch = !q
        || (u.full_name ?? "").toLowerCase().includes(q)
        || (u.email ?? "").toLowerCase().includes(q)
        || (u.department ?? "").toLowerCase().includes(q);
      const accessMatch =
        filterAccess === "all"
        || (filterAccess === "yes" && u.university_access)
        || (filterAccess === "no" && !u.university_access);
      const roleMatch = filterRole === "all" || u.university_role === filterRole;
      return textMatch && accessMatch && roleMatch;
    });
  }, [users, search, filterAccess, filterRole]);

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          border: "1.5px solid #dfe4e8", borderRadius: 8,
          padding: "0 12px", background: "#fff", height: 38, flex: "1 1 220px",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#687383" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or department…"
            style={{ border: "none", outline: "none", fontSize: 13, background: "transparent", flex: 1, color: "#071a2e" }}
          />
        </div>
        <select
          value={filterAccess}
          onChange={e => setFilterAccess(e.target.value as typeof filterAccess)}
          style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #dfe4e8", fontSize: 12, background: "#fff", fontFamily: "inherit", cursor: "pointer" }}
        >
          <option value="all">All access</option>
          <option value="yes">Has U access</option>
          <option value="no">No U access</option>
        </select>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #dfe4e8", fontSize: 12, background: "#fff", fontFamily: "inherit", cursor: "pointer" }}
        >
          <option value="all">All roles</option>
          {UNI_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <span style={{ fontSize: 12, color: "#687383", marginLeft: "auto" }}>
          {filtered.length} of {users.length} members
        </span>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #dfe4e8", borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 860 }}>
          <thead>
            <tr style={{ background: "#071a2e" }}>
              {["Name", "Email", "Department", "Status", "U Access", "U Role", "Last Login", ""].map(h => (
                <th key={h} style={{
                  padding: "10px 14px", textAlign: "left",
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.8px", color: "#687383",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "36px", textAlign: "center", color: "#687383", fontSize: 13 }}>
                  No users match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((u, i) => (
                <EditableRow key={u.id} u={u} index={i} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
