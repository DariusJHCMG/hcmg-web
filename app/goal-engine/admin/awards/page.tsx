/**
 * /goal-engine/admin/awards — Admin Awards Locker Room
 * All-time award archive, sortable by LO / month / award type.
 * Admin access only. Share button per award.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

const AWARD_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  "🏆": { bg:"#fffbeb", border:"#fde68a", text:"#92400e" },
  "🔥": { bg:"#fff7ed", border:"#fed7aa", text:"#9a3412" },
  "💰": { bg:"#f0fdf4", border:"#bbf7d0", text:"#166534" },
  "🎯": { bg:"#eff6ff", border:"#bfdbfe", text:"#1e40af" },
  "👑": { bg:"#faf5ff", border:"#d8b4fe", text:"#6b21a8" },
  "📈": { bg:"#ecfdf5", border:"#a7f3d0", text:"#065f46" },
  "⚡": { bg:"#fef9c3", border:"#fde047", text:"#854d0e" },
};
function awardStyle(emoji: string | null) {
  return AWARD_STYLES[emoji ?? "🏆"] ?? { bg:"#fffbeb", border:"#fde68a", text:"#92400e" };
}

type AwardRow = {
  id: string;
  award_type: string;
  award_label: string;
  award_emoji: string;
  issued_at: string;
  email_sent: boolean;
  stats_snapshot: Record<string, unknown> | null;
  profiles: { full_name: string; avatar_url: string | null } | null;
  goal_months: { month_label: string; month_year: number; month_num: number } | null;
};

type SortKey = "issued_at" | "full_name" | "month" | "award_label";

export default function AdminAwardsPage() {
  const [awards,   setAwards]   = useState<AwardRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [sort,     setSort]     = useState<SortKey>("issued_at");
  const [filterLO, setFilterLO] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterType,  setFilterType]  = useState("");
  const [copied,   setCopied]   = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/goal-engine/awards/all")
      .then(r => r.json())
      .then(d => { setAwards(d.awards ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Unique filter options
  const loNames    = [...new Set(awards.map(a => a.profiles?.full_name).filter(Boolean))].sort() as string[];
  const months     = [...new Set(awards.map(a => a.goal_months?.month_label).filter(Boolean))].sort() as string[];
  const awardTypes = [...new Set(awards.map(a => a.award_label))].sort();

  // Filter
  const filtered = awards.filter(a => {
    if (filterLO    && a.profiles?.full_name !== filterLO)        return false;
    if (filterMonth && a.goal_months?.month_label !== filterMonth) return false;
    if (filterType  && a.award_label !== filterType)               return false;
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "issued_at")   return new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime();
    if (sort === "full_name")   return (a.profiles?.full_name ?? "").localeCompare(b.profiles?.full_name ?? "");
    if (sort === "month")       return ((b.goal_months?.month_year ?? 0) * 100 + (b.goal_months?.month_num ?? 0))
                                     - ((a.goal_months?.month_year ?? 0) * 100 + (a.goal_months?.month_num ?? 0));
    if (sort === "award_label") return a.award_label.localeCompare(b.award_label);
    return 0;
  });

  function shareUrl(awardId: string) {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/goal-engine/certificate/${awardId}`;
  }

  async function copyLink(awardId: string) {
    try {
      await navigator.clipboard.writeText(shareUrl(awardId));
      setCopied(awardId);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* ignore */ }
  }

  const SEL: React.CSSProperties = {
    padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${C.line}`,
    background: C.white, fontSize: 12, fontWeight: 700, color: C.ink,
    fontFamily: "inherit", cursor: "pointer", outline: "none",
  };

  return (
    <div style={{ fontFamily: "Montserrat,system-ui,sans-serif", color: C.ink, maxWidth: 1200, margin: "0 auto", padding: "28px 24px 56px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Link href="/goal-engine/admin" style={{ fontSize: 12, fontWeight: 700, color: C.muted, textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 900, color: C.ink }}>🏆 Awards Locker Room</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>All-time award history · Admin access only</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>{sorted.length} awards</span>
        </div>
      </div>

      {/* Filters + sort */}
      <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 20px", marginBottom: 24, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, marginRight: 4 }}>Filter</span>

        <select value={filterLO} onChange={e => setFilterLO(e.target.value)} style={SEL}>
          <option value="">All LOs</option>
          {loNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={SEL}>
          <option value="">All Months</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={SEL}>
          <option value="">All Award Types</option>
          {awardTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted, marginLeft: 8 }}>Sort</span>
        {(["issued_at","full_name","month","award_label"] as SortKey[]).map(s => (
          <button key={s} onClick={() => setSort(s)} style={{
            padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${sort === s ? C.orange : C.line}`,
            background: sort === s ? "#fff7ed" : C.white, color: sort === s ? C.orange : C.muted,
            fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
          }}>
            {s === "issued_at" ? "Newest" : s === "full_name" ? "LO Name" : s === "month" ? "Month" : "Award"}
          </button>
        ))}

        {(filterLO || filterMonth || filterType) && (
          <button onClick={() => { setFilterLO(""); setFilterMonth(""); setFilterType(""); }} style={{
            padding: "6px 12px", borderRadius: 8, border: "none", background: "#fee2e2",
            color: "#991b1b", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
          }}>✕ Clear</button>
        )}
      </div>

      {/* Awards grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: C.muted, fontSize: 14 }}>Loading awards…</div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.muted }}>No awards match your filters.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {sorted.map(award => {
            const st  = awardStyle(award.award_emoji);
            const url = shareUrl(award.id);
            const issuedDate = new Date(award.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            return (
              <div key={award.id} style={{
                background: st.bg,
                border: `1.5px solid ${st.border}`,
                borderRadius: 16,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}>
                {/* Award header */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ fontSize: 32, lineHeight: 1 }}>{award.award_emoji}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: st.text }}>{award.award_label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{award.goal_months?.month_label ?? "—"}</p>
                  </div>
                  {award.email_sent && (
                    <span style={{ fontSize: 10, fontWeight: 800, color: C.green, background: "#dcfce7", padding: "2px 8px", borderRadius: 99, border: "1px solid #bbf7d0", whiteSpace: "nowrap" }}>
                      ✉ Sent
                    </span>
                  )}
                </div>

                {/* LO name */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {award.profiles?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={award.profiles.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff" }}>
                      {(award.profiles?.full_name ?? "?")[0]}
                    </div>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{award.profiles?.full_name ?? "Unknown"}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: C.muted }}>{issuedDate}</span>
                </div>

                {/* Stats snapshot */}
                {award.stats_snapshot && Object.keys(award.stats_snapshot).length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {Object.entries(award.stats_snapshot).map(([k, v]) => (
                      <span key={k} style={{ fontSize: 10, fontWeight: 700, background: C.white, border: `1px solid ${st.border}`, color: st.text, padding: "2px 8px", borderRadius: 99 }}>
                        {k.replace(/_/g," ")}: {String(v)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{
                    flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 10,
                    background: C.white, border: `1.5px solid ${st.border}`,
                    fontSize: 11, fontWeight: 800, color: st.text, textDecoration: "none",
                  }}>
                    🏅 View Certificate
                  </a>
                  <button onClick={() => copyLink(award.id)} style={{
                    flex: 1, padding: "8px 0", borderRadius: 10,
                    background: copied === award.id ? "#dcfce7" : C.white,
                    border: `1.5px solid ${copied === award.id ? "#bbf7d0" : st.border}`,
                    fontSize: 11, fontWeight: 800,
                    color: copied === award.id ? C.green : st.text,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    {copied === award.id ? "✓ Copied!" : "🔗 Share Link"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
