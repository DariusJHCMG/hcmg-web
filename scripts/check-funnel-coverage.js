// Simulate what getFunnelConfig() actually resolves for every slug
// by inlining the same logic as lib/funnel-config.ts (without TS)

const PURCHASE_BASE = { goalPreset:"buy", steps:[2,3,4,5,6], submitLabel:"Get my personalized rate →", unlockLabel:"Unlock my exact rate →", overrides:{2:{title:"What price range are you targeting?"},3:{title:"Where does your credit fall today?"},4:{title:"What's your approximate household income?"}}};
const PURCHASE_VA   = { goalPreset:"buy", steps:[2,3,5,6],   submitLabel:"Claim my VA rate →",           unlockLabel:"Claim my VA benefit →", overrides:{2:{title:"What's your target home price?",sub:"VA loans allow $0 down — let's size your benefit."},3:{title:"Where does your credit fall?",sub:"VA has flexible guidelines. Most veterans qualify."},5:{ctaLabel:"Claim my VA benefit →"}}};
const PURCHASE_FHA  = { goalPreset:"buy", steps:[2,3,4,5,6], submitLabel:"See my FHA rate →",             overrides:{2:{title:"What home price are you looking at?",sub:"FHA lets you get in with as little as 3.5% down."},3:{title:"What's your current credit range?",sub:"FHA is designed for flexible credit."},4:{title:"What's your household income?"},5:{ctaLabel:"See my FHA options →"}}};
const PURCHASE_DPA  = { goalPreset:"buy", steps:[2,3,4,5,6], submitLabel:"Find my assistance programs →",  overrides:{2:{title:"What price home are you targeting?",sub:"We'll match you to assistance programs."},3:{title:"What's your credit range?"},4:{title:"What's your household income?"},5:{ctaLabel:"See my assistance options →"}}};
const SELF_EMPLOYED = { goalPreset:"buy", steps:[2,3,5,6],   submitLabel:"See my options →",               overrides:{2:{title:"What's your target home price?",sub:"We specialize in self-employed mortgages."},3:{title:"Where does your credit fall?"},5:{ctaLabel:"See my self-employed options →"}}};
const VA_BASE       = { goalPreset:"buy", steps:[2,3,5,6],   submitLabel:"Claim my VA benefit →",          overrides:{2:{title:"What's your target home price?"},3:{title:"Where does your credit fall?"},5:{ctaLabel:"Claim my VA benefit →"}}};
const VA_IRRRL      = { goalPreset:"refinance", steps:[2,3,5,6], submitLabel:"See my IRRRL rate →",        overrides:{2:{title:"What's your current loan balance?"},3:{title:"Where does your credit fall?"},5:{ctaLabel:"See my IRRRL savings →"}}};
const VA_CASHOUT    = { goalPreset:"refinance", steps:[2,3,4,5,6], submitLabel:"See my VA equity options →",overrides:{2:{title:"What's your estimated home value?"},3:{title:"Where does your credit fall?"},4:{title:"What's your household income?"},5:{ctaLabel:"See my VA cash-out options →"}}};
const FHA_BASE      = {...PURCHASE_FHA};
const FHA_STREAMLINE= { goalPreset:"refinance", steps:[3,5,6], submitLabel:"Get my Streamline rate →",    overrides:{3:{title:"Where does your credit fall today?"},5:{ctaLabel:"See my Streamline savings →"}}};
const FHA_CASHOUT   = { goalPreset:"refinance", steps:[2,3,4,5,6], submitLabel:"See my FHA equity options →",overrides:{2:{title:"What's your estimated home value?"},3:{title:"Where does your credit fall?"},4:{title:"What's your household income?"},5:{ctaLabel:"See my FHA cash-out options →"}}};
const REFI_BASE     = { goalPreset:"refinance", steps:[2,3,4,5,6], submitLabel:"Get my refi rate →",       overrides:{2:{title:"What's your estimated home value?"},3:{title:"Where does your credit fall today?"},4:{title:"What's your household income?"},5:{ctaLabel:"See my refi savings →"}}};
const CASH_OUT      = { goalPreset:"refinance", steps:[2,3,4,5,6], submitLabel:"See my equity options →",  overrides:{2:{title:"What's your home currently worth?"},3:{title:"Where does your credit fall?"},4:{title:"What's your household income?"},5:{ctaLabel:"See my cash-out options →"}}};
const HELOC         = { goalPreset:"refinance", steps:[2,3,5,6],   submitLabel:"Explore my HELOC →",       overrides:{2:{title:"What's your home currently worth?"},3:{title:"Where does your credit fall?"},5:{ctaLabel:"See my HELOC options →"}}};
const FIRST_TIME_BASE={ goalPreset:"buy", steps:[2,3,4,5,6], submitLabel:"Start my home-buying journey →",overrides:{2:{title:"What price home are you dreaming of?"},3:{title:"Where does your credit fall today?"},4:{title:"What's your household income?"},5:{ctaLabel:"Build my home-buying plan →"}}};
const RENT_VS_BUY   = { steps:[2,3,4,5,6], submitLabel:"Get my personalized comparison →",               overrides:{2:{title:"What price range are you considering?"},3:{title:"Where does your credit fall?"},4:{title:"What's your household income?"},5:{ctaLabel:"See my rent vs. buy comparison →"}}};
const READINESS_PLAN= { goalPreset:"buy", steps:[2,3,4,5,6], submitLabel:"Send me my plan →",             overrides:{2:{title:"What price home are you working toward?"},3:{title:"Where does your credit fall today?"},4:{title:"What's your household income?"},5:{ctaLabel:"Get my action plan →"}}};
const DSCR          = { goalPreset:"buy", steps:[2,3,5,6],   submitLabel:"Get my DSCR quote →",            overrides:{2:{title:"What's the target property price?"},3:{title:"Where does your credit fall?"},5:{ctaLabel:"See my DSCR options →"}}};
const DSCR_REFI     = { goalPreset:"refinance", steps:[2,3,5,6], submitLabel:"Get my DSCR refi quote →",  overrides:{2:{title:"What's your rental property currently worth?"},3:{title:"Where does your credit fall?"},5:{ctaLabel:"See my DSCR refi options →"}}};
const BANK_STMT     = { goalPreset:"buy", steps:[2,3,5,6],   submitLabel:"Get my bank-statement quote →",  overrides:{2:{title:"What's your target home price?",sub:"Bank statement loans use deposits, not tax returns."},3:{title:"Where does your credit fall?"},5:{ctaLabel:"See my bank-statement options →"}}};
const INVESTOR_BASE = { goalPreset:"buy", steps:[2,3,5,6],   submitLabel:"Get my investor quote →",        overrides:{2:{title:"What's the investment property price?"},3:{title:"Where does your credit fall?"},5:{ctaLabel:"See my investor loan options →"}}};
const CREDIT_BASE   = { goalPreset:"buy", steps:[3,4,5,6],   submitLabel:"Send me my roadmap →",           overrides:{3:{title:"Where does your credit fall today?"},4:{title:"What's your household income?"},5:{ctaLabel:"Get my mortgage roadmap →"}}};
const FREE_CONSULT  = { steps:[1,3,6],   submitLabel:"Book my free consultation →",                       overrides:{1:{title:"What can we help you with?"},3:{title:"What's your credit range?"}}};
const DEFAULT       = { steps:[1,2,3,4,5,6], submitLabel:"Get my exact rate →", unlockLabel:"Unlock my exact rate →"};
const CALC_BASE     = { steps:[2,3,4,5,6], submitLabel:"Get my personalized numbers →",                   overrides:{2:{title:"What price home are you calculating for?"},3:{title:"Where does your credit fall?"},4:{title:"What's your household income?"},5:{ctaLabel:"Get my personalized numbers →"}}};
const REFI_CALC     = { goalPreset:"refinance", steps:[2,3,5,6], submitLabel:"Get my refi savings estimate →",overrides:{2:{title:"What's your current loan balance?"},3:{title:"Where does your credit fall?"},5:{ctaLabel:"See my refi savings →"}}};

