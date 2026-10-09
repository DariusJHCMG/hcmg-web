"use client";

import { useState, useEffect, useCallback } from "react";
import type { Lead, LeadEvent, LeadStatus } from "@/lib/database.types";
import { SessionReplay } from "./SessionReplay";
import { FUNNEL_CONFIGS } from "@/lib/funnel-config";

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

const DEFAULT_STEP_LABELS: Record<number, string> = {
  1: "Goal",
  2: "Price range",
  3: "Credit range",
  4: "Income range",
  5: "Saw estimate",
  6: "Contact info",
};

// Sources that go through the buyer funnel
const BUYER_SOURCES = new Set([
  "get-started", "team", "seo", "co-brand", "co-branded",
  "product", "home-calculator", "funnel",
]);

function isBuyerFunnel(source: string): boolean {
  return BUYER_SOURCES.has(source) || source.startsWith("funnel:");
}

/** Resolve the funnel config for a lead — checks funnel_type first, then source slug. */
function getFunnelConfig(lead: Lead) {
  const slug = lead.funnel_type
    ?? (lead.source.startsWith("funnel:") ? lead.source.slice(7) : null);
  return slug ? (FUNNEL_CONFIGS[slug] ?? null) : null;
}

/** Get the active steps for a lead's funnel. Falls back to all 6. */
function getActiveSteps(lead: Lead): number[] {
  return getFunnelConfig(lead)?.steps ?? [1, 2, 3, 4, 5, 6];
}

/** Get the display label for a step, respecting funnel config overrides. */
function getStepLabel(lead: Lead, stepNum: number): string {
  const cfg = getFunnelConfig(lead);
  const overrideTitle = cfg?.overrides?.[stepNum]?.title;
  if (overrideTitle) {
    // Strip trailing question mark / punctuation for use as a short label
    return overrideTitle.replace(/[?.]$/, "").trim();
  }
  return DEFAULT_STEP_LABELS[stepNum] ?? `Step ${stepNum}`;
}

// Parse recruiting notes (newline-separated "Key: value" lines)
function parseRecruitingNotes(notes: string | null): Record<string, string> {
  if (!notes) return {};
  return Object.fromEntries(
    notes.split("\n")
      .map(line => { const i = line.indexOf(":"); return i > -1 ? [line.slice(0, i).trim(), line.slice(i + 1).trim()] : null; })
      .filter((e): e is [string, string] => e !== null && e[1].length > 0)
  );
}

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

const ALL_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed", "lost"];

const STATUS_LABELS: Record<LeadStatus, string> = {
  new:       "New",
  contacted: "Contacted",
  qualified: "Qualified",
  closed:    "Closed",
  lost:      "Lost",
};

interface Props {
  lead: Lead;
  sourceLabel?: string;
  hideLoColumn?: boolean;
  patchEndpoint?: "admin" | "portal";
  dscrData?: Record<string, string>;
  allLOs?: { slug: string; name: string }[];
}

