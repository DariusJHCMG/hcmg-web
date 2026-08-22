import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Profile } from "@/lib/database.types";
import { LiftOffRolesClient } from "@/components/liftoff/LiftOffRolesClient";

export const dynamic = "force-dynamic";

async function getAllUsers(): Promise<Profile[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("profiles")
    .select("id, full_name, email, role, nmls, title, liftoff_roles, is_active, avatar_url")
    .order("full_name");
  return (data ?? []) as Profile[];
}

export default async function LiftOffUsersPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin" && profile.role !== "developer") redirect("/liftoff");

  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="ok-gradient-text text-xs font-bold uppercase tracking-[0.2em]">Harris Capital Mortgage Group</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">Lift Off — Team & Roles</h1>
          <p className="mt-0.5 text-sm text-muted">Assign Lift Off roles to team members.</p>
        </div>
        <Link href="/admin/liftoff"
          className="text-xs font-bold text-muted hover:text-accent transition-colors">
          ← Ops Queue
        </Link>
      </div>

      <LiftOffRolesClient initialUsers={users} />
    </div>
  );
}