const CONFIGS = {
  "home-purchase":PURCHASE_BASE,"fha-purchase":PURCHASE_FHA,"va-purchase":PURCHASE_VA,"conventional-purchase":PURCHASE_BASE,"usda-purchase":{...PURCHASE_BASE,submitLabel:"Check my USDA eligibility →"},"jumbo-purchase":{...PURCHASE_BASE,submitLabel:"Get my jumbo quote →"},
  "first-time-buyer":FIRST_TIME_BASE,"repeat-buyer":PURCHASE_BASE,"move-up-buyer":{...PURCHASE_BASE,overrides:{...PURCHASE_BASE.overrides,2:{title:"What price home are you moving up to?"}}},"low-down-payment":PURCHASE_DPA,"3-percent-down":{...PURCHASE_FHA},"5-percent-down":PURCHASE_BASE,"10-percent-down":PURCHASE_BASE,"20-percent-down":PURCHASE_BASE,"down-payment-assistance":PURCHASE_DPA,"closing-cost-assistance":PURCHASE_DPA,"self-employed-buyer":SELF_EMPLOYED,"1099-buyer":SELF_EMPLOYED,"commission-income-buyer":SELF_EMPLOYED,"new-construction":PURCHASE_BASE,"relocation-buyer":PURCHASE_BASE,"buying-before-selling":{...PURCHASE_BASE,overrides:{...PURCHASE_BASE.overrides,2:{title:"What's the price of the home you want to buy?"}}},"vacation-home":{...PURCHASE_BASE,overrides:{...PURCHASE_BASE.overrides,2:{title:"What's the price of the vacation home?"}}},"condo-buyer":PURCHASE_BASE,"manufactured-home":PURCHASE_BASE,
  "va-home-purchase":VA_BASE,"va-first-time-buyer":VA_BASE,"va-zero-down":VA_BASE,"va-irrrl":VA_IRRRL,"va-cash-out":VA_CASHOUT,"va-active-duty-pcs":VA_BASE,"va-veteran-buyer":VA_BASE,"va-surviving-spouse":VA_BASE,"va-entitlement-reuse":VA_BASE,"va-loan-assumption":VA_BASE,
  "fha-home-purchase":FHA_BASE,"fha-first-time-buyer":{...PURCHASE_FHA,submitLabel:"See my first-time FHA options →"},"fha-low-credit":{...PURCHASE_FHA,overrides:{...PURCHASE_FHA.overrides,3:{title:"Where does your credit fall?",sub:"FHA works with scores as low as 580."}}},"fha-35-down":PURCHASE_FHA,"fha-streamline":FHA_STREAMLINE,"fha-cash-out":FHA_CASHOUT,"fha-203k":{...PURCHASE_FHA,overrides:{...PURCHASE_FHA.overrides,2:{title:"What's the combined purchase + renovation budget?"}}},"fha-vs-conventional":{...DEFAULT,steps:[2,3,4,5,6],submitLabel:"See my FHA vs. Conventional comparison →"},
  "readiness-quiz":READINESS_PLAN,"how-much-can-i-afford":FIRST_TIME_BASE,"rent-vs-buy":RENT_VS_BUY,"dpa-finder":PURCHASE_DPA,"how-much-cash-needed":FIRST_TIME_BASE,"credit-readiness":{...CREDIT_BASE,overrides:{...CREDIT_BASE.overrides,3:{title:"Where does your credit fall today?",sub:"This is your starting point."}}},"90-day-plan":READINESS_PLAN,"6-month-plan":READINESS_PLAN,"12-month-plan":READINESS_PLAN,"fha-vs-conv-comparison":{...DEFAULT,steps:[2,3,4,5,6],submitLabel:"See my comparison →"},"budget-builder":FIRST_TIME_BASE,"buyer-class-reg":{steps:[3,6],submitLabel:"Register for free →",overrides:{3:{title:"Where does your credit fall today?"}}},
  "lower-payment":REFI_BASE,"rate-term-review":REFI_BASE,"cash-out-refi":CASH_OUT,"debt-consolidation":CASH_OUT,"renovation-funding":CASH_OUT,"pmi-removal":REFI_BASE,"15-year-comparison":REFI_BASE,"arm-to-fixed":REFI_BASE,"refi-va-irrrl":VA_IRRRL,"refi-fha-streamline":FHA_STREAMLINE,"heloc":HELOC,"home-equity-loan":HELOC,"investor-cash-out":DSCR_REFI,"divorce-equity-buyout":CASH_OUT,"mortgage-checkup":{...REFI_BASE,submitLabel:"Book my checkup →"},
  "dscr-purchase":DSCR,"dscr-refi":DSCR_REFI,"dscr-cash-out":DSCR_REFI,"bank-statement-purchase":BANK_STMT,"bank-statement-refi":{...BANK_STMT,goalPreset:"refinance",overrides:{...BANK_STMT.overrides,2:{title:"What's your property currently worth?"}}},"1099-loan":BANK_STMT,"asset-depletion":{...DSCR,overrides:{...DSCR.overrides,3:{title:"Where does your credit fall?",sub:"Asset depletion programs typically require 680+."}}},"p-and-l-only":BANK_STMT,"foreign-national":{...INVESTOR_BASE,overrides:{...INVESTOR_BASE.overrides,3:{title:"Do you have a US credit profile?"}}},"itin-loan":{...PURCHASE_FHA,overrides:{...PURCHASE_FHA.overrides,3:{title:"Where does your credit fall?",sub:"ITIN loans work with alternative credit documentation."},5:{ctaLabel:"See my ITIN loan options →"}}},"fix-and-flip":INVESTOR_BASE,"bridge-loan":INVESTOR_BASE,"short-term-rental":DSCR,"portfolio-expansion":DSCR,"first-investment":INVESTOR_BASE,
  "credit-quiz":CREDIT_BASE,"credit-range-check":CREDIT_BASE,"mortgage-readiness-score":CREDIT_BASE,"after-bankruptcy":CREDIT_BASE,"after-foreclosure":CREDIT_BASE,"after-short-sale":CREDIT_BASE,"late-payment-recovery":CREDIT_BASE,"dti-improvement":CREDIT_BASE,"12-month-roadmap":READINESS_PLAN,"free-consultation":FREE_CONSULT,
  "payment-calculator":CALC_BASE,"purchase-power":{...CALC_BASE,goalPreset:"buy"},"rent-vs-buy-calc":RENT_VS_BUY,"refi-savings":REFI_CALC,"cash-out-calc":{...REFI_CALC,goalPreset:"refinance",overrides:{...REFI_CALC.overrides,2:{title:"What's your home currently worth?"}}},"debt-consol-calc":CASH_OUT,"down-payment-calc":FIRST_TIME_BASE,"closing-cost-estimator":FIRST_TIME_BASE,"income-needed-calc":CALC_BASE,"dscr-calculator":DSCR,"investment-cashflow":DSCR,"extra-payment":REFI_BASE,
};

