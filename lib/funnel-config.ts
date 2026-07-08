/**
 * Per-funnel flow configuration.
 *
 * Each entry maps a funnel slug (from funnel-catalog.ts) to a FunnelConfig that
 * controls which steps are shown, what copy appears, and any pre-selected state.
 *
 * Steps reference:
 *  1 = Goal selection
 *  2 = Price / loan amount range
 *  3 = Credit range
 *  4 = Income range
 *  5 = Estimate reveal
 *  6 = Contact info + submit
 */

export type GoalPreset = "buy" | "refinance" | "compare";

export interface StepOverride {
  title?: string;
  sub?: string;
  ctaLabel?: string;
}

export interface FunnelConfig {
  /** Goal to pre-select (skips Step 1 if set) */
  goalPreset?: GoalPreset;
  /** Ordered list of step numbers to show. Default [1,2,3,4,5,6] */
  steps?: number[];
  /** Per-step copy overrides */
  overrides?: Partial<Record<number, StepOverride>>;
  /** Label on the final "Get my rate" submit button */
  submitLabel?: string;
  /** Label on the Step 5 "unlock" button */
  unlockLabel?: string;
  /** Accent color key (matches FAMILY_ACCENT in FunnelFlow) */
  accentFamily?: string;
}

// ─── Default (generic) ────────────────────────────────────────────────────────
const DEFAULT: FunnelConfig = {
  steps: [1, 2, 3, 4, 5, 6],
  submitLabel: "Get my exact rate →",
  unlockLabel: "Unlock my exact rate →",
};

// ─── Purchase family ──────────────────────────────────────────────────────────
const PURCHASE_BASE: FunnelConfig = {
  goalPreset: "buy",
  steps: [2, 3, 4, 5, 6],
  overrides: {
    2: { title: "What price range are you targeting?", sub: "Give us a range and we'll build a real payment estimate." },
    3: { title: "Where does your credit fall today?", sub: "No hard pull — just a ballpark to shape your options." },
    4: { title: "What's your approximate household income?", sub: "Used only to size your buying power estimate." },
    5: { ctaLabel: "Unlock my exact rate →" },
  },
  submitLabel: "Get my personalized rate →",
};

const PURCHASE_VA: FunnelConfig = {
  goalPreset: "buy",
  steps: [2, 3, 5, 6],        // VA loans don't need income (DSCR/benefits cover it)
  overrides: {
    2: { title: "What's your target home price?", sub: "VA loans allow $0 down — let's size your benefit." },
    3: { title: "Where does your credit fall?", sub: "VA has flexible guidelines. Most veterans qualify." },
    5: { ctaLabel: "Claim my VA benefit →" },
  },
  submitLabel: "Claim my VA rate →",
  unlockLabel: "Claim my VA benefit →",
};

const PURCHASE_FHA: FunnelConfig = {
  goalPreset: "buy",
  steps: [2, 3, 4, 5, 6],
  overrides: {
    2: { title: "What home price are you looking at?", sub: "FHA lets you get in with as little as 3.5% down." },
    3: { title: "What's your current credit range?", sub: "FHA is designed for flexible credit — most qualify." },
    4: { title: "What's your household income?", sub: "Helps us confirm your FHA buying power." },
    5: { ctaLabel: "See my FHA options →" },
  },
  submitLabel: "See my FHA rate →",
  unlockLabel: "See my FHA options →",
};

const PURCHASE_DPA: FunnelConfig = {
  goalPreset: "buy",
  steps: [2, 3, 4, 5, 6],
  overrides: {
    2: { title: "What price home are you targeting?", sub: "We'll match you to assistance programs in your area." },
    3: { title: "What's your credit range?", sub: "Many DPA programs work with scores 620+." },
    4: { title: "What's your household income?", sub: "Most DPA programs have income limits — let's check yours." },
    5: { ctaLabel: "See my assistance options →" },
  },
  submitLabel: "Find my assistance programs →",
  unlockLabel: "See my assistance options →",
};

