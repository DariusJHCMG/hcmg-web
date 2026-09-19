"use client";

import { useState } from "react";
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
      setSaveState(res.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
    setTimeout(() => setSaveState("idle"), 2500);
  }

  return (
    <tr style={{ borderBottom: "1px solid #dfe4e8", background: index % 2 === 0 ? "#fff" : "#f7f8fa" }}>
      <td style={{ padding: "12px 12px" }}>
        <div style={{ fontWeight: 600, color: "#071a2e", fontSize: 13 }}>{u.full_name}</div>
        <div style={{ fontSize: 11, color: "#687383" }}>{u.role}</div>
      </td>
      <td style={{ padding: "12px 12px", fontSize: 12, color: "#687383" }}>{u.email}</td>
      <td style={{ padding: "12px 12px" }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
          background: u.is_active ? "rgba(52,211,153,0.1)" : "rgba(178,59,59,0.1)",
          color: u.is_active ? "#34d399" : "#f87171",
        }}>
          {u.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      <td style={{ padding: "12px 12px" }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
          background: (u.employment_status ?? "active") === "active" ? "rgba(52,211,153,0.1)" : "rgba(178,59,59,0.1)",
          color: (u.employment_status ?? "active") === "active" ? "#34d399" : "#f87171",
        }}>
          {u.employment_status ?? "active"}
        </span>
      </td>
      {/* Editable: U Access */}
      <td style={{ padding: "12px 12px" }}>
        <select
          value={uAccess ? "yes" : "no"}
          onChange={e => setUAccess(e.target.value === "yes")}
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
      <td style={{ padding: "12px 12px" }}>
        <select
          value={uRole}
          onChange={e => setURole(e.target.value as UniversityRole)}
          style={{
            padding: "4px 8px", borderRadius: 6, fontSize: 12, fontFamily: "inherit",
            border: "1.5px solid #dfe4e8", background: "#fff", cursor: "pointer",
          }}
        >
          {UNI_ROLES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </td>
      <td style={{ padding: "12px 12px", fontSize: 11, color: "#687383" }}>
        {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : "—"}
      </td>
      {/* Save button */}
      <td style={{ padding: "12px 12px" }}>
        {dirty && saveState !== "saved" && (
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
        )}
        {saveState === "saved" && (
          <span style={{ fontSize: 11, color: "#34d399", fontWeight: 700 }}>✓ Saved</span>
        )}
        {saveState === "error" && (
          <span style={{ fontSize: 11, color: "#f87171", fontWeight: 700 }}>Error</span>
        )}
      </td>
    </tr>
  );
}

export function AdminUsersTable({ users }: { users: UserRow[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 800 }}>
        <thead>
          <tr style={{ background: "#071a2e" }}>
            {["Name", "Email", "Status", "Employment", "U Access", "U Role", "Last Login", ""].map(h => (
              <th key={h} style={{
                padding: "10px 12px", textAlign: "left",
                fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.8px", color: "#687383",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <EditableRow key={u.id} u={u} index={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
