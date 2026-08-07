/**
 * HCMG Goal Engine™ — Core Utilities
 * Server-side helpers for reading/writing goal data.
 */

import { createServiceClient } from "./supabase";
import type {
  GoalMonth,
  GoalCommitment,
  GoalProduction,
  LeaderboardRow,
  GoalAward,
  GoalNotification,
  Profile,
} from "./database.types";

// ── Format helpers ────────────────────────────────────────────

export function fmt$(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function fmtPct(n: number): string {
  return `${Math.round(n)}%`;
}

export function paceColor(pct: number): "green" | "yellow" | "red" {
  if (pct >= 90) return "green";
  if (pct >= 70) return "yellow";
  return "red";
}

export function paceLabel(pct: number): string {
  if (pct >= 100) return "On Pace 🟢";
  if (pct >= 80)  return "Slightly Behind 🟡";
  return "Off Track 🔴";
}

/** Days remaining in month as fraction of month elapsed (for pace calc). */
export function monthProgress(start: string, end: string): number {
  const now   = Date.now();
  const s     = new Date(start).getTime();
  const e     = new Date(end).getTime();
  if (now >= e) return 1;
  if (now <= s) return 0;
  return (now - s) / (e - s);
}

export function daysRemaining(end: string): number {
  const diff = new Date(end).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

/**
 * Required pace to be "on track" by end of month.
 * e.g., 50% of month elapsed → you should have 50% of commitment done.
 */
export function requiredPace(start: string, end: string): number {
  return monthProgress(start, end) * 100;
}

/**
 * Pace percentage: actual/commitment * 100
 */
export function calcPace(actual: number, commitment: number): number {
  if (!commitment || commitment === 0) return 0;
  return (actual / commitment) * 100;
}

// ── Current/active goal ───────────────────────────────────────

export async function getActiveGoal(): Promise<GoalMonth | null> {
  const sb  = createServiceClient();
  const now = new Date().toISOString().split("T")[0];

  // First: try exact date-range match (goal running right now)
  const { data: exact } = await sb
    .from("goal_months")
    .select("*")
    .eq("is_published", true)
    .lte("start_date", now)
    .gte("end_date", now)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (exact) return exact as GoalMonth;

  // Fallback: most recently published goal (covers "just ended" month still visible)
  const { data: latest } = await sb
    .from("goal_months")
    .select("*")
    .eq("is_published", true)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (latest as GoalMonth | null) ?? null;
}

export async function getGoalById(id: string): Promise<GoalMonth | null> {
  const sb = createServiceClient();
  const { data } = await sb.from("goal_months").select("*").eq("id", id).single();
  return data as GoalMonth | null;
}

export async function getAllGoals(): Promise<GoalMonth[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("goal_months")
    .select("*")
    .order("month_year", { ascending: false })
    .order("month_num",  { ascending: false });
  return (data ?? []) as GoalMonth[];
}

// ── Commitments ───────────────────────────────────────────────

export async function getCommitment(
  goalMonthId: string,
  profileId: string,
): Promise<GoalCommitment | null> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("goal_commitments")
    .select("*")
    .eq("goal_month_id", goalMonthId)
    .eq("profile_id", profileId)
    .single();
  return data as GoalCommitment | null;
}

export async function getAllCommitmentsForGoal(
  goalMonthId: string,
): Promise<GoalCommitment[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("goal_commitments")
    .select("*")
    .eq("goal_month_id", goalMonthId);
  return (data ?? []) as GoalCommitment[];
}

// ── Production ────────────────────────────────────────────────

export async function getProductionForMonth(
  goalMonthId: string,
): Promise<GoalProduction[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("goal_production")
    .select("*")
    .eq("goal_month_id", goalMonthId);
  return (data ?? []) as GoalProduction[];
}

export async function getLOProductionForMonth(
  profileId: string,
  goalMonthId: string,
): Promise<GoalProduction[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("goal_production")
    .select("*")
    .eq("profile_id", profileId)
    .eq("goal_month_id", goalMonthId);
  return (data ?? []) as GoalProduction[];
}

// ── Leaderboard ───────────────────────────────────────────────

export async function getLeaderboard(
  goalMonthId: string,
): Promise<LeaderboardRow[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("goal_leaderboard")
    .select("*")
    .eq("goal_month_id", goalMonthId)
    .order("funded_volume_actual", { ascending: false });
  return (data ?? []) as LeaderboardRow[];
}

// ── Awards ────────────────────────────────────────────────────

export async function getAwardsForMonth(
  goalMonthId: string,
): Promise<GoalAward[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("goal_awards")
    .select("*")
    .eq("goal_month_id", goalMonthId);
  return (data ?? []) as GoalAward[];
}

export async function getLOAwards(profileId: string): Promise<GoalAward[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("goal_awards")
    .select("*")
    .eq("profile_id", profileId)
    .order("issued_at", { ascending: false });
  return (data ?? []) as GoalAward[];
}

// ── Notifications ─────────────────────────────────────────────

export async function getNotifications(
  profileId: string,
  limit = 20,
): Promise<GoalNotification[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("goal_notifications")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as GoalNotification[];
}

export async function createNotification(
  profileId: string,
  title: string,
  body: string | null,
  type: GoalNotification["type"],
  link?: string,
) {
  const sb = createServiceClient();
  await sb.from("goal_notifications").insert({
    profile_id: profileId,
    title,
    body,
    type,
    link: link ?? null,
  });
}

// ── All active LOs ────────────────────────────────────────────

export async function getActiveLoanOfficers(): Promise<Profile[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("profiles")
    .select("*")
    .eq("is_active", true)
    .order("full_name");
  return (data ?? []) as Profile[];
}

// ── Summary stats for a goal ──────────────────────────────────

export interface GoalSummary {
  totalCommittedVolume: number;
  totalActualVolume: number;
  totalCommittedUnits: number;
  totalActualUnits: number;
  participationCount: number;
  totalLOs: number;
  volumePct: number;
  unitsPct: number;
  commitVsGoalPct: number;
}

export async function computeGoalSummary(
  goal: GoalMonth,
): Promise<GoalSummary> {
  const sb = createServiceClient();

  const [rows, allLOs, assignmentsResult] = await Promise.all([
    getLeaderboard(goal.id),
    getActiveLoanOfficers(),
    sb.from("goal_assignments").select("profile_id").eq("goal_month_id", goal.id),
  ]);

  const assignments = assignmentsResult.data ?? [];

  // If assignments exist, participation is measured only against assigned LOs.
  // If no assignments have been made yet, fall back to all active LOs (legacy behaviour).
  const assignedIds = assignments.map((a) => a.profile_id);
  const effectiveLOCount =
    assignedIds.length > 0 ? assignedIds.length : allLOs.length;

  // Participation = committed rows that belong to assigned LOs (or all LOs if none assigned)
  const eligibleCommitted = rows.filter((r) =>
    r.submitted_at &&
    (assignedIds.length === 0 || assignedIds.includes(r.profile_id))
  );

  const totalCommittedVolume = rows.reduce((s, r) => s + r.funded_volume_commitment, 0);
  const totalActualVolume    = rows.reduce((s, r) => s + r.funded_volume_actual,     0);
  const totalCommittedUnits  = rows.reduce((s, r) => s + r.funded_units_commitment,  0);
  const totalActualUnits     = rows.reduce((s, r) => s + r.funded_units_actual,      0);
  const participationCount   = eligibleCommitted.length;

  return {
    totalCommittedVolume,
    totalActualVolume,
    totalCommittedUnits,
    totalActualUnits,
    participationCount,
    totalLOs: effectiveLOCount,
    volumePct:       goal.funded_volume_goal > 0 ? (totalActualVolume    / goal.funded_volume_goal)  * 100 : 0,
    unitsPct:        goal.funded_units_goal  > 0 ? (totalActualUnits     / goal.funded_units_goal)   * 100 : 0,
    commitVsGoalPct: goal.funded_volume_goal > 0 ? (totalCommittedVolume / goal.funded_volume_goal)  * 100 : 0,
  };
}

// ── AWARD_CATALOG ─────────────────────────────────────────────

export const AWARD_CATALOG = [
  { type: "funded_champion",   label: "Funded Volume Champion",      emoji: "🏆" },
  { type: "units_champion",    label: "Funded Units Champion",       emoji: "🏆" },
  { type: "app_champion",      label: "Application Champion",        emoji: "🔥" },
  { type: "best_conversion",   label: "Best Conversion Rate",        emoji: "📈" },
  { type: "most_improved",     label: "Most Improved",               emoji: "⚡" },
  { type: "top_commitment",    label: "Top Commitment Achievement",  emoji: "💎" },
  { type: "presidents_club",   label: "President's Club",            emoji: "🥇" },
  { type: "million_dollar",    label: "Million Dollar Club",         emoji: "💰" },
  { type: "perfect_goal",      label: "Perfect Goal Achievement",    emoji: "🎯" },
  { type: "fastest_commit",    label: "Fastest to Commitment",       emoji: "⚡" },
  { type: "largest_slice",     label: "Largest Slice of the Pie",    emoji: "👑" },
] as const;

export type AwardType = typeof AWARD_CATALOG[number]["type"];