const SELF_EMPLOYED: FunnelConfig = {
  goalPreset: "buy",
  steps: [2, 3, 5, 6],       // skip income — self-employed income is documented differently
  overrides: {
    2: { title: "What's your target home price?", sub: "We specialize in self-employed and business-owner mortgages." },
    3: { title: "Where does your credit fall?", sub: "Strong credit unlocks better bank-statement loan options." },
    5: { ctaLabel: "See my self-employed options →" },
  },
  submitLabel: "See my options →",
  unlockLabel: "See my self-employed options →",
};

// ─── VA family ────────────────────────────────────────────────────────────────
const VA_BASE: FunnelConfig = {
  goalPreset: "buy",
  steps: [2, 3, 5, 6],
  overrides: {
    2: { title: "What's your target home price?", sub: "VA loans offer $0 down — no PMI ever." },
    3: { title: "Where does your credit fall?", sub: "VA guidelines are flexible — most veterans qualify." },
    5: { ctaLabel: "Claim my VA benefit →" },
  },
  submitLabel: "Claim my VA benefit →",
  unlockLabel: "Claim my VA benefit →",
};

const VA_IRRRL: FunnelConfig = {
  goalPreset: "refinance",
  steps: [2, 3, 5, 6],
  overrides: {
    2: { title: "What's your current loan balance?", sub: "The IRRRL streamlines your existing VA loan." },
    3: { title: "Where does your credit fall?", sub: "IRRRL often requires no new appraisal or credit check." },
    5: { ctaLabel: "See my IRRRL savings →" },
  },
  submitLabel: "See my IRRRL rate →",
  unlockLabel: "See my IRRRL savings →",
};

const VA_CASHOUT: FunnelConfig = {
  goalPreset: "refinance",
  steps: [2, 3, 4, 5, 6],
  overrides: {
    2: { title: "What's your estimated home value?", sub: "We'll calculate how much equity you can access." },
    3: { title: "Where does your credit fall?", sub: "VA cash-out allows up to 100% LTV in many cases." },
    4: { title: "What's your household income?", sub: "Used to confirm your VA cash-out qualification." },
    5: { ctaLabel: "See my VA cash-out options →" },
  },
  submitLabel: "See my VA equity options →",
  unlockLabel: "See my VA cash-out options →",
};

// ─── FHA family ───────────────────────────────────────────────────────────────
const FHA_BASE: FunnelConfig = { ...PURCHASE_FHA };

const FHA_STREAMLINE: FunnelConfig = {
  goalPreset: "refinance",
  steps: [3, 5, 6],          // streamline = minimal docs, just credit + contact
  overrides: {
    3: { title: "Where does your credit fall today?", sub: "FHA Streamline has reduced documentation requirements." },
    5: { ctaLabel: "See my Streamline savings →" },
  },
  submitLabel: "Get my Streamline rate →",
  unlockLabel: "See my Streamline savings →",
};

const FHA_CASHOUT: FunnelConfig = {
  goalPreset: "refinance",
  steps: [2, 3, 4, 5, 6],
  overrides: {
    2: { title: "What's your estimated home value?", sub: "FHA cash-out lets you access up to 80% of your equity." },
    3: { title: "Where does your credit fall?", sub: "FHA cash-out requires a minimum 620 credit score." },
    4: { title: "What's your household income?", sub: "Used to size your cash-out amount." },
    5: { ctaLabel: "See my FHA cash-out options →" },
  },
  submitLabel: "See my FHA equity options →",
  unlockLabel: "See my FHA cash-out options →",
};

// ─── Refinance family ──────────────────────────────────────────────────────────
const REFI_BASE: FunnelConfig = {
  goalPreset: "refinance",
  steps: [2, 3, 4, 5, 6],
  overrides: {
    2: { title: "What's your estimated home value?", sub: "This helps us calculate your equity and loan options." },
    3: { title: "Where does your credit fall today?", sub: "Your credit score drives the rate you qualify for." },
    4: { title: "What's your household income?", sub: "Used to confirm your refinance qualification." },
    5: { ctaLabel: "See my refi savings →" },
  },
  submitLabel: "Get my refi rate →",
  unlockLabel: "See my refi savings →",
};

