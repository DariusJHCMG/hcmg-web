import { readFileSync } from "fs";

const BANKRATE_DIR = ".bob/tmp/xlsx-dumps/export_research_us_domain_history_usd_2026-07_bankrate.com-33954adb1485254a";
const ROCKET_DIR   = ".bob/tmp/xlsx-dumps/export_research_us_domain_history_usd_2026-07_rocketmortgage.com-8e030161a50421df";

const bankrate = JSON.parse(readFileSync(`${BANKRATE_DIR}/Sheet1.json`, "utf-8"));
const rocket   = JSON.parse(readFileSync(`${ROCKET_DIR}/Sheet1.json`, "utf-8"));

const bi = Object.fromEntries(bankrate.headers.map((h, i) => [h, i]));
const ri = Object.fromEntries(rocket.headers.map((h, i) => [h, i]));

// ── HCMG current coverage ─────────────────────────────────────────────────────

const HCMG_LEARN_SLUGS = [
  "fha-loan-requirements", "how-much-mortgage-can-i-afford", "first-time-homebuyer-programs",
  "va-loan-eligibility", "when-to-refinance", "pmi-mortgage-insurance", "mortgage-pre-approval",
];

const HCMG_CALC_KEYWORDS = [
  "mortgage calculator", "fha loan calculator", "mortgage calculator with pmi taxes and insurance",
  "amortization calculator mortgage", "piti mortgage calculator", "va loan calculator",
  "usda loan calculator", "mortgage payment calculator", "down payment calculator",
];

const HCMG_SEO_LOAN_TYPES = [
  "fha loan", "va loan", "conventional loan", "refinance", "first-time buyer",
  "jumbo loan", "usda loan", "down payment assistance", "heloc", "arm loan",
  "investment property loan", "condo loan",
];

const HCMG_STATES = ["FL", "TX", "GA", "NV", "CO", "VA", "DC", "MD", "CA", "MS"];

const HCMG_CITIES = [
  "orlando","miami","tampa","jacksonville","fort lauderdale","st. petersburg","hialeah","tallahassee","cape coral","port st. lucie",
  "atlanta","savannah","augusta","columbus","macon","athens","sandy springs","roswell",
  "dallas","houston","austin","san antonio","fort worth","el paso","arlington","plano",
  "las vegas","reno","henderson","north las vegas","sparks","carson city",
  "denver","colorado springs","aurora","fort collins","lakewood","pueblo",
  "virginia beach","richmond","norfolk","chesapeake","alexandria",
  "washington",
  "baltimore","silver spring","bowie","rockville","gaithersburg","frederick",
  "los angeles","san diego","san jose","san francisco","fresno","sacramento","long beach","oakland","bakersfield","anaheim",
  "jackson","gulfport","southaven","hattiesburg","biloxi","meridian",
];

// Helper: does HCMG cover this keyword?
function hcmgCovers(kw) {
  const k = kw.toLowerCase();
  // Calculator keywords
  if (HCMG_CALC_KEYWORDS.some(c => k.includes(c.split(" ")[0]) && k.includes("calculat"))) return "calculator";
  // Learn articles
  if (HCMG_LEARN_SLUGS.some(s => {
    const words = s.replace(/-/g, " ");
    return k.includes(words) || words.includes(k);
  })) return "learn";
  // Local SEO pages
  const cityMatch = HCMG_CITIES.some(c => k.includes(c));
  const loanMatch = HCMG_SEO_LOAN_TYPES.some(l => k.includes(l));
  if (cityMatch && loanMatch) return "local-seo";
  if (cityMatch) return "local-seo-partial";
  return null;
}

// ── Category buckets ──────────────────────────────────────────────────────────
const CATEGORIES = {
  calculator:   kw => /calculat/i.test(kw),
  learn:        kw => /\b(how|what|when|why|guide|tips|require|eligib|qualify|afford|explain|vs\b)/i.test(kw),
  local:        kw => /\b(near me|in [a-z]|[a-z]+ mortgage|[a-z]+ fha|[a-z]+ va|[a-z]+ loan)\b/i.test(kw),
  rates:        kw => /\brate[s]?\b/i.test(kw),
  brand:        kw => /bankrate|rocket|quicken|zillow|better\.com/i.test(kw),
  apply:        kw => /\b(apply|application|get a mortgage|online mortgage|get approved)\b/i.test(kw),
};

function categorize(kw) {
  if (CATEGORIES.brand(kw))      return "brand";
  if (CATEGORIES.calculator(kw)) return "calculator";
  if (CATEGORIES.rates(kw))      return "rates";
  if (CATEGORIES.local(kw))      return "local";
  if (CATEGORIES.apply(kw))      return "apply";
  if (CATEGORIES.learn(kw))      return "learn";
  return "other";
}

// ── Build gap list ────────────────────────────────────────────────────────────
const allRows = [
  ...bankrate.rows.map(r => ({ source: "bankrate", kw: String(r[bi["Keyword"]]??""  ), vol: Number(r[bi["Search vol."]]??0), traffic: Number(r[bi["Traffic"]]??0), pos: Number(r[bi["Position"]]??0) })),
  ...rocket.rows.map(r  => ({ source: "rocket",   kw: String(r[ri["Keyword"]]??""  ), vol: Number(r[ri["Search vol."]]??0), traffic: Number(r[ri["Traffic"]]??0), pos: Number(r[ri["Position"]]??0) })),
];

// Deduplicate by keyword, keep highest traffic
const kwMap = new Map();
for (const row of allRows) {
  if (!row.kw || row.kw === "Keyword") continue;
  const existing = kwMap.get(row.kw);
  if (!existing || row.traffic > existing.traffic) {
    kwMap.set(row.kw, { ...row, category: categorize(row.kw), covered: hcmgCovers(row.kw) });
  }
}

const allKws = [...kwMap.values()].sort((a, b) => b.traffic - a.traffic);

// Gap = keyword competitor ranks for, HCMG doesn't cover, not a brand term
const gaps = allKws.filter(r => !r.covered && r.category !== "brand" && r.traffic > 0);

// ── Summarise by category ─────────────────────────────────────────────────────
const catSummary = {};
for (const r of gaps) {
  if (!catSummary[r.category]) catSummary[r.category] = { count: 0, totalVol: 0, totalTraffic: 0, top: [] };
  catSummary[r.category].count++;
  catSummary[r.category].totalVol += r.vol;
  catSummary[r.category].totalTraffic += r.traffic;
  if (catSummary[r.category].top.length < 8) {
    catSummary[r.category].top.push({ kw: r.kw, vol: r.vol, traffic: r.traffic, pos: r.pos, source: r.source });
  }
}

// ── Coverage summary ──────────────────────────────────────────────────────────
const covered = allKws.filter(r => r.covered);
const coverageSummary = {
  total_competitor_keywords: allKws.length,
  hcmg_covers: covered.length,
  hcmg_coverage_pct: (covered.length / allKws.length * 100).toFixed(1) + "%",
  gap_keywords: gaps.length,
  gap_traffic: gaps.reduce((s, r) => s + r.traffic, 0),
  covered_traffic: covered.reduce((s, r) => s + r.traffic, 0),
};

// ── Top 15 highest-traffic gaps overall ─────────────────────────────────────
const top15Gaps = gaps.slice(0, 15).map(r => ({
  keyword: r.kw, category: r.category, vol: r.vol, traffic: r.traffic, source: r.source
}));

console.log(JSON.stringify({ coverageSummary, catSummary, top15Gaps }, null, 2));