export function LeadIntelPanel({ lead, sourceLabel, hideLoColumn, patchEndpoint = "admin", dscrData, allLOs }: Props) {
  // sourceLabel already contains "via <RealtorName>" when set from co-branded
  const [open, setOpen]           = useState(false);
  const [events, setEvents]       = useState<LeadEvent[]>([]);
  const [loading, setLoading]     = useState(false);
  const [tab, setTab]             = useState<"journey" | "funnel" | "details" | "replay">("journey");
  const [status, setStatus]       = useState<LeadStatus>(lead.status);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<"ok" | "err" | null>(null);
  // Assignment
  const [assignSlug, setAssignSlug]   = useState<string>(lead.lo_slug ?? "");
  const [assignName, setAssignName]   = useState<string>(lead.lo_name ?? "");
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignMsg, setAssignMsg]     = useState<"ok" | "err" | null>(null);

  async function updateStatus(next: LeadStatus) {
    if (next === status) return;
    setStatusSaving(true);
    setStatusMsg(null);
    const url = patchEndpoint === "portal"
      ? `/api/portal/leads/${lead.id}`
      : `/api/admin/leads/${lead.id}`;
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        setStatus(next);
        setStatusMsg("ok");
        setTimeout(() => setStatusMsg(null), 2000);
      } else {
        setStatusMsg("err");
      }
    } catch {
      setStatusMsg("err");
    }
    setStatusSaving(false);
  }

  async function saveAssignment() {
    setAssignSaving(true);
    setAssignMsg(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lo_slug: assignSlug || null,
          lo_name: assignSlug ? assignName : null,
        }),
      });
      setAssignMsg(res.ok ? "ok" : "err");
      setTimeout(() => setAssignMsg(null), 3000);
    } catch {
      setAssignMsg("err");
    }
    setAssignSaving(false);
  }

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
        {/* State */}
        <td className="px-5 py-3.5">
          {lead.property_state ? (
            <span className="inline-flex items-center rounded-lg border border-line bg-sand px-2.5 py-1 text-xs font-bold text-ink">
              {lead.property_state}
            </span>
          ) : (
            <span className="text-xs text-muted/40">—</span>
          )}
        </td>
        {/* Status */}
        <td className="px-5 py-3.5">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_COLORS[status]}`}>
            {status}
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
          <td colSpan={9} className="p-0 bg-sand border-b border-line">
            <div className="px-6 py-5 space-y-5">

              {/* ── Header row ── */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                    Lead Intelligence
                  </p>
                  <h3 className="mt-0.5 text-lg font-extrabold text-ink">
                    {lead.first_name} {lead.last_name ?? ""}
                  </h3>
                  <p className="text-xs text-muted">
                    {new Date(lead.created_at).toLocaleString()} ·{" "}
                    {lead.entry_page ? `entered via ${lead.entry_page}` : "entry page not tracked"}
                  </p>
                </div>
                {lead.session_id && (
                  <button
                    onClick={() => setTab("replay")}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
                  >
                    ▶ Watch Replay
                  </button>
                )}
              </div>

              {/* ── Attribution strip ── */}
              <div className="flex flex-wrap gap-2">
                {lead.co_branded_page_id && sourceLabel && (
                  <AttrBadge icon="🤝" label="Co-Branded Page" value={sourceLabel} />
                )}
                <AttrBadge icon={sourceIcon(lead.utm_source)} label="Source"    value={lead.utm_source} />
                <AttrBadge icon="📡"                          label="Medium"    value={lead.utm_medium} />
                <AttrBadge icon="🎯"                          label="Campaign"  value={lead.utm_campaign} />
                <AttrBadge icon="📄"                          label="Entry page" value={lead.entry_page} />
                <AttrBadge icon="↩️"                          label="Referrer"  value={lead.referrer} />
                <AttrBadge icon={DEVICE_ICONS[lead.device ?? ""] ?? "💻"} label="Device" value={lead.device} />
                {!hasUtm && !lead.entry_page && !lead.co_branded_page_id && (
                  <p className="text-xs text-muted">No attribution data — lead predates tracking or came directly.</p>
                )}
              </div>

              {/* ── Tabs ── */}
              <div className="flex gap-1 border-b border-line pb-0">
                {(["journey", "funnel", "details", "replay"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition rounded-t-lg border border-b-0 ${
                      tab === t
                        ? "border-line bg-white text-ink"
                        : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    {t === "journey" && `Pages (${pageViews.length})`}
                    {t === "funnel"  && (isBuyerFunnel(lead.source) ? `Funnel (${funnelSteps.length}/${getActiveSteps(lead).length})` : "Funnel")}
                    {t === "details" && "Lead Details"}
                    {t === "replay"  && "Session Replay"}
                  </button>
                ))}
              </div>

              {/* ── Tab content ── */}
              <div className="rounded-xl border border-line bg-white overflow-hidden">
                {loading ? (
                  <p className="px-6 py-8 text-center text-sm text-muted">Loading intelligence data…</p>
                ) : (
                  <>
                    {/* JOURNEY TAB */}
                    {tab === "journey" && (
                      <div>
                        {pageViews.length === 0 ? (
                          <p className="px-6 py-8 text-center text-sm text-muted">
                            No page views recorded.{!lead.session_id ? " This lead submitted before tracking was active." : ""}
                          </p>
                        ) : (
                          <div className="divide-y divide-line">
                            {pageViews.map((ev, i) => {
                              const next = pageViews[i + 1];
                              const durationMs = next
                                ? new Date(next.ts).getTime() - new Date(ev.ts).getTime()
                                : null;
                              return (
                                <div key={ev.id} className="flex items-center justify-between px-5 py-3 gap-4">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-line text-[10px] font-bold text-muted">
                                      {i + 1}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-ink truncate">
                                        {ev.pathname ?? "—"}
                                      </p>
                                      <p className="text-[10px] text-muted">
                                        {new Date(ev.ts).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 text-right">
                                    {durationMs !== null && durationMs > 0 && (
                                      <span className="inline-flex items-center rounded-full bg-sand px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                                        {duration(durationMs)} on page
                                      </span>
                                    )}
                                    {ctaClicks.some((c) => c.pathname === ev.pathname) && (
                                      <span className="ml-1.5 inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
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

                    {/* FUNNEL TAB */}
                    {tab === "funnel" && (
                      <div className="p-5 space-y-3">

                        {/* ── Buyer funnel (get-started / team / seo / co-brand / product / all 107 catalog funnels) ── */}
                        {isBuyerFunnel(lead.source) && (
                          <>
                            {getActiveSteps(lead).map((stepNum, idx) => {
                              const ev = funnelSteps.find((e) => (e.data as any)?.step === stepNum);
                              const trackedChoice = (ev?.data as any)?.choice as string | undefined;
                              const dur = (ev?.data as any)?.duration_ms as number | undefined;
                              const leadAnswer: string | null | undefined =
                                stepNum === 1 ? lead.goal :
                                stepNum === 2 ? lead.price_range :
                                stepNum === 3 ? lead.credit_range :
                                stepNum === 4 ? lead.income_range :
                                undefined;
                              const choice = trackedChoice ?? (leadAnswer || undefined);
                              const completed = !!ev || !!leadAnswer;
                              const fromLead = !ev && !!leadAnswer;
                              return (
                                <div key={stepNum} className={`flex items-center gap-4 rounded-xl border p-3.5 transition ${completed ? "border-green-200 bg-green-50" : "border-line bg-sand"}`}>
                                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${completed ? "bg-green-600 text-white" : "border border-line text-muted"}`}>
                                    {completed ? "✓" : idx + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted">
                                      Step {idx + 1} — {getStepLabel(lead, stepNum)}
                                    </p>
                                    {choice && <p className="mt-0.5 text-sm font-semibold text-ink">{choice}</p>}
                                    {fromLead && <p className="mt-0.5 text-[10px] text-muted/60">from submission</p>}
                                    {!completed && <p className="mt-0.5 text-xs text-muted">Not reached</p>}
                                  </div>
                                  {dur && dur > 0 && (
                                    <span className="flex-shrink-0 text-[11px] font-semibold text-muted">{duration(dur)}</span>
                                  )}
                                </div>
                              );
                            })}
                            {/* Buying power / estimate summary if available */}
                            {(lead.estimated_buying_power_high || lead.estimated_monthly_payment || lead.recommended_loan_type) && (
                              <div className="mt-2 rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-1.5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent">Estimate generated</p>
                                {lead.estimated_buying_power_low && lead.estimated_buying_power_high && (
                                  <div className="flex justify-between text-sm"><span className="text-muted">Buying power</span><span className="font-semibold text-ink">${lead.estimated_buying_power_low.toLocaleString()} – ${lead.estimated_buying_power_high.toLocaleString()}</span></div>
                                )}
                                {lead.estimated_monthly_payment && (
                                  <div className="flex justify-between text-sm"><span className="text-muted">Est. monthly</span><span className="font-semibold text-ink">${lead.estimated_monthly_payment.toLocaleString()}/mo</span></div>
                                )}
                                {lead.recommended_loan_type && (
                                  <div className="flex justify-between text-sm"><span className="text-muted">Loan path</span><span className="font-semibold text-ink">{lead.recommended_loan_type}</span></div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* ── Recruiting / Employment ── */}
                        {lead.source === "employment" && (() => {
                          const fields = parseRecruitingNotes(lead.notes);
                          const rows: { label: string; value: string | null | undefined }[] = [
                            { label: "NMLS ID",         value: fields["NMLS"] },
                            { label: "Current company", value: fields["Current company"] },
                            { label: "States licensed", value: fields["States licensed"] },
                            { label: "Monthly volume",  value: fields["Monthly volume"] },
                            { label: "Message",         value: fields["Message"] },
                          ];
                          return (
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted px-1">Recruiting inquiry details</p>
                              {rows.filter(r => r.value).map(r => (
                                <div key={r.label} className="flex items-start gap-4 rounded-xl border border-line bg-sand p-3.5">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{r.label}</p>
                                    <p className="mt-0.5 text-sm font-semibold text-ink">{r.value}</p>
                                  </div>
                                </div>
                              ))}
                              {rows.every(r => !r.value) && (
                                <p className="text-sm text-muted px-1">No additional details submitted.</p>
                              )}
                            </div>
                          );
                        })()}

                        {/* ── Contact form ── */}
                        {lead.source === "contact" && (
                          <div className="rounded-xl border border-line bg-sand p-4 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Contact inquiry</p>
                            {lead.notes ? (
                              <p className="text-sm text-ink whitespace-pre-wrap">{lead.notes}</p>
                            ) : (
                              <p className="text-sm text-muted">No message submitted.</p>
                            )}
                          </div>
                        )}

                        {/* ── Corporate benefits / Agent / other non-funnel sources ── */}
                        {(lead.source === "corporate-benefits" || lead.source === "real-estate-agent") && (
                          <div className="rounded-xl border border-line bg-sand p-4 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                              {lead.source === "corporate-benefits" ? "Corporate benefits inquiry" : "Agent partner inquiry"}
                            </p>
                            {lead.notes && <p className="text-sm text-ink whitespace-pre-wrap">{lead.notes}</p>}
                            {lead.property_state && (
                              <div className="flex justify-between text-sm"><span className="text-muted">Property state</span><span className="font-semibold text-ink">{lead.property_state}</span></div>
                            )}
                            {!lead.notes && !lead.property_state && (
                              <p className="text-sm text-muted">No additional details submitted.</p>
                            )}
                          </div>
                        )}

                        {/* ── DSCR (handled by dscrData prop, shown below panel) ── */}
                        {lead.source === "dscr-landing" && (
                          <div className="rounded-xl border border-line bg-sand p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">DSCR inquiry</p>
                            <p className="mt-1 text-sm text-muted">See DSCR Loan Details section below.</p>
                          </div>
                        )}

                      </div>
                    )}

                    {/* LEAD DETAILS TAB */}
                    {tab === "details" && (
                      <div className="divide-y divide-line">

                        {/* Contact info */}
                        <div className="p-5 space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Contact Information</p>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Full name</span>
                              <span className="text-sm font-semibold text-ink">{lead.first_name}{lead.last_name ? ` ${lead.last_name}` : ""}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Email</span>
                              <a href={`mailto:${lead.email}`} className="text-sm font-semibold text-accent hover:underline">{lead.email}</a>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Phone</span>
                              <a href={`tel:${lead.phone.replace(/\D/g, "")}`} className="text-sm font-semibold text-accent hover:underline">{lead.phone}</a>
                            </div>
                            {lead.property_state && (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Property state</span>
                                <span className="text-sm font-semibold text-ink">{lead.property_state}</span>
                              </div>
                            )}
                          </div>
                          {/* Quick action buttons */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            <a href={`tel:${lead.phone.replace(/\D/g, "")}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#F37021] px-4 py-2 text-xs font-bold text-white transition hover:opacity-90">
                              📞 Call {lead.first_name}
                            </a>
                            <a href={`mailto:${lead.email}`}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2 text-xs font-bold text-ink transition hover:border-accent hover:text-accent">
                              ✉️ Email
                            </a>
                            <a href={`sms:${lead.phone.replace(/\D/g, "")}`}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2 text-xs font-bold text-ink transition hover:border-accent hover:text-accent">
                              💬 Text
                            </a>
                          </div>
                        </div>

                        {/* Mortgage / funnel answers — only for buyer leads */}
                        {isBuyerFunnel(lead.source) && (lead.goal || lead.price_range || lead.credit_range || lead.income_range || lead.recommended_loan_type || lead.estimated_buying_power_high || lead.estimated_monthly_payment) && (
                          <div className="p-5 space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Mortgage Details</p>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {lead.goal && (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Goal</span>
                                  <span className="text-sm font-semibold text-ink capitalize">{lead.goal === "buy" ? "Purchase a home" : lead.goal === "refinance" ? "Refinance" : lead.goal === "compare" ? "Compare options" : lead.goal}</span>
                                </div>
                              )}
                              {lead.price_range && (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Price range</span>
                                  <span className="text-sm font-semibold text-ink">{lead.price_range}</span>
                                </div>
                              )}
                              {lead.credit_range && (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Credit range</span>
                                  <span className="text-sm font-semibold text-ink">{lead.credit_range}</span>
                                </div>
                              )}
                              {lead.income_range && (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Income range</span>
                                  <span className="text-sm font-semibold text-ink">{lead.income_range}</span>
                                </div>
                              )}
                              {lead.recommended_loan_type && (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Recommended loan path</span>
                                  <span className="text-sm font-semibold text-ink">{lead.recommended_loan_type}</span>
                                </div>
                              )}
                              {lead.funnel_type && (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Funnel</span>
                                  <span className="text-sm font-semibold text-ink">{lead.funnel_type.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                                </div>
                              )}
                            </div>
                            {(lead.estimated_buying_power_high || lead.estimated_monthly_payment) && (
                              <div className="mt-1 rounded-xl border border-accent/20 bg-accent/5 p-3 space-y-1.5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">Estimate generated</p>
                                {lead.estimated_buying_power_low && lead.estimated_buying_power_high && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted">Buying power</span>
                                    <span className="font-semibold text-ink">${lead.estimated_buying_power_low.toLocaleString()} – ${lead.estimated_buying_power_high.toLocaleString()}</span>
                                  </div>
                                )}
                                {lead.estimated_monthly_payment && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted">Est. monthly</span>
                                    <span className="font-semibold text-ink">${lead.estimated_monthly_payment.toLocaleString()}/mo</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Recruiting details */}
                        {lead.source === "employment" && lead.notes && (
                          <div className="p-5 space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Recruiting Details</p>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {Object.entries(parseRecruitingNotes(lead.notes)).map(([k, v]) => (
                                <div key={k} className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">{k}</span>
                                  <span className="text-sm font-semibold text-ink">{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes / message for contact / corporate / agent */}
                        {(lead.source === "contact" || lead.source === "corporate-benefits" || lead.source === "real-estate-agent") && lead.notes && (
                          <div className="p-5 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Message</p>
                            <p className="text-sm text-ink whitespace-pre-wrap">{lead.notes}</p>
                          </div>
                        )}

                        {/* DSCR answers */}
                        {dscrData && Object.keys(dscrData).length > 0 && (
                          <div className="p-5 space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">DSCR Loan Details</p>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {Object.entries(dscrData).map(([k, v]) => (
                                <div key={k} className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">{k}</span>
                                  <span className="text-sm font-semibold text-ink">{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Attribution */}
                        {(lead.utm_source || lead.utm_medium || lead.utm_campaign || lead.utm_content || lead.utm_term) && (
                          <div className="p-5 space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Attribution</p>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {lead.utm_source   && <div className="flex flex-col gap-0.5"><span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Source</span><span className="text-sm font-semibold text-ink">{lead.utm_source}</span></div>}
                              {lead.utm_medium   && <div className="flex flex-col gap-0.5"><span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Medium</span><span className="text-sm font-semibold text-ink">{lead.utm_medium}</span></div>}
                              {lead.utm_campaign && <div className="flex flex-col gap-0.5"><span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Campaign</span><span className="text-sm font-semibold text-ink">{lead.utm_campaign}</span></div>}
                              {lead.utm_content  && <div className="flex flex-col gap-0.5"><span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Content</span><span className="text-sm font-semibold text-ink">{lead.utm_content}</span></div>}
                              {lead.utm_term     && <div className="flex flex-col gap-0.5"><span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Term</span><span className="text-sm font-semibold text-ink">{lead.utm_term}</span></div>}
                              {lead.referrer     && <div className="flex flex-col gap-0.5"><span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Referrer</span><span className="text-sm font-semibold text-ink">{lead.referrer}</span></div>}
                            </div>
                          </div>
                        )}

                        {/* Submission meta */}
                        <div className="p-5 space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Submission</p>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Submitted</span>
                              <span className="text-sm font-semibold text-ink">{new Date(lead.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Source</span>
                              <span className="text-sm font-semibold text-ink capitalize">{lead.source}</span>
                            </div>
                            {lead.device && (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Device</span>
                                <span className="text-sm font-semibold text-ink capitalize">{lead.device}</span>
                              </div>
                            )}
                            {lead.entry_page && (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">Entry page</span>
                                <span className="text-sm font-semibold text-ink font-mono text-xs">{lead.entry_page}</span>
                              </div>
                            )}
                            {lead.sms_consent && (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted/60">SMS consent</span>
                                <span className="text-sm font-semibold text-green-700">✓ Granted{lead.sms_consent_timestamp ? ` · ${new Date(lead.sms_consent_timestamp).toLocaleString()}` : ""}</span>
                              </div>
                            )}
                          </div>
                        </div>

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
                            <p className="text-sm font-semibold text-ink">No session tracked</p>
                            <p className="text-xs text-muted max-w-xs">
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

              {/* ── Assign / Reassign LO (admin only) ── */}
              {allLOs && allLOs.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted whitespace-nowrap">
                    Assigned LO
                  </span>
                  <select
                    value={assignSlug}
                    onChange={(e) => {
                      const slug = e.target.value;
                      const lo   = allLOs.find((l) => l.slug === slug);
                      setAssignSlug(slug);
                      setAssignName(lo?.name ?? "");
                    }}
                    disabled={assignSaving}
                    className="flex-1 min-w-[180px] rounded-lg border border-line bg-sand px-3 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition disabled:opacity-50"
                  >
                    <option value="">— Unassigned —</option>
                    {allLOs.map(({ slug, name }) => (
                      <option key={slug} value={slug}>{name}</option>
                    ))}
                  </select>
                  <button
                    onClick={saveAssignment}
                    disabled={assignSaving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-40"
                  >
                    {assignSaving ? "Saving…" : (lead.lo_slug ? "Reassign" : "Assign")}
                  </button>
                  {assignMsg === "ok" && (
                    <span className="text-[11px] font-semibold text-green-600">✓ Saved</span>
                  )}
                  {assignMsg === "err" && (
                    <span className="text-[11px] font-semibold text-red-500">Failed to save</span>
                  )}
                </div>
              )}

              {/* ── Status change ── */}
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                  Status
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_STATUSES.map((s) => (
                    <button
                      key={s}
                      disabled={statusSaving}
                      onClick={() => updateStatus(s)}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors disabled:opacity-50 ${
                        status === s
                          ? STATUS_COLORS[s] + " ring-2 ring-offset-1 ring-current"
                          : "border border-line text-muted hover:border-accent hover:text-accent"
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
                {statusSaving && (
                  <span className="text-[11px] text-muted">Saving…</span>
                )}
                {statusMsg === "ok" && (
                  <span className="text-[11px] font-semibold text-green-600">✓ Saved</span>
                )}
                {statusMsg === "err" && (
                  <span className="text-[11px] font-semibold text-red-500">Failed to save</span>
                )}
              </div>

              {/* ── Quick contact bar ── */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={`tel:${lead.phone.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-xs font-bold text-ink transition hover:border-accent hover:text-accent"
                >
                  📞 Call {lead.first_name}
                </a>
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-xs font-bold text-ink transition hover:border-accent hover:text-accent"
                >
                  ✉️ Email
                </a>
                <a
                  href={`sms:${lead.phone.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-xs font-bold text-ink transition hover:border-accent hover:text-accent"
                >
                  💬 Text
                </a>
                <div className="ml-auto flex flex-wrap gap-2 text-[11px] text-muted">
                  {lead.price_range  && <span className="rounded-full border border-line bg-white px-2.5 py-1">{lead.price_range}</span>}
                  {lead.credit_range && <span className="rounded-full border border-line bg-white px-2.5 py-1">Credit {lead.credit_range}</span>}
                  {lead.income_range && <span className="rounded-full border border-line bg-white px-2.5 py-1">{lead.income_range}</span>}
                </div>
              </div>

              {/* ── DSCR answers ── */}
              {dscrData && Object.keys(dscrData).length > 0 && (
                <div className="mt-4 rounded-xl border border-line bg-surface p-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">DSCR Loan Details</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
                    {Object.entries(dscrData).map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[10px] uppercase tracking-wider text-muted">{k}</p>
                        <p className="text-xs font-semibold text-ink">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </td>
        </tr>
      )}
    </>
  );
}