const CASH_OUT: FunnelConfig = {
  goalPreset: "refinance",
  steps: [2, 3, 4, 5, 6],
  overrides: {
    2: { title: "What's your home currently worth?", sub: "We'll size how much equity you can pull out." },
    3: { title: "Where does your credit fall?", sub: "Better credit = more equity available at better rates." },
    4: { title: "What's your household income?", sub: "Confirms you can support the new loan payment." },
    5: { ctaLabel: "See my cash-out options →" },
  },
  submitLabel: "See my equity options →",
  unlockLabel: "See my cash-out options →",
};

const HELOC: FunnelConfig = {
  goalPreset: "refinance",
  steps: [2, 3, 5, 6],
  overrides: {
    2: { title: "What's your home currently worth?", sub: "HELOCs are based on your available equity." },
    3: { title: "Where does your credit fall?", sub: "Most HELOCs require a 680+ credit score." },
    5: { ctaLabel: "See my HELOC options →" },
  },
  submitLabel: "Explore my HELOC →",
  unlockLabel: "See my HELOC options →",
};

// ─── First-Time Buyer family ───────────────────────────────────────────────────
const FIRST_TIME_BASE: FunnelConfig = {
  goalPreset: "buy",
  steps: [2, 3, 4, 5, 6],
  overrides: {
    2: { title: "What price home are you dreaming of?", sub: "No commitment — just helps us find what's possible for you." },
    3: { title: "Where does your credit fall today?", sub: "We'll show you programs that work for your score." },
    4: { title: "What's your household income?", sub: "We use this to map out your buying power." },
    5: { ctaLabel: "Build my home-buying plan →" },
  },
  submitLabel: "Start my home-buying journey →",
  unlockLabel: "Build my home-buying plan →",
};

const RENT_VS_BUY: FunnelConfig = {
  steps: [2, 3, 4, 5, 6],
  overrides: {
    1: { title: "What's your current situation?", sub: "Tell us where you're starting from." },
    2: { title: "What price range are you considering?", sub: "We'll compare buying vs. renting at this price." },
    3: { title: "Where does your credit fall?", sub: "Credit affects the buy side of your comparison." },
    4: { title: "What's your household income?", sub: "Helps build the rent vs. buy comparison." },
    5: { ctaLabel: "See my rent vs. buy comparison →" },
  },
  submitLabel: "Get my personalized comparison →",
  unlockLabel: "See my rent vs. buy comparison →",
};

const READINESS_PLAN: FunnelConfig = {
  goalPreset: "buy",
  steps: [2, 3, 4, 5, 6],
  overrides: {
    2: { title: "What price home are you working toward?", sub: "Pick the range you're aiming for — we'll build your roadmap." },
    3: { title: "Where does your credit fall today?", sub: "This shapes the timeline and programs in your plan." },
    4: { title: "What's your household income?", sub: "Used to estimate how long your savings plan will take." },
    5: { ctaLabel: "Get my action plan →" },
  },
  submitLabel: "Send me my plan →",
  unlockLabel: "Get my action plan →",
};

// ─── Investor / Non-QM family ─────────────────────────────────────────────────
const DSCR: FunnelConfig = {
  goalPreset: "buy",
  steps: [2, 3, 5, 6],        // DSCR qualifies on rental income, not personal income
  overrides: {
    2: { title: "What's the target property price?", sub: "DSCR loans qualify on the property's rental income, not yours." },
    3: { title: "Where does your credit fall?", sub: "DSCR typically requires a 680+ credit score." },
    5: { ctaLabel: "See my DSCR options →" },
  },
  submitLabel: "Get my DSCR quote →",
  unlockLabel: "See my DSCR options →",
};

const DSCR_REFI: FunnelConfig = {
  goalPreset: "refinance",
  steps: [2, 3, 5, 6],
  overrides: {
    2: { title: "What's your rental property currently worth?", sub: "We'll calculate your equity and DSCR refi options." },
    3: { title: "Where does your credit fall?", sub: "DSCR refi typically requires 680+." },
    5: { ctaLabel: "See my DSCR refi options →" },
  },
  submitLabel: "Get my DSCR refi quote →",
  unlockLabel: "See my DSCR refi options →",
};

