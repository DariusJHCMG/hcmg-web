"use client";

import { useState, useEffect, useCallback } from "react";
import type { Lead, LeadEvent } from "@/lib/database.types";
import { SessionReplay } from "./SessionReplay";

// ── Helpers ───────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-blue-50 text-blue-700",
  contacted: "bg-yellow-50 text-yellow-700",
  qualified: "bg-purple-50 text-purple-700",
  closed:    "bg-green-50 text-green-700",
  lost:      "bg-red-50 text-red-600",
};

const SOURCE_ICONS: Record<string, string> = {
  instagram: "📸", facebook: "👥", email: "✉️", sms: "💬",
  google: "🔍", tiktok: "🎵", direct: "🔗", referral: "🤝",
};

function sourceIcon(src?: string | null): string {
  if (!src) return "🌐";
  return SOURCE_ICONS[src.toLowerCase()] ?? "🌐";
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0)  return `${days}d ago`;
  if (hrs > 0)   return `${hrs}h ago`;
  if (mins > 0)  return `${mins}m ago`;
  return "just now";
}

function duration(ms: unknown): string {
  if (typeof ms !== "number" || ms <= 0) return "";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

const FUNNEL_STEPS: Record<number, string> = {
  1: "Goal",
  2: "Price range",
  3: "Credit range",
  4: "Income range",
  5: "Saw estimate",
  6: "Contact info",
};

const DEVICE_ICONS: Record<string, string> = {
  mobile: "📱", tablet: "📲", desktop: "💻",
};

// ── Attribution badge ─────────────────────────────────────────────

function AttrBadge({ icon, label, value }: { icon: string; label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2">
      <span className="text-base">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted/60">{label}</p>
        <p className="text-xs font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

interface Props {
  lead: Lead;
  sourceLabel?: string;  // override the source cell with a human label (company leads)
  hideLoColumn?: boolean; // suppress the LO column for company-leads table
}

export function LeadIntelPanel({ lead, sourceLabel, hideLoColumn }: Props) {
  const [open, setOpen]       = useState(false);
  const [events, setEvents]   = useState<LeadEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab]         = useState<"journey" | "funnel" | "replay">("journey");

  const fetchEvents = useCallback(async () => {
    if (events.length > 0 || !lead.session_id) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/portal/leads/${lead.id}/events`);
      const json = await res.json();
      setEvents(json.events ?? []);
    } catch { /* best-effort */ }
    setLoading(false);
  }, [lead.id, lead.session_id, events.length]);

  useEffect(() => {
    if (open) fetchEvents();
  }, [open, fetchEvents]);

  const pageViews    = events.filter((e) => e.event_type === "page_view");
  const funnelSteps  = events.filter((e) => e.event_type === "funnel_step");
  const ctaClicks    = events.filter((e) => e.event_type === "cta_click");

  const hasUtm = lead.utm_source || lead.utm_medium || lead.utm_campaign;

  return (
    <>
      {/* Trigger row */}
      <tr
        className="cursor-pointer transition-colors hover:bg-accent/5"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Name */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-[11px] font-extrabold text-white"
              style={{ background: "var(--ok-gradient)" }}
            >
              {lead.first_name[0]}{lead.last_name?.[0] ?? ""}
            </div>
            <div>
              <p className="text-sm font-bold text-ink leading-tight">
                {lead.first_name} {lead.last_name ?? ""}
              </p>
              {lead.session_id && (
                <p className="text-[10px] text-muted/50 font-mono">tracked</p>
              )}
            </div>
          </div>
        </td>
        {/* Contact */}
        <td className="px-5 py-3.5 text-sm text-muted">
          <div>{lead.email}</div>
          <div className="text-xs">{lead.phone}</div>
        </td>
        {/* Source */}
        <td className="px-5 py-3.5 text-sm text-muted">
          {sourceLabel ? (
            <span className="font-semibold text-ink">{sourceLabel}</span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>{sourceIcon(lead.utm_source)}</span>
              <span>{lead.utm_source ?? lead.source}</span>
            </span>
          )}
          {lead.device && (
            <span className="text-xs text-muted/60">
              {DEVICE_ICONS[lead.device] ?? ""} {lead.device}
            </span>
          )}
        </td>
        {/* LO — hidden for company-leads table */}
        {!hideLoColumn && (
          <td className="px-5 py-3.5 text-sm text-muted">{lead.lo_name ?? "—"}</td>
        )}
        {/* Goal */}
        <td className="px-5 py-3.5 text-sm text-muted">{lead.goal ?? "—"}</td>
        {/* Status */}
        <td className="px-5 py-3.5">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_COLORS[lead.status]}`}>
            {lead.status}
          </span>
        </td>
        {/* Date */}
        <td className="px-5 py-3.5 text-xs text-muted">{relativeTime(lead.created_at)}</td>
        {/* Chevron */}
        <td className="px-4 py-3.5 text-muted text-xs">{open ? "▲" : "▼"}</td>
      </tr>

      {/* Intelligence drawer */}
      {open && (
        <tr>
          <td colSpan={8} className="p-0 bg-[#0d1117] border-b border-[#30363d]">
            <div className="px-6 py-5 space-y-5">

              {/* ── Header row ── */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f37021]">
                    Lead Intelligence
                  </p>
                  <h3 className="mt-0.5 text-lg font-extrabold text-white">
                    {lead.first_name} {lead.last_name ?? ""}
                  </h3>
                  <p className="text-xs text-[#8b949e]">
                    {new Date(lead.created_at).toLocaleString()} ·{" "}
                    {lead.entry_page ? `entered via ${lead.entry_page}` : "entry page not tracked"}
                  </p>
                </div>
                {lead.session_id && (
                  <button
                    onClick={() => setTab("replay")}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#f37021] px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
                  >
                    ▶ Watch Replay
                  </button>
                )}
              </div>

              {/* ── Attribution strip ── */}
              <div className="flex flex-wrap gap-2">
                <AttrBadge icon={sourceIcon(lead.utm_source)} label="Source"    value={lead.utm_source} />
                <AttrBadge icon="📡"                          label="Medium"    value={lead.utm_medium} />
                <AttrBadge icon="🎯"                          label="Campaign"  value={lead.utm_campaign} />
                <AttrBadge icon="📄"                          label="Entry page" value={lead.entry_page} />
                <AttrBadge icon="↩️"                          label="Referrer"  value={lead.referrer} />
                <AttrBadge icon={DEVICE_ICONS[lead.device ?? ""] ?? "💻"} label="Device" value={lead.device} />
                {!hasUtm && !lead.entry_page && (
                  <p className="text-xs text-[#8b949e]">No attribution data — lead predates tracking or came directly.</p>
                )}
              </div>

              {/* ── Tabs ── */}
              <div className="flex gap-1 border-b border-[#30363d] pb-0">
                {(["journey", "funnel", "replay"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition rounded-t-lg border border-b-0 ${
                      tab === t
                        ? "border-[#30363d] bg-[#161b22] text-white"
                        : "border-transparent text-[#8b949e] hover:text-white"
                    }`}
                  >
                    {t === "journey" && `Pages (${pageViews.length})`}
                    {t === "funnel"  && `Funnel (${funnelSteps.length}/6)`}
                    {t === "replay"  && "Session Replay"}
                  </button>
                ))}
              </div>

              {/* ── Tab content ── */}
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden">
                {loading ? (
                  <p className="px-6 py-8 text-center text-sm text-[#8b949e]">Loading intelligence data…</p>
                ) : (
                  <>
                    {/* JOURNEY TAB */}
                    {tab === "journey" && (
                      <div>
                        {pageViews.length === 0 ? (
                          <p className="px-6 py-8 text-center text-sm text-[#8b949e]">
                            No page views recorded.{!lead.session_id ? " This lead submitted before tracking was active." : ""}
                          </p>
                        ) : (
                          <div className="divide-y divide-[#30363d]">
                            {pageViews.map((ev, i) => {
                              const next = pageViews[i + 1];
                              const durationMs = next
                                ? new Date(next.ts).getTime() - new Date(ev.ts).getTime()
                                : null;
                              return (
                                <div key={ev.id} className="flex items-center justify-between px-5 py-3 gap-4">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#30363d] text-[10px] font-bold text-[#8b949e]">
                                      {i + 1}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-white truncate">
                                        {ev.pathname ?? "—"}
                                      </p>
                                      <p className="text-[10px] text-[#8b949e]">
                                        {new Date(ev.ts).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 text-right">
                                    {durationMs !== null && durationMs > 0 && (
                                      <span className="inline-flex items-center rounded-full bg-[#1f2937] px-2.5 py-0.5 text-[11px] font-semibold text-[#d1d5db]">
                                        {duration(durationMs)} on page
                                      </span>
                                    )}
                                    {ctaClicks.some((c) => c.pathname === ev.pathname) && (
                                      <span className="ml-1.5 inline-flex items-center rounded-full bg-[#f37021]/20 px-2 py-0.5 text-[10px] font-bold text-[#f37021]">
                                        clicked CTA
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* FUNNEL REPLAY TAB */}
                    {tab === "funnel" && (
                      <div className="p-5 space-y-3">
                        {[1, 2, 3, 4, 5, 6].map((stepNum) => {
                          const ev = funnelSteps.find((e) => (e.data as any)?.step === stepNum);
                          const choice = (ev?.data as any)?.choice as string | undefined;
                          const dur    = (ev?.data as any)?.duration_ms as number | undefined;
                          const completed = !!ev;
                          return (
                            <div
                              key={stepNum}
                              className={`flex items-center gap-4 rounded-xl border p-3.5 transition ${
                                completed
                                  ? "border-[#238636]/60 bg-[#238636]/10"
                                  : "border-[#30363d] bg-[#0d1117]"
                              }`}
                            >
                              <div
                                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                  completed ? "bg-[#238636] text-white" : "border border-[#30363d] text-[#8b949e]"
                                }`}
                              >
                                {completed ? "✓" : stepNum}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#8b949e]">
                                  Step {stepNum} — {FUNNEL_STEPS[stepNum]}
                                </p>
                                {choice && (
                                  <p className="mt-0.5 text-sm font-semibold text-white">{choice}</p>
                                )}
                                {!completed && (
                                  <p className="mt-0.5 text-xs text-[#8b949e]">Not reached</p>
                                )}
                              </div>
                              {dur && dur > 0 && (
                                <span className="flex-shrink-0 text-[11px] font-semibold text-[#8b949e]">
                                  {duration(dur)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* SESSION REPLAY TAB */}
                    {tab === "replay" && (
                      <div className="p-4">
                        {lead.session_id ? (
                          <SessionReplay
                            leadId={lead.id}
                            leadName={`${lead.first_name}${lead.last_name ? ` ${lead.last_name}` : ""}`}
                          />
                        ) : (
                          <div className="flex flex-col items-center py-10 gap-3 text-center">
                            <p className="text-2xl">🎬</p>
                            <p className="text-sm font-semibold text-white">No session tracked</p>
                            <p className="text-xs text-[#8b949e] max-w-xs">
                              This lead submitted before session tracking was active.
                              All new leads are tracked automatically.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── Quick contact bar ── */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={`tel:${lead.phone.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#30363d] bg-[#161b22] px-4 py-2 text-xs font-bold text-white transition hover:border-[#f37021] hover:text-[#f37021]"
                >
                  📞 Call {lead.first_name}
                </a>
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#30363d] bg-[#161b22] px-4 py-2 text-xs font-bold text-white transition hover:border-[#f37021] hover:text-[#f37021]"
                >
                  ✉️ Email
                </a>
                <a
                  href={`sms:${lead.phone.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#30363d] bg-[#161b22] px-4 py-2 text-xs font-bold text-white transition hover:border-[#f37021] hover:text-[#f37021]"
                >
                  💬 Text
                </a>
                <div className="ml-auto flex flex-wrap gap-2 text-[11px] text-[#8b949e]">
                  {lead.price_range  && <span className="rounded-full border border-[#30363d] px-2.5 py-1">{lead.price_range}</span>}
                  {lead.credit_range && <span className="rounded-full border border-[#30363d] px-2.5 py-1">Credit {lead.credit_range}</span>}
                  {lead.income_range && <span className="rounded-full border border-[#30363d] px-2.5 py-1">{lead.income_range}</span>}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
