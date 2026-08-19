/**
 * One-shot backfill — August 2026 ARIVE loans missing from SLICE.
 * Run: npx ts-node scripts/backfill-august-2026.ts
 *
 * Or POST the JSON body directly to:
 *   POST https://slice.hcmgloans.com/api/goal-engine/backfill-production
 *   Cookie: (your admin session cookie)
 */

// All loans from ARIVE export that are missing from SLICE.
// lo_nmls is the primary identifier. lo_name is fallback.
// app_date = "App/TRID Completed Date" from ARIVE (blank = null, goal month resolved by current month).
// funded_date = "Loan Funded" date from ARIVE (blank = not funded yet).

const records = [
  // ── Aaron Clark (NMLS 1588427) ─────────────────────────────────────
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17438142", app_volume: 349500 },
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17429812", app_volume: 225833 },
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17385326", app_volume: 261751 },
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17384890", app_volume: 60000,   app_date: "2026-08-06" },
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17382327", app_volume: 218153 },
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17381948", app_volume: 0 },      // no amount in ARIVE
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17381936", app_volume: 700000 },
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17381928", app_volume: 961875 },
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17381912", app_volume: 180000 },
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17378656", app_volume: 340000,   app_date: "2026-08-06" },
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17377743", app_volume: 236500 },
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17377426", app_volume: 170000 },
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17372641", app_volume: 202500 },
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17371519", app_volume: 388000 },
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17371067", app_volume: 235653,   app_date: "2026-08-04" },
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17366047", app_volume: 192307 },
  {
    lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17365510",
    app_volume: 821250, app_date: "2026-08-04",
    // This loan has Approved w/ Conditions — NOT funded yet, no funded_date
  },
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17365494", app_volume: 258750,   app_date: "2026-08-05" },

  // ── Lamont Harris Jr. (NMLS 491049) ────────────────────────────────
  { lo_nmls: "491049",  lo_name: "Lamont Harris", loan_id: "17403317", app_volume: 318750 },
  { lo_nmls: "491049",  lo_name: "Lamont Harris", loan_id: "17395396", app_volume: 315000 },
  { lo_nmls: "491049",  lo_name: "Lamont Harris", loan_id: "17375148", app_volume: 250000 },

  // ── Darius James (NMLS 1097168) ────────────────────────────────────
  { lo_nmls: "1097168", lo_name: "Darius James", loan_id: "17412568", app_volume: 163500 },
  { lo_nmls: "1097168", lo_name: "Darius James", loan_id: "17368676", app_volume: 76000,   app_date: "2026-08-03",  funded_date: "2026-08-08", funded_volume: 76000 },
  { lo_nmls: "1097168", lo_name: "Darius James", loan_id: "17368637", app_volume: 132000,  app_date: "2026-08-03",  funded_date: "2026-08-08", funded_volume: 132000 },

  // ── QuTeece Square (NMLS 1930150) ───────────────────────────────────
  { lo_nmls: "1930150", lo_name: "QuTeece Square", loan_id: "17384600", app_volume: 350000 },
  { lo_nmls: "1930150", lo_name: "QuTeece Square", loan_id: "17367709", app_volume: 0 },   // no amount yet
  { lo_nmls: "1930150", lo_name: "QuTeece Square", loan_id: "17361233", app_volume: 0 },   // no amount yet

  // ── Beni Briones — no LO NMLS matched, skip or add LO first ───────
  // Loan 17428506 — loanOfficerNmls: 1588427 (Aaron Clark) per ARIVE
  { lo_nmls: "1588427", lo_name: "Aaron Clark", loan_id: "17428506", app_volume: 280000,   app_date: "2026-08-11" },
];

// Filter out zero-volume records (no loan amount in ARIVE — can't count them)
const validRecords = records.filter(r => r.app_volume && r.app_volume > 0);

console.log(`Sending ${validRecords.length} records to backfill endpoint...`);
console.log(JSON.stringify({ records: validRecords }, null, 2));
