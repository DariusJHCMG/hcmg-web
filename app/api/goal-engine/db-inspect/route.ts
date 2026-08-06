/**
 * GET /api/goal-engine/db-inspect
 * Temporary diagnostic — lists all public schema tables visible to service role.
 * DELETE THIS ROUTE after use.
 */
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const sb = createServiceClient();

  // Check if TenantMembership exists and has rows
  const checks = await Promise.all([
    sb.from("TenantMembership").select("*", { count: "exact", head: true }),
    sb.from("User").select("*", { count: "exact", head: true }),
    sb.from("profiles").select("*", { count: "exact", head: true }),
    sb.from("goal_months").select("*", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    TenantMembership: { error: checks[0].error?.message ?? null, count: checks[0].count },
    User:             { error: checks[1].error?.message ?? null, count: checks[1].count },
    profiles:         { error: checks[2].error?.message ?? null, count: checks[2].count },
    goal_months:      { error: checks[3].error?.message ?? null, count: checks[3].count },
  });
}
