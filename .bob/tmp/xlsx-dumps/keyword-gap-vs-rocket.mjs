import { readFileSync } from "fs";

const ROCKET_DIR = ".bob/tmp/xlsx-dumps/export_research_us_domain_history_usd_2026-07_rocketmortgage.com-8e030161a50421df";

// ── Load Rocket keywords ──────────────────────────────────────────────────────
const rocketSheet = JSON.parse(readFileSync(`${ROCKET_DIR}/Sheet1.json`, "utf8"));
const rIdx = Object.fromEntries(rocketSheet.headers.map((h, i) => [h, i]));
const rocketKws = rocketSheet.rows.map(r => ({
  keyword: (r[rIdx["Keyword"]] || "").trim().toLowerCase(),
  vol:      Number(r[rIdx["Search vol."]]) || 0,
  pos:      Number(r[rIdx["Position"]]) || 999,
  diff:     Number(r[rIdx["Difficulty"]]) || 0,
  cpc:      Number(r[rIdx["CPC"]]) || 0,
  traffic:  Number(r[rIdx["Traffic"]]) || 0,
  intent:   r[rIdx["Search intent"]] || "",
  url:      r[rIdx["URL"]] || "",
})).filter(r => r.keyword);

// ── Build HCMG's 732 pages as keyword targets ────────────────────────────────
// Cities × loan types (mirroring data/seo-pages.ts exactly)
const cities = [
  ["Orlando","FL"],["Miami","FL"],["Tampa","FL"],["Jacksonville","FL"],
  ["Fort Lauderdale","FL"],["St. Petersburg","FL"],["Hialeah","FL"],
  ["Tallahassee","FL"],["Cape Coral","FL"],["Port St. Lucie","FL"],
  ["Atlanta","GA"],["Savannah","GA"],["Augusta","GA"],["Columbus","GA"],
  ["Macon","GA"],["Athens","GA"],["Sandy Springs","GA"],["Roswell","GA"],
  ["Dallas","TX"],["Houston","TX"],["Austin","TX"],["San Antonio","TX"],
  ["Fort Worth","TX"],["El Paso","TX"],["Arlington","TX"],["Plano","TX"],
  ["Las Vegas","NV"],["Reno","NV"],["Henderson","NV"],["North Las Vegas","NV"],
  ["Sparks","NV"],["Carson City","NV"],
  ["Denver","CO"],["Colorado Springs","CO"],["Aurora","CO"],["Fort Collins","CO"],
  ["Lakewood","CO"],["Pueblo","CO"],
  ["Virginia Beach","VA"],["Richmond","VA"],["Norfolk","VA"],["Chesapeake","VA"],
  ["Arlington","VA"],["Alexandria","VA"],
  ["Washington","DC"],
  ["Baltimore","MD"],["Silver Spring","MD"],["Bowie","MD"],
  ["Rockville","MD"],["Gaithersburg","MD"],["Frederick","MD"],
  ["Los Angeles","CA"],["San Diego","CA"],["San Jose","CA"],["San Francisco","CA"],
  ["Fresno","CA"],["Sacramento","CA"],["Long Beach","CA"],["Oakland","CA"],
  ["Bakersfield","CA"],["Anaheim","CA"],
  ["Jackson","MS"],["Gulfport","MS"],["Southaven","MS"],["Hattiesburg","MS"],
  ["Biloxi","MS"],["Meridian","MS"],
];
const loanTypes = [
  "FHA Loan","VA Loan","Conventional Loan","Refinance","First-Time Buyer",
  "Jumbo Loan","USDA Loan","Down Payment Assistance","HELOC",
  "ARM Loan","Investment Property Loan","Condo Loan",
];

