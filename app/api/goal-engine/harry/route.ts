/**
 * GET /api/goal-engine/harry
 * POST /api/goal-engine/harry
 *
 * HARRY AI — SLICE's internal performance coaching and intelligence assistant.
 * Named HARRY AI throughout the UI. Never call it "Bob AI", "ChatGPT", or
 * "Goal Engine AI".
 *
 * Architecture:
 *  - All requests are server-side only. No API keys sent to browser.
 *  - Strict role + tenant filtering. LOs only see their own data.
 *  - Minimal analytics payload — never full DB tables.
 *  - Provider abstraction: swap the model without rewriting SLICE.
 *  - Results stored in harry_ai_insights table for history + feedback.
 *  - Prompt versioning via HARRY_PROMPT_VERSION env var.
 *
 * Insight types:
 *  lo_coaching           → LO's personal pace, forecast, recommendations
 *  executive_briefing    → Company-level summary for CLO/executive
 *  pace_explanation      → "Why am I off pace?" answer
 *  focus_recommendation  → "What should I focus on?"
 *  off_pace_alert        → Triggered when LO falls behind threshold
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import {
  getActiveGoal,
  getCommitment,
  getLOProductionForMonth,
  getLeaderboard,
  computeGoalSummary,
  fmt$,
  fmtPct,
  daysRemaining,
  calcPace,
  requiredPace,
  monthProgress,
} from "@/lib/goal-engine";
import type { HarryInsightType } from "@/lib/database.types";

const HCMG_TENANT_ID   = "cmrss19yi000fysf83wcom9th";
const PROMPT_VERSION   = process.env.HARRY_PROMPT_VERSION ?? "v1";
const MODEL_PROVIDER   = process.env.HARRY_AI_PROVIDER   ?? "openai";
const OPENAI_API_KEY   = process.env.OPENAI_API_KEY;

// ── AI provider abstraction ────────────────────────────────────
async function callAI(systemPrompt: string, userContent: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    // Fallback: generate a data-driven insight without AI when no key configured
    return generateRuleBasedInsight(userContent);
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model:       process.env.HARRY_AI_MODEL ?? "gpt-4o-mini",
      max_tokens:  600,
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userContent  },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[HARRY AI] OpenAI error:", err);
    return generateRuleBasedInsight(userContent);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? generateRuleBasedInsight(userContent);
}

// ── Rule-based fallback (no AI key required) ──────────────────
function generateRuleBasedInsight(payload: string): string {
  try {
    const d = JSON.parse(payload);
    const pace    = d.volumePct   ?? 0;
    const reqd    = d.requiredPct ?? 0;
    const days    = d.daysLeft    ?? 0;
    const name    = d.name        ?? "there";
    const needed  = d.stillNeeded ?? 0;

    if (pace >= 100) {
      return `${name}, you've already hit your commitment — outstanding. Keep closing deals to push the company over its goal. Every loan now is bonus territory.`;
    }
    if (pace >= reqd + 5) {
      return `${name}, you're ahead of pace — great work. You're tracking to finish the month strong. Focus on converting your open applications to lock in the result.`;
    }
    if (pace >= reqd - 10) {
      return `${name}, you're on pace but there's no room to slow down. You have ${days} days and ${fmt$(needed)} still needed. Prioritize your warmest leads and follow up on any open preapprovals today.`;
    }
    if (pace >= reqd - 25) {
      return `${name}, you're slightly behind pace. Closing the gap requires deliberate action: contact your active referral partners, re-engage stalled files, and push for any clean loans that are close to being ready. You still have time — but only if you act now.`;
    }
    return `${name}, you're significantly behind pace with ${days} days remaining and ${fmt$(needed)} still needed. This requires immediate action: call every active preapproval, contact your top referral partners today, and schedule a coaching session with your manager. The goal is still achievable, but it requires full effort.`;
  } catch {
    return "Keep pushing. Review your pipeline, contact active referrals, and focus on your highest-probability loans. Every day matters.";
  }
}

// ── System prompts ────────────────────────────────────────────
const LO_SYSTEM_PROMPT = `You are HARRY AI, the internal performance coach for Harris Capital Mortgage Group's SLICE platform.
You analyze loan officer production data and provide honest, specific, actionable coaching.

Rules:
- Base every recommendation on the metrics provided. Never fabricate CRM data.
- Be direct and professional. This is a business context.
- Do NOT make underwriting, credit, compliance, hiring, firing, or compensation decisions.
- Do NOT reference protected characteristics.
- Do NOT access or reference borrower personal information.
- Keep responses under 150 words.
- If data is limited, say so.
- Format as plain text. No markdown headers.`;

const EXEC_SYSTEM_PROMPT = `You are HARRY AI, the executive performance intelligence assistant for Harris Capital Mortgage Group's SLICE platform.
You analyze company-level production data and generate executive briefings.

Rules:
- Be concise and data-driven. Executives need signal, not noise.
- Flag risks and opportunities backed by the data.
- Do NOT make underwriting, credit, HR, compliance, or legal decisions.
- Keep briefings under 200 words.
- Format as plain text.`;

// ── GET: retrieve recent insights ─────────────────────────────
export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as HarryInsightType | null;

  const sb = createServiceClient();
  let query = sb
    .from("harry_ai_insights")
    .select("*")
    .eq("tenant_id", HCMG_TENANT_ID)
    .is("dismissed_at", null)
    .order("created_at", { ascending: false })
    .limit(5);

  // LOs can only see their own insights
  if (!isAdmin(profile)) {
    query = query.eq("requester_id", profile.id);
  }
  if (type) query = query.eq("insight_type", type);

  const { data } = await query;
  return NextResponse.json({ insights: data ?? [] });
}

// ── POST: generate a new insight ──────────────────────────────
export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body          = await req.json().catch(() => ({}));
  const insightType   = (body.insight_type ?? "lo_coaching") as HarryInsightType;
  const targetId      = body.target_profile_id as string | undefined; // admins can target another LO

  // Enforce access control server-side
  if (!isAdmin(profile) && (insightType === "executive_briefing" || insightType === "branch_insight")) {
    return NextResponse.json({ error: "Unauthorized insight type." }, { status: 403 });
  }
  if (!isAdmin(profile) && targetId && targetId !== profile.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const sb      = createServiceClient();
  const goal    = await getActiveGoal();
  const subject = targetId ? await getProfileById(targetId) : profile;

  if (!subject) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  // ── Build minimal analytics payload ───────────────────────────
  let inputSnapshot: Record<string, unknown> = {};
  let resultText = "";

  if (insightType === "lo_coaching" || insightType === "pace_explanation" || insightType === "focus_recommendation" || insightType === "off_pace_alert") {

    const [commitment, production, leaderboard] = await Promise.all([
      goal ? getCommitment(goal.id, subject.id) : null,
      goal ? getLOProductionForMonth(subject.id, goal.id) : [],
      goal ? getLeaderboard(goal.id) : [],
    ]);

    const actualVol  = production.reduce((s, r) => s + (r.funded_volume ?? 0), 0);
    const actualUnit = production.reduce((s, r) => s + (r.funded_unit  ?? 0), 0);
    const appVol     = production.reduce((s, r) => s + (r.app_volume   ?? 0), 0);
    const appUnit    = production.reduce((s, r) => s + (r.app_unit     ?? 0), 0);
    const volCommit  = commitment?.funded_volume_commitment ?? 0;
    const days       = goal ? daysRemaining(goal.end_date) : 0;
    const elapsed    = goal ? monthProgress(goal.start_date, goal.end_date) * 100 : 0;
    const volumePct  = calcPace(actualVol, volCommit);
    const reqd       = goal ? requiredPace(goal.start_date, goal.end_date) : 0;
    const rank       = leaderboard.findIndex(r => r.profile_id === subject.id) + 1 || 0;

    inputSnapshot = {
      name:           subject.full_name.split(" ")[0],
      month:          goal?.month_label ?? "current month",
      volumeGoal:     fmt$(volCommit),
      volumeActual:   fmt$(actualVol),
      volumePct:      Math.round(volumePct),
      requiredPct:    Math.round(reqd),
      daysLeft:       days,
      elapsedPct:     Math.round(elapsed),
      stillNeeded:    fmt$(Math.max(0, volCommit - actualVol)),
      rank:           rank > 0 ? rank : null,
      appVol:         fmt$(appVol),
      appUnit,
      actualUnits:    actualUnit,
      unitCommit:     commitment?.funded_units_commitment ?? 0,
      insightType,
    };

    resultText = await callAI(
      LO_SYSTEM_PROMPT,
      JSON.stringify(inputSnapshot),
    );

  } else if (insightType === "executive_briefing") {

    const summary = goal ? await computeGoalSummary(goal) : null;
    const board   = goal ? await getLeaderboard(goal.id) : [];
    const days    = goal ? daysRemaining(goal.end_date) : 0;

    const offPace  = board.filter(r =>
      r.funded_volume_commitment > 0 &&
      (r.funded_volume_actual / r.funded_volume_commitment) * 100 < (goal ? requiredPace(goal.start_date, goal.end_date) - 15 : 50)
    ).length;

    inputSnapshot = {
      month:             goal?.month_label ?? "current month",
      companyGoal:       fmt$(goal?.funded_volume_goal ?? 0),
      totalFunded:       fmt$(summary?.totalActualVolume ?? 0),
      volumePct:         Math.round(summary?.volumePct ?? 0),
      totalCommitted:    fmt$(summary?.totalCommittedVolume ?? 0),
      participation:     `${summary?.participationCount ?? 0}/${summary?.totalLOs ?? 0}`,
      daysLeft:          days,
      offPaceCount:      offPace,
      unitGoal:          goal?.funded_units_goal ?? 0,
      totalFundedUnits:  summary?.totalActualUnits ?? 0,
      insightType,
    };

    resultText = await callAI(
      EXEC_SYSTEM_PROMPT,
      JSON.stringify(inputSnapshot),
    );
  }

  // ── Store insight ──────────────────────────────────────────────
  const { data: saved } = await sb.from("harry_ai_insights").insert({
    tenant_id:         HCMG_TENANT_ID,
    requester_id:      profile.id,
    target_profile_id: subject.id,
    insight_type:      insightType,
    reporting_period:  goal ? `${goal.month_year}-${String(goal.month_num).padStart(2,"0")}` : null,
    goal_month_id:     goal?.id ?? null,
    input_snapshot:    inputSnapshot,
    result_text:       resultText,
    model_provider:    MODEL_PROVIDER,
    prompt_version:    PROMPT_VERSION,
    expires_at:        new Date(Date.now() + 7 * 86_400_000).toISOString(),
  }).select("id, result_text, insight_type, created_at").single();

  return NextResponse.json({ insight: saved, result: resultText });
}

// ── PATCH: feedback or dismiss ─────────────────────────────────
export async function PATCH(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, feedback, dismiss, action } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sb      = createServiceClient();
  const updates: Record<string, unknown> = {};
  if (feedback)            updates.feedback     = feedback;
  if (dismiss)             updates.dismissed_at = new Date().toISOString();
  if (action)              updates.actioned_at  = new Date().toISOString();

  await sb.from("harry_ai_insights").update(updates).eq("id", id).eq("requester_id", profile.id);
  return NextResponse.json({ ok: true });
}

// ── Helper ─────────────────────────────────────────────────────
async function getProfileById(id: string) {
  const sb = createServiceClient();
  const { data } = await sb.from("profiles").select("*").eq("id", id).single();
  return data;
}
