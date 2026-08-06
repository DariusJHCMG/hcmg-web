"use client";

/**
 * /goal-engine/admin/coaching
 * Manager coaching notes — write, view, and track action items per LO.
 * DB tables: coaching_notes, coaching_actions (both exist from v3 migration).
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const C = {
  navy:    "#142850",
  orange:  "#F37021",
  ink:     "#1A2B42",
  muted:   "#64748B",
  line:    "#E2E8F0",
  sand:    "#F8FAFC",
  white:   "#ffffff",
  green:   "#16a34a",
  red:     "#dc2626",
};

const NOTE_TYPES = [
  { value: "general",          label: "General",          color: "#3b82d4", bg: "#eff6ff" },
  { value: "performance",      label: "Performance",      color: "#d97706", bg: "#fffbeb" },
  { value: "encouragement",    label: "Encouragement",    color: "#16a34a", bg: "#f0fdf4" },
  { value: "action_required",  label: "Action Required",  color: "#dc2626", bg: "#fef2f2" },
  { value: "follow_up",        label: "Follow Up",        color: "#7c5cd8", bg: "#faf5ff" },
] as const;

type NoteType = typeof NOTE_TYPES[number]["value"];

type LORow = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  nmls: string | null;
};

type ActionItem = {
  id: string;
  action_text: string;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
};

type NoteRow = {
  id: string;
  employee_id: string;
  note_type: NoteType;
  is_private: boolean;
  note: string;
  coaching_date: string;
  follow_up_date: string | null;
  created_at: string;
  employee: { full_name: string; avatar_url: string | null };
  actions: ActionItem[];
};

function Avatar({ name, url, size = 32 }: { name: string; url?: string | null; size?: number }) {
  return url
    ? <img src={url} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${C.line}` }} />
    : <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,#FF9847,${C.orange})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
        {name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join("").toUpperCase()}
      </div>;
}

function NoteTypeBadge({ type }: { type: NoteType }) {
  const t = NOTE_TYPES.find(n => n.value === type) ?? NOTE_TYPES[0];
  return (
    <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 10, fontWeight: 800, background: t.bg, color: t.color, border: `1px solid ${t.color}30` }}>
      {t.label}
    </span>
  );
}

export default function CoachingNotesPage() {
  const [los,          setLos]          = useState<LORow[]>([]);
  const [notes,        setNotes]        = useState<NoteRow[]>([]);
  const [selectedLO,   setSelectedLO]   = useState<string>("all");
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [msg,          setMsg]          = useState<{ text: string; ok: boolean } | null>(null);

  // Form state
  const [fLO,          setFLO]          = useState("");
  const [fType,        setFType]        = useState<NoteType>("general");
  const [fNote,        setFNote]        = useState("");
  const [fFollowUp,    setFFollowUp]    = useState("");
  const [fPrivate,     setFPrivate]     = useState(false);
  const [fActions,     setFActions]     = useState<string[]>([""]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rLOs, rNotes] = await Promise.all([
        fetch("/api/goal-engine/profiles-list").then(r => r.json()),
        fetch("/api/goal-engine/coaching-notes").then(r => r.json()),
      ]);
      setLos(rLOs.profiles ?? []);
      setNotes(rNotes.notes ?? []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!fLO || !fNote.trim()) return;
    setSaving(true); setMsg(null);
    try {
      const res = await fetch("/api/goal-engine/coaching-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id:    fLO,
          note_type:      fType,
          note:           fNote.trim(),
          follow_up_date: fFollowUp || null,
          is_private:     fPrivate,
          actions:        fActions.filter(a => a.trim()),
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg({ text: "✓ Note saved.", ok: true });
        setShowForm(false);
        setFLO(""); setFType("general"); setFNote(""); setFFollowUp(""); setFPrivate(false); setFActions([""]);
        await load();
      } else {
        setMsg({ text: d.error ?? "Failed to save note.", ok: false });
      }
    } catch (err) {
      setMsg({ text: String(err), ok: false });
    }
    setSaving(false);
  }

  async function toggleAction(noteId: string, actionId: string, completed: boolean) {
    await fetch("/api/goal-engine/coaching-notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action_id: actionId, completed }),
    });
    await load();
  }

  async function deleteNote(noteId: string) {
    if (!confirm("Delete this coaching note?")) return;
    await fetch("/api/goal-engine/coaching-notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note_id: noteId }),
    });
    await load();
  }

  const filteredNotes = selectedLO === "all"
    ? notes
    : notes.filter(n => n.employee_id === selectedLO);

  const openActions  = notes.flatMap(n => n.actions).filter(a => !a.completed).length;
  const notesByType  = NOTE_TYPES.map(t => ({ ...t, count: notes.filter(n => n.note_type === t.value).length }));

  const INPUT: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1.5px solid ${C.line}`, background: C.white,
    fontSize: 13, color: C.ink, fontFamily: "inherit", outline: "none",
    boxSizing: "border-box",
  };
  const LABEL: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 700, color: C.ink,
    marginBottom: 6, textTransform: "uppercase", letterSpacing: ".08em",
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 64px", fontFamily: "Montserrat,system-ui,sans-serif", color: C.ink }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Link href="/goal-engine/admin" style={{ fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: "none" }}>← Admin</Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${C.navy},#1e3a5f)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              📝
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: C.navy }}>Coaching Notes</h1>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>
                {loading ? "Loading…" : `${notes.length} notes · ${openActions} open action items`}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          style={{
            padding: "12px 22px", borderRadius: 12,
            border: showForm ? `1.5px solid ${C.line}` : "none",
            background: showForm ? C.sand : `linear-gradient(135deg,#FF9847,${C.orange})`,
            color: showForm ? C.muted : "#fff",
            fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
          } as React.CSSProperties}
        >
          {showForm ? "✕ Cancel" : "+ New Note"}
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 24 }} className="coaching-grid-5">
        {notesByType.map(t => (
          <div key={t.value} style={{ background: t.bg, border: `1px solid ${t.color}25`, borderRadius: 12, padding: "12px 14px" }}>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: t.color }}>{t.label}</p>
            <p style={{ margin: "5px 0 0", fontSize: 22, fontWeight: 900, color: t.color }}>{t.count}</p>
          </div>
        ))}
      </div>

      {/* Message */}
      {msg && (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 10, background: msg.ok ? "#f0fdf4" : "#fef2f2", border: `1.5px solid ${msg.ok ? "#86efac" : "#fca5a5"}`, fontSize: 13, fontWeight: 700, color: msg.ok ? C.green : C.red }}>
          {msg.text}
        </div>
      )}

      {/* New Note Form */}
      {showForm && (
        <form onSubmit={submitNote} style={{ background: C.white, border: `1.5px solid ${C.orange}`, borderRadius: 16, padding: "24px 28px", marginBottom: 24 }}>
          <p style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 800, color: C.ink }}>📝 New Coaching Note</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }} className="coaching-form-grid">
            <div>
              <label style={LABEL}>Loan Officer *</label>
              <select value={fLO} onChange={e => setFLO(e.target.value)} required style={{ ...INPUT, appearance: "none" }}>
                <option value="">Select LO…</option>
                {los.map(lo => (
                  <option key={lo.id} value={lo.id}>{lo.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={LABEL}>Note Type</label>
              <select value={fType} onChange={e => setFType(e.target.value as NoteType)} style={{ ...INPUT, appearance: "none" }}>
                {NOTE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Note *</label>
            <textarea
              value={fNote} onChange={e => setFNote(e.target.value)} required
              rows={4} placeholder="Coaching observation, feedback, or discussion summary…"
              style={{ ...INPUT, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }} className="coaching-form-grid">
            <div>
              <label style={LABEL}>Follow-Up Date</label>
              <input type="date" value={fFollowUp} onChange={e => setFFollowUp(e.target.value)} style={INPUT} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 24 }}>
              <input
                type="checkbox" id="is-private" checked={fPrivate}
                onChange={e => setFPrivate(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: C.orange }}
              />
              <label htmlFor="is-private" style={{ fontSize: 13, cursor: "pointer", userSelect: "none" }}>
                Private (only admins can see)
              </label>
            </div>
          </div>

          {/* Action Items */}
          <div style={{ marginBottom: 20 }}>
            <label style={LABEL}>Action Items</label>
            {fActions.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  value={a}
                  onChange={e => { const n = [...fActions]; n[i] = e.target.value; setFActions(n); }}
                  placeholder={`Action item ${i + 1}…`}
                  style={{ ...INPUT, flex: 1 }}
                />
                {fActions.length > 1 && (
                  <button type="button" onClick={() => setFActions(fActions.filter((_, j) => j !== i))}
                    style={{ padding: "0 12px", borderRadius: 8, border: `1px solid ${C.line}`, background: C.sand, color: C.muted, cursor: "pointer", fontSize: 14 }}>
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setFActions([...fActions, ""])}
              style={{ fontSize: 12, fontWeight: 700, color: C.orange, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
              + Add action item
            </button>
          </div>

          <button type="submit" disabled={saving || !fLO || !fNote.trim()} style={{
            padding: "12px 28px", borderRadius: 12, border: "none",
            background: (!fLO || !fNote.trim()) ? C.line : `linear-gradient(135deg,#FF9847,${C.orange})`,
            color: (!fLO || !fNote.trim()) ? C.muted : "#fff",
            fontSize: 13, fontWeight: 800, cursor: (!fLO || !fNote.trim()) ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}>
            {saving ? "Saving…" : "💾 Save Note"}
          </button>
        </form>
      )}

      {/* LO Filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <button
          onClick={() => setSelectedLO("all")}
          style={{
            padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 700,
            border: `1.5px solid ${selectedLO === "all" ? C.orange : C.line}`,
            background: selectedLO === "all" ? "rgba(243,112,33,0.08)" : C.white,
            color: selectedLO === "all" ? C.orange : C.muted, cursor: "pointer", fontFamily: "inherit",
          }}>
          All LOs ({notes.length})
        </button>
        {los.filter(lo => notes.some(n => n.employee_id === lo.id)).map(lo => {
          const count = notes.filter(n => n.employee_id === lo.id).length;
          const active = selectedLO === lo.id;
          return (
            <button key={lo.id} onClick={() => setSelectedLO(lo.id)} style={{
              padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 700,
              border: `1.5px solid ${active ? C.orange : C.line}`,
              background: active ? "rgba(243,112,33,0.08)" : C.white,
              color: active ? C.orange : C.muted, cursor: "pointer", fontFamily: "inherit",
            }}>
              {lo.full_name.split(" ")[0]} ({count})
            </button>
          );
        })}
      </div>

      {/* Notes list */}
      {loading ? (
        <p style={{ textAlign: "center", padding: "48px 0", color: C.muted }}>Loading notes…</p>
      ) : filteredNotes.length === 0 ? (
        <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 20, padding: "56px 32px", textAlign: "center" }}>
          <p style={{ fontSize: 40, margin: "0 0 14px" }}>📝</p>
          <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: C.ink }}>No Notes Yet</h2>
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Coaching notes will appear here once you add them.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filteredNotes.map(note => {
            const openItems = note.actions.filter(a => !a.completed);
            const doneItems = note.actions.filter(a => a.completed);
            const isOverdue = note.follow_up_date && new Date(note.follow_up_date) < new Date() && !note.actions.every(a => a.completed);
            return (
              <div key={note.id} style={{
                background: C.white, border: `1px solid ${isOverdue ? "#fca5a5" : C.line}`,
                borderRadius: 16, overflow: "hidden",
                boxShadow: "0 1px 6px rgba(15,23,42,0.05)",
              }}>
                {/* Note header */}
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                    <Avatar name={note.employee.full_name} url={note.employee.avatar_url} size={38} />
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.ink }}>{note.employee.full_name}</p>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
                        <NoteTypeBadge type={note.note_type} />
                        <span style={{ fontSize: 11, color: C.muted }}>
                          {new Date(note.coaching_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        {note.is_private && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#7c5cd8", background: "#faf5ff", padding: "1px 7px", borderRadius: 99 }}>🔒 Private</span>
                        )}
                        {note.follow_up_date && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: isOverdue ? C.red : C.muted, background: isOverdue ? "#fef2f2" : C.sand, padding: "1px 7px", borderRadius: 99, border: `1px solid ${isOverdue ? "#fca5a5" : C.line}` }}>
                            {isOverdue ? "⚠ " : "📅 "}Follow-up: {new Date(note.follow_up_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteNote(note.id)} style={{
                    padding: "5px 12px", borderRadius: 8, border: `1px solid ${C.line}`,
                    background: C.sand, color: C.muted, fontSize: 11, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                  }}>
                    Delete
                  </button>
                </div>

                {/* Note body */}
                <div style={{ padding: "16px 20px" }}>
                  <p style={{ margin: 0, fontSize: 14, color: C.ink, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{note.note}</p>
                </div>

                {/* Action items */}
                {note.actions.length > 0 && (
                  <div style={{ padding: "0 20px 16px" }}>
                    <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted }}>
                      Action Items · {openItems.length} open · {doneItems.length} done
                    </p>
                    {note.actions.map(action => (
                      <div key={action.id} style={{
                        display: "flex", alignItems: "flex-start", gap: 10,
                        padding: "8px 12px", borderRadius: 10,
                        background: action.completed ? "#f0fdf4" : C.sand,
                        border: `1px solid ${action.completed ? "#86efac" : C.line}`,
                        marginBottom: 6,
                      }}>
                        <input
                          type="checkbox"
                          checked={action.completed}
                          onChange={e => toggleAction(note.id, action.id, e.target.checked)}
                          style={{ width: 15, height: 15, accentColor: C.green, flexShrink: 0, marginTop: 2 }}
                        />
                        <span style={{
                          fontSize: 13, color: action.completed ? C.muted : C.ink,
                          textDecoration: action.completed ? "line-through" : "none",
                          flex: 1, lineHeight: 1.5,
                        }}>
                          {action.action_text}
                        </span>
                        {action.due_date && (
                          <span style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>
                            Due {new Date(action.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width:700px) {
          .coaching-grid-5 { grid-template-columns:repeat(3,1fr) !important; }
          .coaching-form-grid { grid-template-columns:1fr !important; }
        }
        @media (max-width:480px) {
          .coaching-grid-5 { grid-template-columns:repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  );
}
