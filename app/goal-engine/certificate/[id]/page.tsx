/**
 * GET /goal-engine/certificate/[id]
 * Serves the printable award certificate as a full HTML page.
 * Public — no auth required (LOs share this link).
 * The page has a Print button and instructions to save as PDF.
 */

import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { buildCertificateHtml, certStat } from "@/lib/goal-engine-emails";
import { fmt$ } from "@/lib/goal-engine";

export const dynamic = "force-dynamic";

// Tell Next.js to render this as a full document (no layout)
export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createServiceClient();

  const { data: award } = await sb
    .from("goal_awards")
    .select(`
      id, award_label, award_emoji, stats_snapshot, issued_at,
      goal_months(month_label),
      profiles!goal_awards_profile_id_fkey(full_name)
    `)
    .eq("id", id)
    .maybeSingle();

  if (!award) notFound();

  const recipientName = (award.profiles as unknown as { full_name: string } | null)?.full_name ?? "Team Member";
  const monthLabel    = (award.goal_months as unknown as { month_label: string } | null)?.month_label ?? "";
  const stats         = award.stats_snapshot as Record<string, unknown> | null;

  const statsHtml = [
    stats?.funded_volume   != null ? certStat("Funded Volume",  fmt$(Number(stats.funded_volume)))  : null,
    stats?.funded_units    != null ? certStat("Funded Units",   `${stats.funded_units} loans`)      : null,
    stats?.commitment      != null && stats?.funded_volume == null
      ? certStat("Commitment", fmt$(Number(stats.commitment))) : null,
    stats?.pct             != null ? certStat("Goal %",         `${stats.pct}%`)                    : null,
    stats?.improvement_pct != null ? certStat("Improvement",    `+${stats.improvement_pct}%`)       : null,
    certStat("Month", monthLabel),
  ].filter(Boolean).join("");

  const certHtml = buildCertificateHtml(recipientName, award.award_label, award.award_emoji, monthLabel, statsHtml);

  // Inject a sticky print/download bar above the certificate
  const printBar = `
    <div style="position:fixed;top:0;left:0;right:0;z-index:999;background:#142850;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;font-family:'Helvetica Neue',sans-serif;box-shadow:0 2px 12px rgba(0,0,0,0.4);">
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:20px;">🎓</span>
        <div>
          <p style="margin:0;font-size:13px;font-weight:800;color:#fff;">${award.award_label}</p>
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.55);">${recipientName} · ${monthLabel}</p>
        </div>
      </div>
      <div style="display:flex;gap:10px;">
        <button onclick="window.print()" style="padding:8px 18px;border-radius:8px;border:none;background:#F37021;color:#fff;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;">
          🖨 Print / Save as PDF
        </button>
        <a href="/goal-engine/awards" style="padding:8px 18px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.7);font-size:12px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;">
          ← My Awards
        </a>
      </div>
    </div>
    <div style="height:56px;"></div>
  `;

  // Inject the print bar right after <body>
  const fullHtml = certHtml.replace("<body>", `<body>${printBar}`);

  return new Response(fullHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
