import { readFileSync } from "fs";

const BANKRATE_DIR  = ".bob/tmp/xlsx-dumps/export_research_us_domain_history_usd_2026-07_bankrate.com-33954adb1485254a";
const ROCKET_DIR    = ".bob/tmp/xlsx-dumps/export_research_us_domain_history_usd_2026-07_rocketmortgage.com-8e030161a50421df";
const HCMG_DIR      = ".bob/tmp/xlsx-dumps/hcmgloans_com_positions_detailed_2026-07-08-5fffeff300cc19e7";

const bankrate = JSON.parse(readFileSync(`${BANKRATE_DIR}/Sheet1.json`, "utf-8"));
const rocket   = JSON.parse(readFileSync(`${ROCKET_DIR}/Sheet1.json`, "utf-8"));
const hcmg     = JSON.parse(readFileSync(`${HCMG_DIR}/Sheet1.json`, "utf-8"));

const bi = Object.fromEntries(bankrate.headers.map((h, i) => [h, i]));
const ri = Object.fromEntries(rocket.headers.map((h, i) => [h, i]));

// ── LEARN-type keywords: informational / educational mortgage content ──────────
const LEARN_PATTERNS = [
  /how (to|much|long|do|does|can|many)/i,
  /what is|what are|what does/i,
  /\bguide\b|\btips\b|\bsteps\b|\badvice\b/i,
  /requirements?/i,
  /eligib/i,
  /\bfirst.?time\b/i,
  /\bpre.?approv/i,
  /\bpmi\b/i,
  /\bdown payment\b/i,
  /\bcredit score\b/i,
  /\binterest rate\b/i,
  /\brefinan/i,
  /\bafford/i,
  /\bqualif/i,
  /\bclos/i,
  /\bescrow\b/i,
  /\bpoints\b/i,
  /\bamortiz/i,
  /\bdti\b|debt.to.income/i,
  /\bconventional loan\b/i,
  /\bfha loan\b/i,
  /\bva loan\b/i,
  /\busda\b/i,
  /\bjumbo\b/i,
  /\bheloc\b/i,
  /\bhome equity\b/i,
  /\barm\b|\badjustable rate\b/i,
  /\bbuying a home\b|\bbuy a home\b/i,
  /\bhomebuyer\b/i,
  /\bmortgage insurance\b/i,
  /\bpayoff\b/i,
  /\btax\b/i,
];

function isLearnKw(kw) {
  return LEARN_PATTERNS.some(p => p.test(kw));
}

// Bankrate learn keywords
const bankrateLearn = bankrate.rows
  .filter(r => isLearnKw(String(r[bi["Keyword"]] ?? "")))
  .map(r => ({
    keyword:  String(r[bi["Keyword"]] ?? ""),
    position: Number(r[bi["Position"]] ?? 0),
    vol:      Number(r[bi["Search vol."]] ?? 0),
    traffic:  Number(r[bi["Traffic"]] ?? 0),
    url:      String(r[bi["URL"]] ?? ""),
  }));

// Rocket learn keywords
const rocketLearn = rocket.rows
  .filter(r => isLearnKw(String(r[ri["Keyword"]] ?? "")))
  .map(r => ({
    keyword:  String(r[ri["Keyword"]] ?? ""),
    position: Number(r[ri["Position"]] ?? 0),
    vol:      Number(r[ri["Search vol."]] ?? 0),
    traffic:  Number(r[ri["Traffic"]] ?? 0),
    url:      String(r[ri["URL"]] ?? ""),
  }));

// HCMG current keywords (all 20)
const hcmgKws = hcmg.rows
  .filter(r => r[0])
  .map(r => String(r[0]));

// ── HCMG /learn article topics already created ───────────────────────────────
const HCMG_LEARN_ARTICLES = [
  "fha loan requirements",
  "how much mortgage can i afford",
  "first-time homebuyer programs",
  "va loan eligibility",
  "when to refinance",
  "pmi mortgage insurance",
  "mortgage pre-approval",
];

