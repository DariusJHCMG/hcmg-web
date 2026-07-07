import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isAdmin, logAudit } from "@/lib/auth";
import { z } from "zod";

const PatchSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "closed", "lost"]).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const caller = await getCurrentProfile();
  if (!caller || !isAdmin(caller)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const sb = createServiceClient();
  const { error } = await sb.from("leads").update(parsed.data).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (parsed.data.status) {
    logAudit("lead.status_changed", { lead_id: id, status: parsed.data.status }, caller.id, caller.email);
  }

  return NextResponse.json({ ok: true });
}
