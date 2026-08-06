/**
 * /goal-engine/admin/production — Production Corrections
 * Admin-only. Loan Officers cannot access.
 * Full audit trail of every production event change.
 */

"use client";

import { useState, useEffect, useCallback } from "react";

const C = {
  navy:   "#142850",
  orange: "#F37021",
  ink:    "#1A2B42",
  muted:  "#64748B",
  line:   "#E2E8F0",
  sand:   "#F8FAFC",
  white:  "#ffffff",
  green:  "#16a34a",
  yellow: "#d97706",
  red:    "#dc2626",
};

const CARD: React.CSSProperties = {
  background: C.white,
  border: `1px solid ${C.line}`,
  borderRadius: 16,
  padding: "24px",
  boxShadow: "0 1px 6px rgba(15,23,42,0.06)",
  marginBottom: 20,
};

const LABEL: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: ".14em",
  textTransform: "uppercase" as const,
  color: C.muted,
};

const INPUT: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: `1.5px solid ${C.line}`,
  background: C.white,
  fontSize: 13,
  color: C.ink,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box" as const,
};

const TYPE_META: Record<string, { label: string; color: string; icon: string; description: string }> = {
  manual_add: { label: "Manual Add",  color: "#3b82f6", icon: "➕", description: "Manually create a new production event for an LO" },
  correction: { label: "Correction",  color: C.yellow,  icon: "✏️", description: "Correct values on an existing production event" },
  reversal:   { label: "Reversal",    color: C.red,     icon: "↩️", description: "Reverse/negate an existing event (creates an offsetting entry)" },
  reassign:   { label: "Reassign",    color: "#8b5cf6", icon: "🔁", description: "Move an event from one LO to another" },
  exclude:    { label: "Exclude",     color: C.muted,   icon: "🚫", description: "Mark an event as excluded from production totals" },
  unexclude:  { label: "Re-include",  color: C.green,   icon: "✅", description: "Re-include a previously excluded event" },
};

type ProdRow = {
  id: string;
  profile_id: string;
  funded_volume: number | null;
  funded_unit: number;
  funded_date: string | null;
  app_volume: number | null;
  app_unit: number;
  source: string;
  loan_id: string | null;
  is_excluded: boolean;
  is_correction: boolean;
  correction_type: string | null;
  created_at: string;
  profile?: { id: string; full_name: string; avatar_url: string | null; nmls: string | null };
};

type CorrRow = {
  id: string;
  correction_type: string;
  reason: string;
  before_val: Record<string, unknown> | null;
  after_val:  Record<string, unknown> | null;
  loan_id: string | null;
  created_at: string;
  admin: { id: string; full_name: string; avatar_url: string | null } | null;
  target: { id: string; full_name: string } | null;
};

function fmt$(n: number | null): string {
  if (n == null) return "$0";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

function TypeBadge({ type }: { type: string }) {
  const m = TYPE_META[type] ?? { label: type, color: C.muted, icon: "•" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 99,
      fontSize: 10, fontWeight: 800,
      background: `${m.color}18`, color: m.color,
      border: `1px solid ${m.color}40`,
    }}>
      {m.icon} {m.label}
    </span>
  );
}

function Initials({ name }: { name: string }) {
  return <>{name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join("").toUpperCase()}</>;
}

function Avatar({ name, url, size = 32 }: { name: string; url?: string | null; size?: number }) {
  return url
    ? <img src={url} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
    : <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#FF9847,#F37021)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
        <Initials name={name} />
      </div>;
}