// Generate the keyword each page targets
const hcmgTargets = new Set();
for (const [city, state] of cities) {
  for (const lt of loanTypes) {
    // Primary headline keyword: "fha loan in orlando, fl"
    hcmgTargets.add(`${lt.toLowerCase()} in ${city.toLowerCase()}, ${state.toLowerCase()}`);
    // Common variant: "orlando fha loan"
    hcmgTargets.add(`${city.toLowerCase()} ${lt.toLowerCase()}`);
    // With state: "orlando fha loan florida"
    const stateNames = { FL:"florida",GA:"georgia",TX:"texas",NV:"nevada",CO:"colorado",VA:"virginia",DC:"washington dc",MD:"maryland",CA:"california",MS:"mississippi" };
    const stateName = stateNames[state] || state.toLowerCase();
    hcmgTargets.add(`${city.toLowerCase()} ${lt.toLowerCase()} ${stateName}`);
  }
}

// ── Compare ───────────────────────────────────────────────────────────────────
const covered = [];
const gap = [];

for (const kw of rocketKws) {
  const k = kw.keyword;
  // Check if any HCMG target is a substring match or vice versa
  const isCovered = hcmgTargets.has(k) ||
    [...hcmgTargets].some(t => k.includes(t) || t.includes(k));
  if (isCovered) {
    covered.push(kw);
  } else {
    gap.push(kw);
  }
}

// Sort gap by volume desc
gap.sort((a, b) => b.vol - a.vol);
covered.sort((a, b) => b.vol - a.vol);

// ── Cluster gap keywords ──────────────────────────────────────────────────────
function cluster(kw) {
  const k = kw.keyword;
  if (k.includes("calculat"))           return "Calculator";
  if (k.includes("rocket"))             return "Rocket Brand";
  if (k.includes("refinanc"))           return "Refinance";
  if (k.includes("fha"))                return "FHA";
  if (k.includes("va loan")||k.includes("va home")||k.includes("va mortgage")) return "VA Loan";
  if (k.includes("jumbo"))              return "Jumbo";
  if (k.includes("first time")||k.includes("first-time")) return "First-Time Buyer";
  if (k.includes("down payment"))       return "Down Payment / DPA";
  if (k.includes("heloc")||k.includes("home equity")) return "HELOC / Home Equity";
  if (k.includes("rate")||k.includes("apr"))  return "Rates";
  if (k.includes("invest")||k.includes("rental")) return "Investment Property";
  if (k.includes("condo"))              return "Condo";
  if (k.includes("usda"))               return "USDA";
  if (k.includes("arm")||k.includes("adjustable")) return "ARM";
  if (k.includes("near me")||k.includes("lender")||k.includes("broker")) return "Local / Near Me";
  if (k.includes("mortgage"))           return "General Mortgage";
  return "Other";
}

const clusterMap = {};
for (const kw of gap) {
  const c = cluster(kw);
  if (!clusterMap[c]) clusterMap[c] = { count: 0, vol: 0, top: [] };
  clusterMap[c].count++;
  clusterMap[c].vol += kw.vol;
  if (clusterMap[c].top.length < 8) clusterMap[c].top.push(kw);
}

const clusterArr = Object.entries(clusterMap)
  .map(([name, d]) => ({ name, ...d }))
  .sort((a, b) => b.vol - a.vol);

// ── Quick wins from gap: diff < 55, vol >= 500 ───────────────────────────────
const quickWins = gap.filter(g => g.diff < 55 && g.vol >= 500).slice(0, 30);

// ── High-value commercial gaps: cpc >= 5 ─────────────────────────────────────
const highValue = gap.filter(g => g.cpc >= 5 && g.vol >= 300).slice(0, 30);

console.log(JSON.stringify({
  rocketTotal: rocketKws.length,
  hcmgPageCount: cities.length * loanTypes.length,
  covered: covered.length,
  gap: gap.length,
  top30Gap: gap.slice(0, 30),
  clusterSummary: clusterArr,
  quickWins,
  highValue,
  top10Covered: covered.slice(0, 10),
}, null, 2));