// ── Top Bankrate learn keywords by traffic ────────────────────────────────────
const topBankrateLearn = [...bankrateLearn]
  .sort((a, b) => b.traffic - a.traffic)
  .slice(0, 30);

// ── Top Rocket learn keywords by traffic ─────────────────────────────────────
const topRocketLearn = [...rocketLearn]
  .sort((a, b) => b.traffic - a.traffic)
  .slice(0, 20);

// ── Gap keywords: Bankrate top learn kws that HCMG /learn doesn't cover ───────
const hcmgLearnSet = new Set(HCMG_LEARN_ARTICLES.map(a => a.toLowerCase()));
const gapKeywords = topBankrateLearn.filter(kw => {
  const k = kw.keyword.toLowerCase();
  return !HCMG_LEARN_ARTICLES.some(a => k.includes(a.split("-").join(" ")) || a.includes(k));
});

// ── Traffic totals ─────────────────────────────────────────────────────────────
const bankrateLearnTraffic = bankrateLearn.reduce((s, r) => s + r.traffic, 0);
const rocketLearnTraffic   = rocketLearn.reduce((s, r) => s + r.traffic, 0);
const bankrateTotalTraffic = bankrate.rows.reduce((s, r) => s + Number(r[bi["Traffic"]] ?? 0), 0);
const rocketTotalTraffic   = rocket.rows.reduce((s, r) => s + Number(r[ri["Traffic"]] ?? 0), 0);

// ── Top Bankrate learn URLs by traffic ────────────────────────────────────────
const bankrateLearnUrls = new Map();
for (const r of bankrateLearn) {
  bankrateLearnUrls.set(r.url, (bankrateLearnUrls.get(r.url) ?? 0) + r.traffic);
}
const topBankrateLearnUrls = [...bankrateLearnUrls.entries()]
  .filter(([u]) => u.includes("/mortgages/") || u.includes("/home-equity/") || u.includes("/real-estate/"))
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .map(([url, traffic]) => ({ url: url.replace("https://www.bankrate.com",""), traffic }));

const result = {
  summary: {
    hcmg_total_keywords: hcmg.rows.filter(r => r[0]).length,
    hcmg_learn_articles: HCMG_LEARN_ARTICLES.length,
    bankrate_total_keywords: bankrate.rows.length,
    bankrate_learn_keywords: bankrateLearn.length,
    bankrate_learn_traffic: bankrateLearnTraffic,
    bankrate_total_traffic: Math.round(bankrateTotalTraffic),
    bankrate_learn_pct_of_traffic: (bankrateLearnTraffic / bankrateTotalTraffic * 100).toFixed(1) + "%",
    rocket_total_keywords: rocket.rows.length,
    rocket_learn_keywords: rocketLearn.length,
    rocket_learn_traffic: rocketLearnTraffic,
    rocket_total_traffic: Math.round(rocketTotalTraffic),
    rocket_learn_pct_of_traffic: (rocketLearnTraffic / rocketTotalTraffic * 100).toFixed(1) + "%",
  },
  hcmg_current_keywords: hcmgKws,
  hcmg_learn_articles: HCMG_LEARN_ARTICLES,
  top_bankrate_learn_pages: topBankrateLearnUrls,
  top_bankrate_learn_keywords: topBankrateLearn.map(r => ({ keyword: r.keyword, vol: r.vol, traffic: r.traffic, pos: r.position })),
  top_rocket_learn_keywords: topRocketLearn.map(r => ({ keyword: r.keyword, vol: r.vol, traffic: r.traffic, pos: r.position })),
  gap_keywords_for_hcmg_learn: gapKeywords.slice(0, 20).map(r => ({ keyword: r.keyword, vol: r.vol, traffic: r.traffic })),
};

console.log(JSON.stringify(result, null, 2));