const BANK_STMT: FunnelConfig = {
  goalPreset: "buy",
  steps: [2, 3, 5, 6],        // bank-statement loans don't use W-2 income
  overrides: {
    2: { title: "What's your target home price?", sub: "Bank statement loans use deposits, not tax returns." },
    3: { title: "Where does your credit fall?", sub: "Most bank-statement programs require 680+." },
    5: { ctaLabel: "See my bank-statement options →" },
  },
  submitLabel: "Get my bank-statement quote →",
  unlockLabel: "See my bank-statement options →",
};

const INVESTOR_BASE: FunnelConfig = {
  goalPreset: "buy",
  steps: [2, 3, 5, 6],
  overrides: {
    2: { title: "What's the investment property price?", sub: "We specialize in investor financing structures." },
    3: { title: "Where does your credit fall?", sub: "Investor programs typically require 680–700+." },
    5: { ctaLabel: "See my investor loan options →" },
  },
  submitLabel: "Get my investor quote →",
  unlockLabel: "See my investor loan options →",
};

// ─── Credit & Nurture family ───────────────────────────────────────────────────
const CREDIT_BASE: FunnelConfig = {
  goalPreset: "buy",
  steps: [3, 4, 5, 6],         // credit funnels focus on score + income, skip price for now
  overrides: {
    3: { title: "Where does your credit fall today?", sub: "Be honest — we've helped people at every level." },
    4: { title: "What's your household income?", sub: "Helps us map a realistic timeline for you." },
    5: { ctaLabel: "Get my mortgage roadmap →" },
  },
  submitLabel: "Send me my roadmap →",
  unlockLabel: "Get my mortgage roadmap →",
};

const FREE_CONSULT: FunnelConfig = {
  steps: [1, 3, 6],             // just goal + credit + contact — fastest path to a call
  overrides: {
    1: { title: "What can we help you with?", sub: "Pick the one that fits best — no commitment." },
    3: { title: "What's your credit range?", sub: "Helps us match you to the right loan officer." },
  },
  submitLabel: "Book my free consultation →",
};

// ─── Calculator family ─────────────────────────────────────────────────────────
const CALC_BASE: FunnelConfig = {
  steps: [2, 3, 4, 5, 6],
  overrides: {
    2: { title: "What price home are you calculating for?", sub: "We'll run the real numbers for you." },
    3: { title: "Where does your credit fall?", sub: "Credit affects your rate and monthly payment." },
    4: { title: "What's your household income?", sub: "Used to calculate your debt-to-income ratio." },
    5: { ctaLabel: "Get my personalized numbers →" },
  },
  submitLabel: "Get my personalized numbers →",
  unlockLabel: "Get my personalized numbers →",
};

const REFI_CALC: FunnelConfig = {
  goalPreset: "refinance",
  steps: [2, 3, 5, 6],
  overrides: {
    2: { title: "What's your current loan balance?", sub: "We'll calculate your potential savings." },
    3: { title: "Where does your credit fall?", sub: "Your credit score drives the rate you'll qualify for." },
    5: { ctaLabel: "See my refi savings →" },
  },
  submitLabel: "Get my refi savings estimate →",
  unlockLabel: "See my refi savings →",
};

