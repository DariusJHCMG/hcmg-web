"use client";

/**
 * /goal-engine/admin/goals/[id]/assignments
 * Manage which LOs are assigned to a specific goal.
 * Participation % is calculated only against assigned LOs.
 */

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

const C = {
  navy:   "#142850",
  orange: "#F37021",
  ink:    "#1A2B42",
  muted:  "#64748B",
  line:   "#E2E8F0",
  sand:   "#F8FAFC",
  white:  "#ffffff",
  green:  "#16a34a",
};

type LORow = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  nmls: string | null;
};

type AssignmentRow = {
  id: string;
  assigned_at: string;
  profile: LORow;
};

function Avatar({ name, url, size = 32 }: { name: string; url?: string | null; size?: number }) {
  return url
    ? <img src={url} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${C.line}` }} />
    : <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,#FF9847,${C.orange})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
        {name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join("").toUpperCase()}
      </div>;
}

export default function GoalAssignmentsPage() {
  const { id: goalMonthId } = useParams<{ id: string }>();

  const [assignments,   setAssignments]   = useState<AssignmentRow[]>([]);
  const [allLOs,        setAllLOs]        = useState<LORow[]>([]);
  const [unassigned,    setUnassigned]    = useState<LORow[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [message,       setMessage]       = useState<{ text: string; ok: boolean } | null>(null);
  const [apiError,      setApiError]      = useState<string | null>(null);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [search,        setSearch]        = useState("");

  const [tableWarning,  setTableWarning]  = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const r = await fetch(`/api/goal-engine/goal-assignments?goal_month_id=${goalMonthId}`, { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) {
        setApiError(d.error ?? `API error ${r.status}`);
        return;
      }
      setAssignments(d.assignments ?? []);
      setAllLOs(d.all_los ?? []);
      setUnassigned(d.unassigned_los ?? []);
      setTableWarning(d.table_warning ?? null);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Network error");
    }
    finally { setLoading(false); }
  }, [goalMonthId]);

  useEffect(() => { load(); }, [load]);

  // Pre-select currently assigned LO IDs when we toggle to "add" mode
  const assignedIds = new Set(assignments.map(a => a.profile.id));

  async function assignAll() {
    setSaving(true); setMessage(null);
    const r = await fetch("/api/goal-engine/goal-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal_month_id: goalMonthId, assign_all: true }),
    });
    const d = await r.json();
    setMessage({ text: r.ok ? `✓ All ${d.assigned} LOs assigned to this goal.` : (d.error ?? "Failed"), ok: r.ok });
    if (r.ok) await load();
    setSaving(false);
  }

  async function removeOne(profileId: string) {
    setSaving(true); setMessage(null);
    const r = await fetch("/api/goal-engine/goal-assignments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal_month_id: goalMonthId, profile_id: profileId }),
    });
    const d = await r.json();
    setMessage({ text: r.ok ? "✓ Removed from this goal." : (d.error ?? "Failed"), ok: r.ok });
    if (r.ok) await load();
    setSaving(false);
  }

  async function addOne(profileId: string) {
    setSaving(true); setMessage(null);
    const newList = [...Array.from(assignedIds), profileId];
    const r = await fetch("/api/goal-engine/goal-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal_month_id: goalMonthId, profile_ids: newList }),
    });
    const d = await r.json();
    setMessage({ text: r.ok ? "✓ LO added to this goal." : (d.error ?? "Failed"), ok: r.ok });
    if (r.ok) await load();
    setSaving(false);
  }

  async function addSelected() {
    if (selected.size === 0) return;
    setSaving(true); setMessage(null);
    // Build new full list = current assigned + selected
    const newList = [...Array.from(assignedIds), ...Array.from(selected)];
    const r = await fetch("/api/goal-engine/goal-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal_month_id: goalMonthId, profile_ids: newList }),
    });
    const d = await r.json();
    setMessage({ text: r.ok ? `✓ ${d.assigned} LOs now assigned.` : (d.error ?? "Failed"), ok: r.ok });
    if (r.ok) { setSelected(new Set()); await load(); }
    setSaving(false);
  }

  async function clearAll() {
    if (!confirm("Remove ALL assignments from this goal? Participation will fall back to all active LOs.")) return;
    setSaving(true); setMessage(null);
    const r = await fetch("/api/goal-engine/goal-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal_month_id: goalMonthId, profile_ids: [] }),
    });
    const d = await r.json();
    setMessage({ text: r.ok ? "✓ All assignments cleared. Falling back to all active LOs." : (d.error ?? "Failed"), ok: r.ok });
    if (r.ok) await load();
    setSaving(false);
  }

  const filteredUnassigned = unassigned.filter(lo =>
    lo.full_name.toLowerCase().includes(search.toLowerCase()) ||
    lo.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 64px", fontFamily: "Montserrat,system-ui,sans-serif", color: C.ink }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <a href="/goal-engine/admin" style={{ fontSize: 12, fontWeight: 700, color: C.muted, textDecoration: "none" }}>← Manage Goals</a>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg,${C.navy},#1e3a5f)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            👥
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.navy }}>Goal Assignments</h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>
              Control which LOs are expected to produce for this goal. Participation % is calculated only against assigned LOs.
            </p>
          </div>
        </div>
      </div>

      {/* Key concept banner */}
      <div style={{ marginBottom: 20, padding: "14px 18px", borderRadius: 14, background: C.navy, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.3 }}>💡</span>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 800, color: "#fff" }}>Why assignments matter</p>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
            Not every team member produces loan volume. Assigning only production LOs to a goal keeps participation rate
            accurate — managers and ops staff won&apos;t drag down the numbers.
            If no assignments are made, all active loan officers are included (legacy behaviour).
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { l: "Assigned LOs",   v: assignments.length.toString(),                                         accent: true },
          { l: "Unassigned LOs", v: unassigned.length.toString(),                                          warn: assignments.length > 0 },
          { l: "Total LOs",      v: allLOs.length.toString() },
        ].map(s => (
          <div key={s.l} style={{
            padding: "14px 18px", borderRadius: 12,
            background: (s as {accent?:boolean}).accent ? C.navy : C.white,
            border: `1px solid ${(s as {accent?:boolean}).accent ? "transparent" : C.line}`,
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
          }}>
            <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: (s as {accent?:boolean}).accent ? "rgba(255,255,255,0.45)" : C.muted }}>{s.l}</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: (s as {accent?:boolean}).accent ? "#fff" : (s as {warn?:boolean}).warn ? "#d97706" : C.ink }}>{s.v}</p>
          </div>
        ))}
      </div>

      {message && (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 10, background: message.ok ? "#f0fdf4" : "#fff5f5", border: `1.5px solid ${message.ok ? "#86efac" : "#fca5a5"}`, fontSize: 13, fontWeight: 700, color: message.ok ? C.green : "#dc2626" }}>
          {message.text}
        </div>
      )}

      {tableWarning && (
        <div style={{ marginBottom: 16, padding: "14px 18px", borderRadius: 12, background: "#fffbeb", border: "1.5px solid #fcd34d", fontSize: 13, fontWeight: 700, color: "#92400e" }}>
          ⚠ The goal_assignments table is missing. Run the migration in Supabase → SQL Editor. Assignments cannot be saved until then. All LOs are shown below for reference.
        </div>
      )}

      {apiError && (
        <div style={{ marginBottom: 16, padding: "14px 18px", borderRadius: 12, background: "#fff5f5", border: "1.5px solid #fca5a5", fontSize: 13, fontWeight: 700, color: "#dc2626" }}>
          ⚠ Failed to load assignments: {apiError}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontSize: 14, color: C.muted }}>Loading assignments…</p>
        </div>
      ) : (
        <>
          {/* ── Currently Assigned ── */}
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.ink }}>
                  Currently Assigned ({assignments.length})
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>These LOs are expected to commit and produce this month</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={assignAll}
                  disabled={saving}
                  style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,#FF9847,${C.orange})`, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
                >
                  ✓ Assign All LOs
                </button>
                {assignments.length > 0 && (
                  <button
                    onClick={clearAll}
                    disabled={saving}
                    style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.white, color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {assignments.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center" }}>
                <p style={{ margin: "0 0 6px", fontSize: 20 }}>👥</p>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: C.ink }}>No LOs assigned yet</p>
                <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
                  All active loan officers are currently counted for participation.
                  Assign specific LOs below to limit who is held to this goal.
                </p>
              </div>
            ) : (
              <div>
                {assignments.map(a => {
                  const p = a.profile;
                  if (!p) return null;
                  return (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: `1px solid ${C.line}` }}>
                      <Avatar name={p.full_name} url={p.avatar_url} size={36} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.full_name}</p>
                        <p style={{ margin: "1px 0 0", fontSize: 11, color: C.muted }}>{p.email}{p.nmls ? ` · NMLS# ${p.nmls}` : ""}</p>
                      </div>
                      <span style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>
                        Added {new Date(a.assigned_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <button
                        onClick={() => removeOne(p.id)}
                        disabled={saving}
                        style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid #fca5a5`, background: "#fff5f5", color: "#dc2626", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
                      >
                        − Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Add Unassigned LOs ── */}
          {unassigned.length === 0 && allLOs.length > 0 && assignments.length > 0 && (
            <div style={{ padding: "20px", textAlign: "center", background: C.white, border: `1px solid ${C.line}`, borderRadius: 16 }}>
              <p style={{ margin: 0, fontSize: 13, color: C.muted }}>✓ All active LOs are already assigned to this goal.</p>
            </div>
          )}

          {unassigned.length > 0 && (
            <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.ink }}>
                    Available to Add ({unassigned.length})
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>Select LOs to assign to this goal</p>
                </div>
                {selected.size > 0 && (
                  <button
                    onClick={addSelected}
                    disabled={saving}
                    style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,#FF9847,${C.orange})`, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    + Add {selected.size} Selected
                  </button>
                )}
              </div>

              {/* Search */}
              <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.line}` }}>
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${C.line}`, background: C.sand, fontSize: 13, color: C.ink, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                {filteredUnassigned.map(lo => {
                  const checked = selected.has(lo.id);
                  return (
                    <div
                      key={lo.id}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: `1px solid ${C.line}`, background: checked ? "rgba(243,112,33,0.04)" : C.white }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => {
                          const next = new Set(selected);
                          if (e.target.checked) next.add(lo.id); else next.delete(lo.id);
                          setSelected(next);
                        }}
                        style={{ width: 16, height: 16, accentColor: C.orange, flexShrink: 0, cursor: "pointer" }}
                      />
                      <Avatar name={lo.full_name} url={lo.avatar_url} size={34} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: checked ? C.orange : C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lo.full_name}</p>
                        <p style={{ margin: "1px 0 0", fontSize: 11, color: C.muted }}>{lo.email}{lo.nmls ? ` · NMLS# ${lo.nmls}` : ""}</p>
                      </div>
                      <button
                        onClick={() => addOne(lo.id)}
                        disabled={saving}
                        style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid #86efac`, background: "#f0fdf4", color: "#16a34a", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
                      >
                        + Add
                      </button>
                    </div>
                  );
                })}
                {filteredUnassigned.length === 0 && (
                  <p style={{ padding: "24px 20px", textAlign: "center", fontSize: 13, color: C.muted }}>
                    {search ? `No results for "${search}"` : "All active LOs are already assigned."}
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
