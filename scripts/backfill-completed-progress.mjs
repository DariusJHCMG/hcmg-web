/**
 * Backfill: mark uni_progress rows as completed=true where the learner
 * reached or exceeded the lesson's watch threshold but the completed flag
 * was never flipped (common for HeyGen iframe lessons and text lessons
 * that were watched before the session/complete integrity check was added).
 *
 * Usage: node scripts/backfill-completed-progress.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: new URL("../.env.local", import.meta.url).pathname });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// 1. Find all stuck progress rows
const { data: stuckRows, error: fetchErr } = await sb
  .from("uni_progress")
  .select("id, profile_id, lesson_id, watch_pct, completed_at, uni_lessons!inner(completion_threshold_pct, completion_mode)")
  .eq("completed", false)
  .eq("uni_lessons.completion_mode", "watch_pct");

if (fetchErr) { console.error("Fetch error:", fetchErr.message); process.exit(1); }

const toFix = (stuckRows ?? []).filter(row => {
  const threshold = row.uni_lessons?.completion_threshold_pct ?? 80;
  return row.watch_pct >= threshold;
});

console.log(`Found ${toFix.length} stuck progress rows to backfill.`);
if (toFix.length === 0) { console.log("Nothing to do."); process.exit(0); }

for (const row of toFix) {
  const { error } = await sb
    .from("uni_progress")
    .update({
      completed:    true,
      completed_at: row.completed_at ?? new Date().toISOString(),
    })
    .eq("id", row.id);

  if (error) {
    console.error(`  ✗ Failed to update row ${row.id}:`, error.message);
  } else {
    console.log(`  ✓ Backfilled lesson ${row.lesson_id} for profile ${row.profile_id} (watch_pct=${row.watch_pct})`);
  }
}

console.log("Done.");
