/**
 * Backfill August 2026 production data from ARIVE CSV exports.
 * Calls Supabase directly (bypasses HTTP auth) using the service role key.
 *
 * Usage: node scripts/backfill-august.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Keys read from .env.local (never hardcoded)
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

// ── minimal CSV parser (handles quoted fields with commas) ────────
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  function splitLine(line) {
    const fields = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { fields.push(cur); cur = ""; }
      else { cur += ch; }
    }
    fields.push(cur);
    return fields;
  }
  const headers = splitLine(lines[0]);
  return lines.slice(1).map(l => {
    const vals = splitLine(l);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] ?? "").trim(); });
    return obj;
  });
}

// ── helpers ──────────────────────────────────────────────────────
function normDate(v) {
  if (!v || !String(v).trim()) return null;
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}[ T]/.test(s)) return s.slice(0, 10);
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) return `${us[3]}-${us[1].padStart(2,"0")}-${us[2].padStart(2,"0")}`;
  try { const d = new Date(s); if (!isNaN(d.getTime())) return d.toISOString().slice(0,10); } catch {}
  return null;
}

function normAmount(v) {
  if (!v || v === "") return null;
  const n = parseFloat(String(v).replace(/[$,]/g, ""));
  return isNaN(n) || n <= 0 ? null : n;
}

// ── load CSVs ─────────────────────────────────────────────────────
const appFile    = join(ROOT, "public/AUG - 2026-08-07T02_39_28.633Z.csv");
const fundedFile = join(ROOT, "public/AUG - 2026-08-07T02_38_40.117Z.csv");

const appRows    = parseCsv(readFileSync(appFile,    "utf8"));
const fundedRows = parseCsv(readFileSync(fundedFile, "utf8"));

console.log(`Applications CSV: ${appRows.length} rows`);
console.log(`Funded CSV: ${fundedRows.length} rows`);

// ── get August goal month ─────────────────────────────────────────
const { data: goals, error: goalsErr } = await sb
  .from("goal_months")
  .select("id, month_label, start_date, end_date")
  .order("start_date", { ascending: false });

if (goalsErr) { console.error("Failed to load goals:", goalsErr.message); process.exit(1); }
console.log("\nGoal months in DB:");
goals.forEach(g => console.log(`  ${g.month_label}  ${g.start_date} → ${g.end_date}  id=${g.id}`));

// Find August 2026 goal
const augustGoal = goals.find(g => g.month_label?.toLowerCase().includes("august"));
if (!augustGoal) { console.error("\n❌ No August goal found. Create it first."); process.exit(1); }
console.log(`\n✅ Using goal: ${augustGoal.month_label} (${augustGoal.id})`);

// ── load all profiles for NMLS matching ──────────────────────────
const { data: profiles } = await sb.from("profiles").select("id, full_name, nmls, email, arive_name");
const byNmls  = new Map(profiles.filter(p => p.nmls).map(p => [String(p.nmls).trim(), p]));
const byEmail = new Map(profiles.filter(p => p.email).map(p => [p.email.toLowerCase().trim(), p]));
const byName  = new Map(profiles.map(p => [p.full_name.toLowerCase().trim(), p]));
const byArive = new Map(profiles.filter(p => p.arive_name).map(p => [p.arive_name.toLowerCase().trim(), p]));

function resolveProfile(nmls, name) {
  if (nmls) {
    const p = byNmls.get(String(nmls).trim());
    if (p) return p;
  }
  if (name) {
    const lc = name.toLowerCase().trim();
    return byName.get(lc) ?? byArive.get(lc) ?? null;
  }
  return null;
}

// ── process rows ──────────────────────────────────────────────────
const stats = { created: 0, updated: 0, skipped: 0, errors: [] };

async function upsertRow({ loanId, profile, isFunded, fundedDate, fundedVol, appDate, appVol }) {
  const { data: existing } = await sb
    .from("goal_production")
    .select("id, funded_date, funded_volume, app_date, app_volume, event_type")
    .eq("loan_id", loanId)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (existing) {
    const merged = { goal_month_id: augustGoal.id };
    if (isFunded) {
      merged.event_type    = "funded";
      if (fundedDate) merged.funded_date   = fundedDate;
      if (fundedVol)  merged.funded_volume = fundedVol;
      merged.funded_unit = 1;
      if (!existing.app_date   && appDate) merged.app_date   = appDate;
      if (!existing.app_volume && appVol)  merged.app_volume = appVol;
      if (!existing.app_volume) merged.app_unit = 1;
    } else {
      if (existing.event_type !== "funded") merged.event_type = "application";
      if (appDate) merged.app_date   = appDate;
      if (appVol)  merged.app_volume = appVol;
      merged.app_unit = 1;
    }
    const { error } = await sb.from("goal_production").update(merged).eq("id", existing.id);
    if (error) { stats.errors.push(`update ${loanId}: ${error.message}`); } else { stats.updated++; }
  } else {
    const insert = {
      profile_id: profile.id, goal_month_id: augustGoal.id,
      loan_id: loanId, source: "backfill",
      event_type: isFunded ? "funded" : "application",
    };
    if (isFunded) {
      insert.funded_date = fundedDate; insert.funded_volume = fundedVol; insert.funded_unit = 1;
      insert.app_date    = appDate ?? fundedDate;
      insert.app_volume  = appVol  ?? fundedVol;
      insert.app_unit    = 1;
    } else {
      insert.app_date = appDate; insert.app_volume = appVol; insert.app_unit = 1; insert.funded_unit = 0;
    }
    const { error } = await sb.from("goal_production").insert(insert);
    if (error) { stats.errors.push(`insert ${loanId}: ${error.message}`); } else { stats.created++; }
  }
}

// Process applications
for (const row of appRows) {
  const loanId  = String(row["ARIVE Loan Id"] ?? "").trim();
  if (!loanId) { stats.skipped++; continue; }
  const nmls    = String(row["Primary Loan Officer NMLS"] ?? "").trim();
  const name    = String(row["Primary Loan Officer Name"] ?? "").trim();
  const profile = resolveProfile(nmls, name);
  if (!profile) { console.log(`  ⚠ LO not found: NMLS=${nmls} name="${name}" (loan ${loanId})`); stats.skipped++; continue; }

  // Determine if funded (Loan Funded date is set)
  const fundedDate = normDate(row["Loan Funded"]);
  const fundedVol  = fundedDate ? normAmount(row["Total Loan Amount"]) : null;
  const appDate    = normDate(row["App/TRID Completed Date"]) ?? normDate(row["Purchase Date"]);
  const appVol     = normAmount(row["Total Loan Amount"]);
  const isFunded   = !!fundedDate;

  await upsertRow({ loanId, profile, isFunded, fundedDate, fundedVol, appDate, appVol });
}

// Process funded (second CSV — may overlap with apps, merge logic handles it)
for (const row of fundedRows) {
  const loanId  = String(row["ARIVE Loan Id"] ?? "").trim();
  if (!loanId) { stats.skipped++; continue; }
  const nmls    = String(row["Primary Loan Officer NMLS"] ?? "").trim();
  const name    = String(row["Primary Loan Officer Name"] ?? "").trim();
  const profile = resolveProfile(nmls, name);
  if (!profile) { console.log(`  ⚠ LO not found: NMLS=${nmls} name="${name}" (loan ${loanId})`); stats.skipped++; continue; }

  const fundedDate = normDate(row["Loan Funded"]);
  const fundedVol  = normAmount(row["Total Loan Amount"]);
  const appDate    = normDate(row["App/TRID Completed Date"]) ?? normDate(row["Purchase Date"]);
  const appVol     = normAmount(row["Total Loan Amount"]);

  await upsertRow({ loanId, profile, isFunded: true, fundedDate, fundedVol, appDate, appVol });
}

// ── summary ───────────────────────────────────────────────────────
console.log(`\n📊 Backfill complete:`);
console.log(`   Created: ${stats.created}`);
console.log(`   Updated: ${stats.updated}`);
console.log(`   Skipped: ${stats.skipped}`);
if (stats.errors.length) {
  console.log(`   Errors (${stats.errors.length}):`);
  stats.errors.forEach(e => console.log(`     - ${e}`));
}
