import { readFileSync } from "fs";

// Paths to all three dumps
const HCMG_DIR = ".bob/tmp/xlsx-dumps/hcmgloans_com_positions_detailed_2026-07-08-5fffeff300cc19e7";
const ROCKET_DIR = ".bob/tmp/xlsx-dumps/export_research_us_domain_history_usd_2026-07_rocketmortgage.com-8e030161a50421df";
const BANKRATE_DIR = ".bob/tmp/xlsx-dumps/export_research_us_domain_history_usd_2026-07_bankrate.com-33954adb1485254a";

// Load HCMG keywords (simple 2-column list)
const hcmgSheet = JSON.parse(readFileSync(`${HCMG_DIR}/Sheet1.json`, "utf8"));
// First row is actually ["Keyword","Url"] header repeated, skip nulls
const hcmgKeywords = new Set(
  hcmgSheet.rows
    .map(r => r[0])
    .filter(k => k && k !== "Keyword")
    .map(k => k.trim().toLowerCase())
);

// Load Rocket keywords
const rocketSheet = JSON.parse(readFileSync(`${ROCKET_DIR}/Sheet1.json`, "utf8"));
const rIdx = Object.fromEntries(rocketSheet.headers.map((h, i) => [h, i]));
const rocketKeywords = rocketSheet.rows.map(r => ({
  keyword: (r[rIdx["Keyword"]] || "").trim().toLowerCase(),
  vol: Number(r[rIdx["Search vol."]]) || 0,
  pos: Number(r[rIdx["Position"]]) || 999,
  difficulty: Number(r[rIdx["Difficulty"]]) || 0,
  cpc: Number(r[rIdx["CPC"]]) || 0,
  traffic: Number(r[rIdx["Traffic"]]) || 0,
  intent: r[rIdx["Search intent"]] || "",
})).filter(r => r.keyword);

// Load Bankrate keywords
const bankrateSheet = JSON.parse(readFileSync(`${BANKRATE_DIR}/Sheet1.json`, "utf8"));
const bIdx = Object.fromEntries(bankrateSheet.headers.map((h, i) => [h, i]));
const bankrateKeywords = bankrateSheet.rows.map(r => ({
  keyword: (r[bIdx["Keyword"]] || "").trim().toLowerCase(),
  vol: Number(r[bIdx["Search vol."]]) || 0,
  pos: Number(r[bIdx["Position"]]) || 999,
  difficulty: Number(r[bIdx["Difficulty"]]) || 0,
  cpc: Number(r[bIdx["CPC"]]) || 0,
  traffic: Number(r[bIdx["Traffic"]]) || 0,
  intent: r[bIdx["Search intent"]] || "",
})).filter(r => r.keyword);

// Build competitor keyword maps (keyword -> best entry)
const rocketMap = new Map();
for (const r of rocketKeywords) {
  if (!rocketMap.has(r.keyword) || rocketMap.get(r.keyword).vol < r.vol) rocketMap.set(r.keyword, r);
}
const bankrateMap = new Map();
for (const r of bankrateKeywords) {
  if (!bankrateMap.has(r.keyword) || bankrateMap.get(r.keyword).vol < r.vol) bankrateMap.set(r.keyword, r);
}

// --- HCMG summary ---
const hcmgArr = [...hcmgKeywords];

// --- GAP: keywords ranked by Rocket/Bankrate but NOT in HCMG ---
const allCompetitorKws = new Set([...rocketMap.keys(), ...bankrateMap.keys()]);
const gaps = [];
for (const kw of allCompetitorKws) {
  if (!hcmgKeywords.has(kw)) {
    const r = rocketMap.get(kw);
    const b = bankrateMap.get(kw);
    const vol = Math.max(r?.vol || 0, b?.vol || 0);
    const difficulty = r?.difficulty || b?.difficulty || 0;
    const cpc = Math.max(r?.cpc || 0, b?.cpc || 0);
    const inRocket = !!r;
    const inBankrate = !!b;
    const intent = r?.intent || b?.intent || "";
    gaps.push({ keyword: kw, vol, difficulty, cpc, inRocket, inBankrate, intent });
  }
}
// Sort by volume desc
gaps.sort((a, b) => b.vol - a.vol);

// --- TOPIC CLUSTERING of gap keywords ---
const clusters = {
  "mortgage calculator": [],
  "refinance": [],
  "fha loan": [],
  "va loan": [],
  "home loan / purchase": [],
  "rates": [],
  "local (las vegas / nevada)": [],
  "lender / company": [],
  "other": [],
};
for (const g of gaps.slice(0, 500)) {
  const k = g.keyword;
  if (k.includes("calculat")) clusters["mortgage calculator"].push(g);
  else if (k.includes("refinanc")) clusters["refinance"].push(g);
  else if (k.includes("fha")) clusters["fha loan"].push(g);
  else if (k.includes("va loan") || k.includes("va home") || k.includes("va mortgage")) clusters["va loan"].push(g);
  else if (k.includes("las vegas") || k.includes("nevada") || k.includes("nv")) clusters["local (las vegas / nevada)"].push(g);
  else if (k.includes("rate") || k.includes("apr")) clusters["rates"].push(g);
  else if (k.includes("lender") || k.includes("company") || k.includes("broker")) clusters["lender / company"].push(g);
  else if (k.includes("home loan") || k.includes("purchase") || k.includes("buy") || k.includes("first time")) clusters["home loan / purchase"].push(g);
  else clusters["other"].push(g);
}

// Summarise clusters
const clusterSummary = Object.entries(clusters).map(([name, items]) => ({
  topic: name,
  count: items.length,
  totalVol: items.reduce((s, i) => s + i.vol, 0),
  topKeywords: items.slice(0, 5).map(i => `${i.keyword} (${i.vol.toLocaleString()} vol, diff ${i.difficulty})`),
})).sort((a, b) => b.totalVol - a.totalVol);

// --- Quick wins: low difficulty (<50), high vol gaps ---
const quickWins = gaps.filter(g => g.difficulty < 50 && g.vol >= 1000).slice(0, 20);

// --- High value: high CPC + decent volume ---
const highValue = gaps.filter(g => g.cpc >= 5 && g.vol >= 500).slice(0, 20);

// --- HCMG current keyword stats ---
const hcmgStats = {
  totalKeywords: hcmgKeywords.size,
  keywords: hcmgArr.slice(0, 30),
};

// --- Competitor traffic totals from sample ---
const rocketTotalTraffic = rocketKeywords.reduce((s, r) => s + r.traffic, 0);
const bankrateTotalTraffic = bankrateKeywords.reduce((s, r) => s + r.traffic, 0);

const output = {
  hcmg: hcmgStats,
  competitorTraffic: {
    rocketMortgage: { keywords: rocketKeywords.length, estimatedTrafficFromTop5000: rocketTotalTraffic },
    bankrate: { keywords: bankrateKeywords.length, estimatedTrafficFromTop5000: bankrateTotalTraffic },
  },
  totalGapKeywords: gaps.length,
  gapClusterSummary: clusterSummary,
  quickWins,
  highValueByRevenue: highValue,
  top50GapKeywords: gaps.slice(0, 50),
};

console.log(JSON.stringify(output, null, 2));
