/**
 * /admin/goal-engine — Goal Engine Admin Hub
 * Create goals, view all goals, manage, and trigger emails.
 */

import { redirect } from "next/navigation";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { getAllGoals, fmt$ } from "@/lib/goal-engine";
import Link from "next/link";
import { GoalCreateForm } from "@/components/goal-engine/GoalCreateForm";
import { GoalAdminCard } from "@/components/goal-engine/GoalAdminCard";

export const dynamic = "force-dynamic";

export default async function AdminGoalEnginePage() {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) redirect("/admin");

  const goals = await getAllGoals();
  const activeGoals = goals.filter((g) => g.is_published);
  const draftGoals  = goals.filter((g) => !g.is_published);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted/60">Administration</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">Goal Engine™</h1>
          <p className="mt-0.5 text-sm text-muted">Create monthly goals, manage commitments, run awards, and track production.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/goal-engine/dashboard"
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink hover:bg-sand transition-colors"
          >
            📊 Manager View
          </Link>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted/60 mb-1">Total Goals</p>
          <p className="text-2xl font-extrabold text-ink">{goals.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted/60 mb-1">Active</p>
          <p className="text-2xl font-extrabold text-green-600">{activeGoals.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted/60 mb-1">Drafts</p>
          <p className="text-2xl font-extrabold text-yellow-600">{draftGoals.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-[#142850] p-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-1">Zapier Endpoint</p>
          <p className="text-xs font-mono text-blue-200 truncate">/api/goal-engine/zapier</p>
        </div>
      </div>

      {/* Create new goal */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="font-bold text-ink mb-1">Create New Monthly Goal</h2>
        <p className="text-sm text-muted mb-6">
          Publishing a goal automatically emails every active Loan Officer with the announcement.
        </p>
        <GoalCreateForm />
      </div>

      {/* Existing goals */}
      {goals.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-bold text-ink">All Goals</h2>
          <div className="space-y-3">
            {goals.map((goal) => (
              <GoalAdminCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
