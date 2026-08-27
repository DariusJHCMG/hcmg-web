/**
 * POST /api/admin/dev/revalidate — purge Next.js ISR cache for all public pages.
 * Useful after bulk content changes that need to be reflected immediately.
 * Auth: admin role required.
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentProfile, isAdmin } from "@/lib/auth";

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Revalidate all known routes
  const paths = ["/", "/team", "/about", "/careers", "/glossary", "/contact", "/join", "/get-started"];
  for (const p of paths) revalidatePath(p);

  return NextResponse.json({ ok: true });
}