// Create a fingerprint for each resolved config: steps + goalPreset + submitLabel + step2title + step3title
function fingerprint(cfg) {
  const s2 = cfg.overrides?.[2]?.title || "";
  const s3 = cfg.overrides?.[3]?.title || "";
  const s5 = cfg.overrides?.[5]?.ctaLabel || "";
  return `steps:${JSON.stringify(cfg.steps||[1,2,3,4,5,6])}|goal:${cfg.goalPreset||"none"}|submit:${cfg.submitLabel||"default"}|s2:${s2}|s3:${s3}|s5:${s5}`;
}

const fingerprintMap = {};
for (const [slug, cfg] of Object.entries(CONFIGS)) {
  const fp = fingerprint(cfg);
  if (!fingerprintMap[fp]) fingerprintMap[fp] = [];
  fingerprintMap[fp].push(slug);
}

const duplicateGroups = Object.entries(fingerprintMap).filter(([,slugs]) => slugs.length > 1);
const uniqueCount = Object.keys(fingerprintMap).length;

console.log(`Total slugs: ${Object.keys(CONFIGS).length}`);
console.log(`Distinct configs: ${uniqueCount}`);
console.log(`Groups with identical fingerprint: ${duplicateGroups.length}\n`);

duplicateGroups.forEach(([fp, slugs]) => {
  console.log(`IDENTICAL (${slugs.length}): ${slugs.join(", ")}`);
  console.log(`  Fingerprint: ${fp}`);
  console.log();
});
