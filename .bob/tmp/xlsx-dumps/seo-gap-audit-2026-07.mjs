import { readFileSync } from "fs";

// ── Load all three datasets ──────────────────────────────────────────────────
const HCMG_DIR  = ".bob/tmp/xlsx-dumps/hcmgloans_com_positions_detailed_2026-07-08-5fffeff300cc19e7";
const BR_DIR    = ".bob/tmp/xlsx-dumps/export_research_us_domain_history_usd_2026-07_bankrate.com-33954adb1485254a";
const RM_DIR    = ".bob/tmp/xlsx-dumps/export_research_us_domain_history_usd_2026-07_rocketmortgage.com-8e030161a50421df";

function loadSheet(dir, name) {
  const manifest = JSON.parse(readFileSync(`${dir}/manifest.json`, "utf8"));
  const meta = manifest.sheets.find(s => s.name === name);
  return JSON.parse(readFileSync(`${dir}/${meta.file}`, "utf8"));
}

const hcmgSheet = loadSheet(HCMG_DIR,  "Sheet1");
const brSheet   = loadSheet(BR_DIR,    "Sheet1");
const rmSheet   = loadSheet(RM_DIR,    "Sheet1");

// HCMG sheet has real headers on row 0 of sampleRows → actual data starts at row 1
// Based on dump, headers are the merged cell text; real col names in row[0]
const hcmgRows = hcmgSheet.rows.filter(r => r[0] && r[0] !== "Keyword");
const hcmgKeywords = new Set(hcmgRows.map(r => String(r[0]).toLowerCase().trim()));

// Competitor sheets: standard headers
const brIdx  = Object.fromEntries(brSheet.headers.map((h,i) => [h,i]));
const rmIdx  = Object.fromEntries(rmSheet.headers.map((h,i) => [h,i]));

// ── Helper: categorise a keyword ────────────────────────────────────────────
function categorise(kw) {
  const k = kw.toLowerCase();
  if (/calculator|calc\b|calcul/.test(k))              return "calculator";
  if (/fha/.test(k))                                   return "fha";
  if (/\bva\b|veteran|military/.test(k))               return "va";
  if (/refinanc/.test(k))                              return "refinance";
  if (/first.?time|first time/.test(k))                return "first-time-buyer";
  if (/down payment/.test(k))                          return "down-payment";
  if (/usda/.test(k))                                  return "usda";
  if (/jumbo/.test(k))                                 return "jumbo";
  if (/heloc|home equity/.test(k))                     return "heloc";
  if (/conventional/.test(k))                          return "conventional";
  if (/closing cost/.test(k))                          return "closing-costs";
  if (/dti|debt.to.income|debt to income/.test(k))     return "dti";
  if (/amortiz/.test(k))                               return "amortization";
  if (/pre.?approv|preapprov/.test(k))                 return "pre-approval";
  if (/rate|rates/.test(k))                            return "mortgage-rates";
  if (/afford/.test(k))                                return "affordability";
  if (/credit score/.test(k))                          return "credit-score";
  if (/pmi|mortgage insurance/.test(k))                return "pmi";
  if (/invest|rental/.test(k))                         return "investment";
  if (/glossary|definition|what is/.test(k))           return "glossary";
  if (/florida|miami|orlando|tampa|jacksonville/.test(k)) return "local-fl";
  if (/texas|dallas|houston|austin|san antonio/.test(k))  return "local-tx";
  if (/nevada|las vegas|henderson|reno/.test(k))           return "local-nv";
  if (/georgia|atlanta|savannah/.test(k))                  return "local-ga";
  if (/colorado|denver/.test(k))                           return "local-co";
  if (/virginia|richmond|norfolk/.test(k))                 return "local-va";
  if (/maryland|baltimore/.test(k))                        return "local-md";
  if (/california|los angeles|san diego/.test(k))          return "local-ca";
  if (/\bdc\b|washington/.test(k))                         return "local-dc";
  if (/mississippi|jackson ms/.test(k))                    return "local-ms";
  if (/learn|how to|guide|tips|what is|explain/.test(k))   return "educational";
  return "other";
}

// ── Aggregate competitor keywords not in HCMG ───────────────────────────────
const gapByCategory = {};
const topGaps = [];

function processCompetitor(sheet, idx, source) {
  for (const row of sheet.rows) {
    const kw  = row[idx["Keyword"]];
    const vol = Number(row[idx["Search vol."]]) || 0;
    const pos = Number(row[idx["Position"]]) || 99;
    const diff= Number(row[idx["Difficulty"]]) || 0;
    if (!kw || vol < 500) continue;

    const kwLower = String(kw).toLowerCase().trim();
    if (hcmgKeywords.has(kwLower)) continue; // HCMG already ranks

    const cat = categorise(kwLower);
    if (!gapByCategory[cat]) gapByCategory[cat] = { totalVol: 0, count: 0, avgDiff: 0, diffSum: 0, topKws: [] };
    const c = gapByCategory[cat];
    c.totalVol += vol;
    c.count++;
    c.diffSum += diff;
    if (pos <= 10 && vol >= 2000) {
      topGaps.push({ kw: kwLower, vol, pos, diff, source, cat });
    }
  }
}

processCompetitor(brSheet, brIdx, "Bankrate");
processCompetitor(rmSheet, rmIdx, "RocketMortgage");

// Compute averages
for (const cat of Object.keys(gapByCategory)) {
  const c = gapByCategory[cat];
  c.avgDiff = Math.round(c.diffSum / c.count);
  delete c.diffSum;
}

// Sort gap categories by total volume
const sortedCats = Object.entries(gapByCategory)
  .sort((a, b) => b[1].totalVol - a[1].totalVol);

// Top individual gap keywords (sorted by vol, deduplicated)
const seen = new Set();
const dedupedTopGaps = topGaps
  .filter(g => { const k = g.kw; if (seen.has(k)) return false; seen.add(k); return true; })
  .sort((a, b) => b.vol - a.vol)
  .slice(0, 50);

// ── HCMG keyword summary ─────────────────────────────────────────────────────
const hcmgCats = {};
for (const row of hcmgRows) {
  const kw = String(row[0]).toLowerCase().trim();
  const cat = categorise(kw);
  hcmgCats[cat] = (hcmgCats[cat] || 0) + 1;
}

// ── Bankrate calculator cluster breakdown ────────────────────────────────────
const calcCluster = brSheet.rows
  .filter(r => {
    const url = String(r[brIdx["URL"]] || "");
    return url.includes("mortgage-calculator");
  })
  .reduce((acc, r) => {
    acc.keywords++;
    acc.traffic += Number(r[brIdx["Traffic"]]) || 0;
    acc.vol += Number(r[brIdx["Search vol."]]) || 0;
    return acc;
  }, { keywords: 0, traffic: 0, vol: 0 });

// ── Output ───────────────────────────────────────────────────────────────────
const result = {
  hcmg_total_keywords: hcmgKeywords.size,
  competitor_total_keywords_sampled: brSheet.rows.length + rmSheet.rows.length,
  bankrate_calc_cluster: calcCluster,
  gap_by_category: sortedCats.map(([cat, data]) => ({ cat, ...data })),
  hcmg_coverage_by_category: Object.entries(hcmgCats).sort((a,b)=>b[1]-a[1]).map(([cat,count])=>({cat,count})),
  top_50_gap_keywords: dedupedTopGaps,
};

console.log(JSON.stringify(result, null, 2));