// ─── Master config map ─────────────────────────────────────────────────────────
export const FUNNEL_CONFIGS: Record<string, FunnelConfig> = {
  // Purchase
  "home-purchase":           PURCHASE_BASE,
  "fha-purchase":            PURCHASE_FHA,
  "va-purchase":             PURCHASE_VA,
  "conventional-purchase":   PURCHASE_BASE,
  "usda-purchase":           { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What's your target home price?", sub: "USDA loans offer $0 down in eligible areas." }, 5: { ctaLabel: "Check my USDA eligibility →" } }, submitLabel: "Check my USDA eligibility →", unlockLabel: "Check my USDA eligibility →" },
  "jumbo-purchase":          { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What's your target home price?", sub: "Jumbo loans are typically $726,200+." }, 5: { ctaLabel: "See my jumbo options →" } }, submitLabel: "Get my jumbo quote →", unlockLabel: "See my jumbo options →" },
  "first-time-buyer":        FIRST_TIME_BASE,
  "repeat-buyer":            PURCHASE_BASE,
  "move-up-buyer":           { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What price home are you moving up to?", sub: "We'll help you time the buy and sell." } } },
  "low-down-payment":        PURCHASE_DPA,
  "3-percent-down":          { ...PURCHASE_FHA, overrides: { ...PURCHASE_FHA.overrides, 2: { title: "What's your target home price?", sub: "You may be able to get in with just 3% down." } } },
  "5-percent-down":          PURCHASE_BASE,
  "10-percent-down":         PURCHASE_BASE,
  "20-percent-down":         PURCHASE_BASE,
  "down-payment-assistance": PURCHASE_DPA,
  "closing-cost-assistance": PURCHASE_DPA,
  "self-employed-buyer":     SELF_EMPLOYED,
  "1099-buyer":              SELF_EMPLOYED,
  "commission-income-buyer": SELF_EMPLOYED,
  "new-construction":        PURCHASE_BASE,
  "relocation-buyer":        PURCHASE_BASE,
  "buying-before-selling":   { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What's the price of the home you want to buy?", sub: "We'll map your bridge or contingency strategy." } } },
  "vacation-home":           { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What's the price of the vacation home?", sub: "Second-home financing has slightly different rules." } } },
  "condo-buyer":             PURCHASE_BASE,
  "manufactured-home":       PURCHASE_BASE,
  // VA
  "va-home-purchase":        VA_BASE,
  "va-first-time-buyer":     VA_BASE,
  "va-zero-down":            VA_BASE,
  "va-irrrl":                VA_IRRRL,
  "va-cash-out":             VA_CASHOUT,
  "va-active-duty-pcs":      VA_BASE,
  "va-veteran-buyer":        VA_BASE,
  "va-surviving-spouse":     VA_BASE,
  "va-entitlement-reuse":    VA_BASE,
  "va-loan-assumption":      VA_BASE,
  // FHA
  "fha-home-purchase":       FHA_BASE,
  "fha-first-time-buyer":    { ...PURCHASE_FHA, overrides: { ...PURCHASE_FHA.overrides, 5: { ctaLabel: "See my first-time FHA options →" } } },
  "fha-low-credit":          { ...PURCHASE_FHA, overrides: { ...PURCHASE_FHA.overrides, 3: { title: "Where does your credit fall?", sub: "FHA works with scores as low as 580 with 3.5% down." } } },
  "fha-35-down":             PURCHASE_FHA,
  "fha-streamline":          FHA_STREAMLINE,
  "fha-cash-out":            FHA_CASHOUT,
  "fha-203k":                { ...PURCHASE_FHA, overrides: { ...PURCHASE_FHA.overrides, 2: { title: "What's the combined purchase + renovation budget?", sub: "FHA 203(k) wraps the home price and renovation cost into one loan." } } },
  "fha-vs-conventional":     { ...DEFAULT, steps: [2, 3, 4, 5, 6], overrides: { 2: { title: "What price home are you comparing for?", sub: "We'll show FHA vs. conventional side-by-side." }, 5: { ctaLabel: "See my FHA vs. Conventional comparison →" } } },
  // First-Time
  "readiness-quiz":          READINESS_PLAN,
  "how-much-can-i-afford":   FIRST_TIME_BASE,
  "rent-vs-buy":             RENT_VS_BUY,
  "dpa-finder":              PURCHASE_DPA,
  "how-much-cash-needed":    FIRST_TIME_BASE,
  "credit-readiness":        { ...CREDIT_BASE, overrides: { ...CREDIT_BASE.overrides, 3: { title: "Where does your credit fall today?", sub: "This is your starting point — not your ending point." } } },
  "90-day-plan":             READINESS_PLAN,
  "6-month-plan":            READINESS_PLAN,
  "12-month-plan":           READINESS_PLAN,
  "fha-vs-conv-comparison":  { ...DEFAULT, steps: [2, 3, 4, 5, 6], overrides: { 2: { title: "What price home are you comparing for?" }, 5: { ctaLabel: "See my comparison →" } } },
  "budget-builder":          FIRST_TIME_BASE,
  "buyer-class-reg":         { steps: [3, 6], overrides: { 3: { title: "Where does your credit fall today?", sub: "Helps us tailor the class content to you." } }, submitLabel: "Register for free →" },
  // Refinance
  "lower-payment":           REFI_BASE,
  "rate-term-review":        REFI_BASE,
  "cash-out-refi":           CASH_OUT,
  "debt-consolidation":      CASH_OUT,
  "renovation-funding":      CASH_OUT,
  "pmi-removal":             REFI_BASE,
  "15-year-comparison":      REFI_BASE,
  "arm-to-fixed":            REFI_BASE,
  "refi-va-irrrl":           VA_IRRRL,
  "refi-fha-streamline":     FHA_STREAMLINE,
  "heloc":                   HELOC,
  "home-equity-loan":        HELOC,
  "investor-cash-out":       DSCR_REFI,
  "divorce-equity-buyout":   CASH_OUT,
  "mortgage-checkup":        { ...REFI_BASE, overrides: { ...REFI_BASE.overrides, 5: { ctaLabel: "Get my free checkup →" } }, submitLabel: "Book my checkup →", unlockLabel: "Get my free checkup →" },
  // Investor
  "dscr-purchase":           DSCR,
  "dscr-refi":               DSCR_REFI,
  "dscr-cash-out":           DSCR_REFI,
  "bank-statement-purchase": BANK_STMT,
  "bank-statement-refi":     { ...BANK_STMT, goalPreset: "refinance", overrides: { ...BANK_STMT.overrides, 2: { title: "What's your property currently worth?", sub: "Bank statement refi uses deposits, not tax returns." } } },
  "1099-loan":               BANK_STMT,
  "asset-depletion":         { ...DSCR, overrides: { ...DSCR.overrides, 3: { title: "Where does your credit fall?", sub: "Asset depletion programs typically require 680+." }, 5: { ctaLabel: "See my asset depletion options →" } } },
  "p-and-l-only":            BANK_STMT,
  "foreign-national":        { ...INVESTOR_BASE, overrides: { ...INVESTOR_BASE.overrides, 3: { title: "Do you have a US credit profile?", sub: "Foreign national loans work with or without US credit." } } },
  "itin-loan":               { ...PURCHASE_FHA, overrides: { ...PURCHASE_FHA.overrides, 3: { title: "Where does your credit fall?", sub: "ITIN loans work with alternative credit documentation." }, 5: { ctaLabel: "See my ITIN loan options →" } } },
  "fix-and-flip":            INVESTOR_BASE,
  "bridge-loan":             INVESTOR_BASE,
  "short-term-rental":       DSCR,
  "portfolio-expansion":     DSCR,
  "first-investment":        INVESTOR_BASE,
  // Credit & Nurture
  "credit-quiz":             CREDIT_BASE,
  "credit-range-check":      CREDIT_BASE,
  "mortgage-readiness-score":CREDIT_BASE,
  "after-bankruptcy":        CREDIT_BASE,
  "after-foreclosure":       CREDIT_BASE,
  "after-short-sale":        CREDIT_BASE,
  "late-payment-recovery":   CREDIT_BASE,
  "dti-improvement":         CREDIT_BASE,
  "12-month-roadmap":        READINESS_PLAN,
  "free-consultation":       FREE_CONSULT,
  // Calculators
  "payment-calculator":      CALC_BASE,
  "purchase-power":          { ...CALC_BASE, goalPreset: "buy" },
  "rent-vs-buy-calc":        RENT_VS_BUY,
  "refi-savings":            REFI_CALC,
  "cash-out-calc":           { ...REFI_CALC, goalPreset: "refinance", overrides: { ...REFI_CALC.overrides, 2: { title: "What's your home currently worth?", sub: "We'll calculate your available equity." } } },
  "debt-consol-calc":        CASH_OUT,
  "down-payment-calc":       FIRST_TIME_BASE,
  "closing-cost-estimator":  FIRST_TIME_BASE,
  "income-needed-calc":      CALC_BASE,
  "dscr-calculator":         DSCR,
  "investment-cashflow":     DSCR,
  "extra-payment":           REFI_BASE,
};

/** Resolve config for a funnel slug — falls back to DEFAULT */
export function getFunnelConfig(slug?: string): FunnelConfig {
  if (!slug) return DEFAULT;
  return FUNNEL_CONFIGS[slug] ?? DEFAULT;
}