export default function ProductionCorrectionsPage() {
  const [production,   setProduction]   = useState<ProdRow[]>([]);
  const [corrections,  setCorrections]  = useState<CorrRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState<"events" | "audit">("events");
  const [showForm,     setShowForm]     = useState(false);
  const [formType,     setFormType]     = useState<string>("manual_add");
  const [selectedEvent, setSelectedEvent] = useState<ProdRow | null>(null);

  // Form fields
  const [reason,          setReason]          = useState("");
  const [targetProfileId, setTargetProfileId] = useState("");
  const [newProfileId,    setNewProfileId]    = useState("");
  const [loanId,          setLoanId]          = useState("");
  const [fundedVolume,    setFundedVolume]     = useState("");
  const [fundedUnit,      setFundedUnit]       = useState("1");
  const [fundedDate,      setFundedDate]       = useState("");
  const [appVolume,       setAppVolume]        = useState("");
  const [appUnit,         setAppUnit]          = useState("0");
  const [appDate,         setAppDate]          = useState("");
  const [submitting,      setSubmitting]       = useState(false);
  const [formError,       setFormError]        = useState<string | null>(null);
  const [formSuccess,     setFormSuccess]      = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/goal-engine/production-corrections", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) { console.error(d.error); return; }
      setProduction(d.production ?? []);
      setCorrections(d.corrections ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openForm(type: string, event?: ProdRow) {
    setFormType(type);
    setSelectedEvent(event ?? null);
    setReason("");
    setTargetProfileId(event?.profile_id ?? "");
    setNewProfileId("");
    setLoanId(event?.loan_id ?? "");
    setFundedVolume(event?.funded_volume?.toString() ?? "");
    setFundedUnit(event?.funded_unit?.toString() ?? "1");
    setFundedDate(event?.funded_date ?? "");
    setAppVolume(event?.app_volume?.toString() ?? "");
    setAppUnit(event?.app_unit?.toString() ?? "0");
    setAppDate("");
    setFormError(null);
    setFormSuccess(null);
    setShowForm(true);
  }

  async function submitCorrection(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (reason.trim().length < 10) { setFormError("Reason must be at least 10 characters."); return; }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        correction_type:   formType,
        reason:            reason.trim(),
        goal_month_id:     production[0]?.profile?.id ? undefined : undefined, // will be set below
        target_profile_id: targetProfileId || undefined,
        event_id:          selectedEvent?.id ?? undefined,
        loan_id:           loanId || undefined,
        new_profile_id:    newProfileId || undefined,
        funded_volume:     fundedVolume ? Number(fundedVolume) : undefined,
        funded_unit:       fundedUnit   ? Number(fundedUnit)   : undefined,
        funded_date:       fundedDate   || undefined,
        app_volume:        appVolume    ? Number(appVolume)    : undefined,
        app_unit:          appUnit      ? Number(appUnit)      : undefined,
        app_date:          appDate      || undefined,
        source:            "manual",
      };

      // Derive goal_month_id from selected event or first production row
      const gm = selectedEvent
        ? (production.find(p => p.id === selectedEvent.id) as ProdRow & { goal_month_id?: string })?.goal_month_id
        : undefined;
      if (gm) body.goal_month_id = gm;

      // Fallback — call the API without goal_month_id and let it derive it
      const res = await fetch("/api/goal-engine/production-corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? "Failed."); return; }
      setFormSuccess("Correction saved successfully.");
      setShowForm(false);
      await load();
    } catch { setFormError("Network error."); }
    finally { setSubmitting(false); }
  }

  const needsEvent    = ["correction","reversal","reassign","exclude","unexclude"].includes(formType);
  const isManualAdd   = formType === "manual_add";
  const isReassign    = formType === "reassign";
  const showValueEdit = ["manual_add","correction"].includes(formType);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 64px", fontFamily: "Montserrat,system-ui,sans-serif", color: C.ink }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <a href="/goal-engine/admin" style={{ fontSize: 12, fontWeight: 700, color: C.muted, textDecoration: "none" }}>← Manage Goals</a>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.orange}, #FF9847)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔧</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: C.ink }}>Production Corrections</h1>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>Admin-only · every change is logged · Loan Officers cannot access this page</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => openForm("manual_add")}
          style={{
            padding: "11px 22px", borderRadius: 12,
            background: `linear-gradient(135deg, #FF9847, ${C.orange})`,
            color: "#fff", border: "none",
            fontSize: 13, fontWeight: 800, cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 4px 14px rgba(243,112,33,0.35)",
          }}
        >
          + New Production Event
        </button>
      </div>

      {/* ── Correction type legend ── */}
      <div style={{ ...CARD, padding: "16px 20px" }}>
        <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: C.muted }}>
          Correction Types
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(TYPE_META).map(([k, m]) => (
            <div key={k} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", borderRadius: 10, background: C.sand, border: `1px solid ${C.line}`, maxWidth: 220 }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{m.icon}</span>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 800, color: m.color }}>{m.label}</p>
                <p style={{ margin: 0, fontSize: 10, color: C.muted, lineHeight: 1.4 }}>{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mandatory notice ── */}
      <div style={{ marginBottom: 20, padding: "14px 18px", borderRadius: 12, background: "#fffbeb", border: "1.5px solid #fed7aa", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 800, color: "#92400e" }}>Production data is protected</p>
          <p style={{ margin: 0, fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
            Loan Officers cannot edit production totals. Every administrator correction requires a reason,
            is timestamped, and records the before/after values. Silent edits are not permitted.
            The audit log is permanent.
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {[
          { id: "events" as const, label: `Production Events (${production.length})` },
          { id: "audit"  as const, label: `Audit Log (${corrections.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "9px 18px", borderRadius: 10,
            border: `1.5px solid ${tab === t.id ? C.orange : C.line}`,
            background: tab === t.id ? "rgba(243,112,33,0.07)" : C.white,
            color: tab === t.id ? C.orange : C.muted,
            fontSize: 13, fontWeight: 800,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {formSuccess && (
        <div style={{ marginBottom: 16, padding: "12px 18px", borderRadius: 10, background: "#f0fdf4", border: "1.5px solid #86efac", fontSize: 13, fontWeight: 700, color: C.green }}>
          ✓ {formSuccess}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ fontSize: 14, color: C.muted }}>Loading production data…</p>
        </div>
      ) : tab === "events" ? (
        /* ── Events table ── */
        <div style={{ ...CARD, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.ink }}>All Production Events</p>
            <span style={{ fontSize: 11, color: C.muted }}>{production.length} records</span>
          </div>
          {production.length === 0 ? (
            <p style={{ padding: "40px 24px", textAlign: "center", fontSize: 14, color: C.muted }}>No production events for this goal.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
                <thead>
                  <tr style={{ background: C.sand }}>
                    {["Loan Officer","Funded Vol","Units","Funded Date","App Vol","App Units","Source","Loan ID","Type","Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", fontSize: 9, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, textAlign: "left", borderBottom: `1px solid ${C.line}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {production.map(row => (
                    <tr key={row.id} style={{ borderBottom: `1px solid ${C.line}`, background: row.is_excluded ? "#fafafa" : C.white, opacity: row.is_excluded ? 0.6 : 1 }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar name={row.profile?.full_name ?? "?"} url={row.profile?.avatar_url} size={28} />
                          <div>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: C.ink }}>{row.profile?.full_name ?? "—"}</p>
                            {row.profile?.nmls && <p style={{ margin: 0, fontSize: 9, color: C.muted }}>NMLS# {row.profile.nmls}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: row.funded_volume && row.funded_volume < 0 ? C.red : C.ink }}>{fmt$(row.funded_volume)}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: C.ink }}>{row.funded_unit}</td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: C.muted }}>{row.funded_date ?? "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: C.ink }}>{fmt$(row.app_volume)}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: C.ink }}>{row.app_unit}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: 99, background: C.sand, fontSize: 10, fontWeight: 700, color: C.muted }}>{row.source}</span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 11, color: C.muted, fontFamily: "monospace" }}>{row.loan_id ? row.loan_id.slice(0, 12) + "…" : "—"}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          {row.is_excluded && <span style={{ padding: "2px 8px", borderRadius: 99, background: "#fee2e2", color: C.red, fontSize: 10, fontWeight: 800 }}>🚫 Excluded</span>}
                          {row.is_correction && row.correction_type && <TypeBadge type={row.correction_type} />}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <button onClick={() => openForm("correction", row)} style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${C.line}`, background: C.white, fontSize: 10, fontWeight: 700, color: C.ink, cursor: "pointer", fontFamily: "inherit" }}>
                            ✏️ Correct
                          </button>
                          <button onClick={() => openForm("reversal", row)} style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid #fecaca`, background: "#fff5f5", fontSize: 10, fontWeight: 700, color: C.red, cursor: "pointer", fontFamily: "inherit" }}>
                            ↩️ Reverse
                          </button>
                          {!row.is_excluded
                            ? <button onClick={() => openForm("exclude", row)} style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${C.line}`, background: C.white, fontSize: 10, fontWeight: 700, color: C.muted, cursor: "pointer", fontFamily: "inherit" }}>🚫 Exclude</button>
                            : <button onClick={() => openForm("unexclude", row)} style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid #bbf7d0`, background: "#f0fdf4", fontSize: 10, fontWeight: 700, color: C.green, cursor: "pointer", fontFamily: "inherit" }}>✅ Include</button>
                          }
                          <button onClick={() => openForm("reassign", row)} style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid #e9d5ff`, background: "#faf5ff", fontSize: 10, fontWeight: 700, color: "#7c3aed", cursor: "pointer", fontFamily: "inherit" }}>
                            🔁 Reassign
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ── Audit log ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {corrections.length === 0 ? (
            <div style={{ ...CARD, textAlign: "center", padding: "48px 24px" }}>
              <p style={{ fontSize: 36, margin: "0 0 12px" }}>📋</p>
              <p style={{ margin: 0, fontSize: 14, color: C.muted }}>No corrections recorded yet. All administrator changes will appear here.</p>
            </div>
          ) : corrections.map(c => {
            const m = TYPE_META[c.correction_type] ?? { icon: "•", color: C.muted, label: c.correction_type };
            return (
              <div key={c.id} style={{
                background: C.white,
                border: `1px solid ${C.line}`,
                borderRadius: 14,
                padding: "16px 20px",
                borderLeft: `4px solid ${m.color}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1 }}>
                    <span style={{ fontSize: 20, lineHeight: 1.3, flexShrink: 0 }}>{m.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <TypeBadge type={c.correction_type} />
                        {c.target && (
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>
                            → {c.target.full_name}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1.5 }}>
                        &ldquo;{c.reason}&rdquo;
                      </p>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        {c.before_val?.funded_volume != null && (
                          <span style={{ fontSize: 11, color: C.muted }}>
                            Before: <strong style={{ color: C.ink }}>{fmt$(c.before_val.funded_volume as number)}</strong>
                          </span>
                        )}
                        {c.after_val?.funded_volume != null && (
                          <span style={{ fontSize: 11, color: C.muted }}>
                            After: <strong style={{ color: C.green }}>{fmt$(c.after_val.funded_volume as number)}</strong>
                          </span>
                        )}
                        {c.loan_id && (
                          <span style={{ fontSize: 11, color: C.muted }}>Loan: <strong style={{ fontFamily: "monospace", color: C.ink }}>{c.loan_id}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {c.admin && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginBottom: 4 }}>
                        <Avatar name={c.admin.full_name} url={c.admin.avatar_url} size={22} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>{c.admin.full_name}</span>
                      </div>
                    )}
                    <p style={{ margin: 0, fontSize: 10, color: C.muted }}>
                      {new Date(c.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Correction Form Modal ── */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.5)" }} onClick={() => setShowForm(false)} />
          <div style={{
            position: "relative", width: "100%", maxWidth: 560, maxHeight: "90vh",
            background: C.white, borderRadius: 20, overflow: "hidden",
            boxShadow: "0 20px 60px rgba(15,23,42,0.25)",
          }}>
            {/* Modal header */}
            <div style={{
              padding: "20px 24px",
              borderBottom: `1px solid ${C.line}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderTop: `4px solid ${TYPE_META[formType]?.color ?? C.orange}`,
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{TYPE_META[formType]?.icon ?? "🔧"}</span>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: C.ink }}>
                    {TYPE_META[formType]?.label ?? formType}
                  </h2>
                </div>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{TYPE_META[formType]?.description}</p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: 20, color: C.muted, cursor: "pointer" }}>✕</button>
            </div>

            {/* Modal body */}
            <form onSubmit={submitCorrection} style={{ overflowY: "auto", maxHeight: "calc(90vh - 130px)", padding: "24px" }}>

              {/* Selected event banner */}
              {selectedEvent && (
                <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 10, background: C.sand, border: `1px solid ${C.line}` }}>
                  <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted }}>Target Event</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.ink }}>
                    {selectedEvent.profile?.full_name ?? "Unknown"} · {fmt$(selectedEvent.funded_volume)} · {selectedEvent.funded_date ?? "no date"}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, fontFamily: "monospace", color: C.muted }}>{selectedEvent.id}</p>
                </div>
              )}

              {/* Target profile (for manual_add) */}
              {isManualAdd && (
                <div style={{ marginBottom: 16 }}>
                  <label style={LABEL}>Loan Officer Profile ID *</label>
                  <input style={INPUT} value={targetProfileId} onChange={e => setTargetProfileId(e.target.value)}
                    placeholder="UUID from profiles table"
                    onFocus={e => e.target.style.borderColor = C.orange}
                    onBlur={e => e.target.style.borderColor = C.line}
                    required />
                </div>
              )}

              {/* Reassign target */}
              {isReassign && (
                <div style={{ marginBottom: 16 }}>
                  <label style={LABEL}>Reassign To (Profile ID) *</label>
                  <input style={INPUT} value={newProfileId} onChange={e => setNewProfileId(e.target.value)}
                    placeholder="UUID of new Loan Officer"
                    onFocus={e => e.target.style.borderColor = C.orange}
                    onBlur={e => e.target.style.borderColor = C.line}
                    required />
                </div>
              )}

              {/* Value fields for add/correction */}
              {showValueEdit && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={LABEL}>Funded Volume ($)</label>
                    <input type="number" min={0} style={INPUT} value={fundedVolume} onChange={e => setFundedVolume(e.target.value)}
                      placeholder="0" onFocus={e => e.target.style.borderColor = C.orange} onBlur={e => e.target.style.borderColor = C.line} />
                  </div>
                  <div>
                    <label style={LABEL}>Funded Units</label>
                    <input type="number" min={0} style={INPUT} value={fundedUnit} onChange={e => setFundedUnit(e.target.value)}
                      placeholder="1" onFocus={e => e.target.style.borderColor = C.orange} onBlur={e => e.target.style.borderColor = C.line} />
                  </div>
                  <div>
                    <label style={LABEL}>Funded Date</label>
                    <input type="date" style={INPUT} value={fundedDate} onChange={e => setFundedDate(e.target.value)}
                      onFocus={e => e.target.style.borderColor = C.orange} onBlur={e => e.target.style.borderColor = C.line} />
                  </div>
                  <div>
                    <label style={LABEL}>Loan ID</label>
                    <input style={INPUT} value={loanId} onChange={e => setLoanId(e.target.value)}
                      placeholder="ARIVE or internal ID" onFocus={e => e.target.style.borderColor = C.orange} onBlur={e => e.target.style.borderColor = C.line} />
                  </div>
                  <div>
                    <label style={LABEL}>App Volume ($)</label>
                    <input type="number" min={0} style={INPUT} value={appVolume} onChange={e => setAppVolume(e.target.value)}
                      placeholder="0" onFocus={e => e.target.style.borderColor = C.orange} onBlur={e => e.target.style.borderColor = C.line} />
                  </div>
                  <div>
                    <label style={LABEL}>App Units</label>
                    <input type="number" min={0} style={INPUT} value={appUnit} onChange={e => setAppUnit(e.target.value)}
                      placeholder="0" onFocus={e => e.target.style.borderColor = C.orange} onBlur={e => e.target.style.borderColor = C.line} />
                  </div>
                </div>
              )}

              {/* Reason — always required */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ ...LABEL, color: C.red }}>Reason (Required — min 10 characters) *</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Explain why this correction is being made. This is permanently recorded."
                  style={{ ...INPUT, resize: "none" as const }}
                  onFocus={e => e.target.style.borderColor = C.orange}
                  onBlur={e => e.target.style.borderColor = C.line}
                  required
                />
                <p style={{ margin: "4px 0 0", fontSize: 10, color: reason.length < 10 ? C.red : C.green, fontWeight: 700 }}>
                  {reason.length} / 10 minimum characters
                </p>
              </div>

              {formError && (
                <div style={{ marginBottom: 14, padding: "11px 16px", borderRadius: 10, background: "#fff5f5", border: "1.5px solid #fca5a5", fontSize: 13, fontWeight: 700, color: C.red }}>
                  ⚠️ {formError}
                </div>
              )}

              <button type="submit" disabled={submitting || reason.trim().length < 10} style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: submitting || reason.trim().length < 10 ? "#CBD5E1" : `linear-gradient(135deg, #FF9847, ${C.orange})`,
                color: "#fff", fontSize: 14, fontWeight: 900,
                cursor: submitting || reason.trim().length < 10 ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                boxShadow: submitting || reason.trim().length < 10 ? "none" : "0 6px 20px rgba(243,112,33,0.35)",
              }}>
                {submitting ? "Saving…" : `Save ${TYPE_META[formType]?.label ?? "Correction"}`}
              </button>

              <p style={{ margin: "10px 0 0", fontSize: 11, color: C.muted, textAlign: "center", lineHeight: 1.5 }}>
                This action will be permanently recorded in the audit log with your name and timestamp.
              </p>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          table { font-size: 11px !important; }
        }
      `}</style>
    </div>
  );
}
