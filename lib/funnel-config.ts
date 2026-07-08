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
  "conventional-purchase":   { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What price home are you targeting?", sub: "Conventional loans reward strong credit and down payment." }, 3: { title: "Where does your credit fall?", sub: "Conventional typically requires 620+ — great rates start at 740+." }, 5: { ctaLabel: "See my conventional options →" } }, submitLabel: "See my conventional rate →" },
  "usda-purchase":           { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What's your target home price?", sub: "USDA loans offer $0 down in eligible rural and suburban areas." }, 3: { title: "Where does your credit fall?", sub: "USDA typically requires a 640+ credit score." }, 5: { ctaLabel: "Check my USDA eligibility →" } }, submitLabel: "Check my USDA eligibility →", unlockLabel: "Check my USDA eligibility →" },
  "jumbo-purchase":          { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What's your target home price?", sub: "Jumbo loans are typically for homes above $726,200." }, 3: { title: "Where does your credit fall?", sub: "Jumbo lenders typically require 700+ credit score." }, 5: { ctaLabel: "See my jumbo options →" } }, submitLabel: "Get my jumbo quote →", unlockLabel: "See my jumbo options →" },
  "first-time-buyer":        FIRST_TIME_BASE,
  "repeat-buyer":            { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What price is your next home?", sub: "You've done this before — let's make it even smoother." }, 5: { ctaLabel: "See my options →" } }, submitLabel: "Get my rate →" },
  "move-up-buyer":           { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What price home are you moving up to?", sub: "We'll help you time the buy and sell." }, 5: { ctaLabel: "See my move-up options →" } }, submitLabel: "Plan my move-up →" },
  "low-down-payment":        PURCHASE_DPA,
  "3-percent-down":          { ...PURCHASE_FHA, overrides: { ...PURCHASE_FHA.overrides, 2: { title: "What's your target home price?", sub: "You may qualify for as little as 3% down." }, 5: { ctaLabel: "See my 3%-down options →" } }, submitLabel: "See my 3%-down options →" },
  "5-percent-down":          { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What price home are you looking at?", sub: "We'll estimate your payment with 5% down." }, 5: { ctaLabel: "See my 5%-down estimate →" } }, submitLabel: "Get my 5%-down estimate →" },
  "10-percent-down":         { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What's your target home price?", sub: "10% down opens up conventional loan options." }, 5: { ctaLabel: "See my 10%-down options →" } }, submitLabel: "Get my 10%-down options →" },
  "20-percent-down":         { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What's your target home price?", sub: "20% down means no PMI and the strongest rate." }, 5: { ctaLabel: "See my 20%-down estimate →" } }, submitLabel: "Get my 20%-down estimate →" },
  "down-payment-assistance": PURCHASE_DPA,
  "closing-cost-assistance": { ...PURCHASE_DPA, overrides: { ...PURCHASE_DPA.overrides, 2: { title: "What price home are you buying?", sub: "We'll find strategies to reduce your closing costs." }, 5: { ctaLabel: "See my closing cost strategies →" } }, submitLabel: "Reduce my closing costs →" },
  "self-employed-buyer":     SELF_EMPLOYED,
  "1099-buyer":              { ...SELF_EMPLOYED, overrides: { ...SELF_EMPLOYED.overrides, 2: { title: "What's your target home price?", sub: "1099 income can qualify — let us show you how." }, 5: { ctaLabel: "See my 1099 loan options →" } }, submitLabel: "Get my 1099 loan options →" },
  "commission-income-buyer": { ...SELF_EMPLOYED, overrides: { ...SELF_EMPLOYED.overrides, 2: { title: "What price home are you targeting?", sub: "We know how to average commission income correctly." }, 5: { ctaLabel: "See my commission-income options →" } }, submitLabel: "Get my commission-income rate →" },
  "new-construction":        { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What's the price of your new build?", sub: "Builder contract in hand? Let's lock in your financing." }, 5: { ctaLabel: "See my new construction options →" } }, submitLabel: "Get my new construction rate →" },
  "relocation-buyer":        { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What's the price of the home you're buying?", sub: "Relocating for work or family? We handle the timing." }, 5: { ctaLabel: "See my relocation options →" } }, submitLabel: "Plan my relocation mortgage →" },
  "buying-before-selling":   { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What's the price of the home you want to buy?", sub: "We'll map your bridge or contingency strategy." }, 5: { ctaLabel: "See my bridge strategies →" } }, submitLabel: "Explore my bridge options →" },
  "vacation-home":           { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What's the price of the vacation home?", sub: "Second-home financing has slightly different rules." }, 5: { ctaLabel: "See my second-home options →" } }, submitLabel: "Get my second-home rate →" },
  "condo-buyer":             { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What's the price of the condo?", sub: "HOA, project approval, and financing — we cover it all." }, 5: { ctaLabel: "See my condo loan options →" } }, submitLabel: "Get my condo loan options →" },
  "manufactured-home":       { ...PURCHASE_BASE, overrides: { ...PURCHASE_BASE.overrides, 2: { title: "What's the price of the manufactured home?", sub: "Land-home and in-park purchase options available." }, 5: { ctaLabel: "See my manufactured home options →" } }, submitLabel: "Get my manufactured home rate →" },
  // VA
  "va-home-purchase":        VA_BASE,
  "va-first-time-buyer":     { ...VA_BASE, overrides: { ...VA_BASE.overrides, 2: { title: "What price home are you looking for?", sub: "Your first home — zero down, no PMI with your VA benefit." }, 5: { ctaLabel: "Start my VA home journey →" } }, submitLabel: "Start my VA home journey →" },
  "va-zero-down":            { ...VA_BASE, overrides: { ...VA_BASE.overrides, 2: { title: "What price home are you targeting?", sub: "$0 down, $0 PMI — let's see what you can buy." }, 5: { ctaLabel: "See my $0-down options →" } }, submitLabel: "Claim my $0-down benefit →" },
  "va-irrrl":                VA_IRRRL,
  "va-cash-out":             VA_CASHOUT,
  "va-active-duty-pcs":      { ...VA_BASE, overrides: { ...VA_BASE.overrides, 2: { title: "What's the price range at your new duty station?", sub: "PCS orders in hand? We'll work around your timeline." }, 5: { ctaLabel: "Plan my PCS mortgage →" } }, submitLabel: "Plan my PCS mortgage →" },
  "va-veteran-buyer":        { ...VA_BASE, overrides: { ...VA_BASE.overrides, 2: { title: "What price home are you shopping for?", sub: "A home-buying experience built around your service." }, 5: { ctaLabel: "Start my veteran home purchase →" } }, submitLabel: "Start my veteran purchase →" },
  "va-surviving-spouse":     { ...VA_BASE, overrides: { ...VA_BASE.overrides, 2: { title: "What's your target home price?", sub: "Surviving spouses may retain the VA home loan benefit." }, 3: { title: "Where does your credit fall?", sub: "We'll walk you through eligibility step by step." }, 5: { ctaLabel: "Check my VA eligibility →" } }, submitLabel: "Check my VA eligibility →" },
  "va-entitlement-reuse":    { ...VA_BASE, overrides: { ...VA_BASE.overrides, 2: { title: "What price home are you looking at now?", sub: "Used your VA benefit before? You may be able to use it again." }, 5: { ctaLabel: "Check my entitlement options →" } }, submitLabel: "Check my VA entitlement →" },
  "va-loan-assumption":      { ...VA_BASE, overrides: { ...VA_BASE.overrides, 2: { title: "What's the price of the home with the VA loan?", sub: "Assuming a below-market VA rate can save thousands." }, 5: { ctaLabel: "Explore VA assumption options →" } }, submitLabel: "Explore VA assumption →" },
  // FHA
  "fha-home-purchase":       FHA_BASE,
  "fha-first-time-buyer":    { ...PURCHASE_FHA, overrides: { ...PURCHASE_FHA.overrides, 2: { title: "What price home are you hoping to buy?", sub: "FHA is one of the most accessible programs for first-time buyers." }, 5: { ctaLabel: "See my first-time FHA options →" } }, submitLabel: "See my first-time FHA rate →" },
  "fha-low-credit":          { ...PURCHASE_FHA, overrides: { ...PURCHASE_FHA.overrides, 2: { title: "What price home are you targeting?", sub: "FHA is designed for buyers still building their credit." }, 3: { title: "Where does your credit fall?", sub: "FHA works with scores as low as 580 with 3.5% down." }, 5: { ctaLabel: "See my FHA low-credit options →" } }, submitLabel: "See my FHA low-credit options →" },
  "fha-35-down":             { ...PURCHASE_FHA, overrides: { ...PURCHASE_FHA.overrides, 2: { title: "What price home are you looking at?", sub: "FHA lets you buy with as little as 3.5% down." }, 5: { ctaLabel: "See my 3.5%-down FHA options →" } }, submitLabel: "Get my FHA 3.5%-down quote →" },
  "fha-streamline":          FHA_STREAMLINE,
  "fha-cash-out":            FHA_CASHOUT,
  "fha-203k":                { ...PURCHASE_FHA, overrides: { ...PURCHASE_FHA.overrides, 2: { title: "What's the combined purchase + renovation budget?", sub: "FHA 203(k) wraps the home price and renovation cost into one loan." } } },
  "fha-vs-conventional":     { ...DEFAULT, steps: [2, 3, 4, 5, 6], overrides: { 2: { title: "What price home are you comparing for?", sub: "We'll show FHA vs. conventional side-by-side." }, 5: { ctaLabel: "See my FHA vs. Conventional comparison →" } } },
  // First-Time
  "readiness-quiz":          READINESS_PLAN,
  "how-much-can-i-afford":   { ...FIRST_TIME_BASE, overrides: { ...FIRST_TIME_BASE.overrides, 2: { title: "What price home are you thinking about?", sub: "We'll calculate how much you can realistically afford." }, 5: { ctaLabel: "Show me what I can afford →" } }, submitLabel: "Show me what I can afford →" },
  "rent-vs-buy":             RENT_VS_BUY,
  "dpa-finder":              PURCHASE_DPA,
  "how-much-cash-needed":    { ...FIRST_TIME_BASE, overrides: { ...FIRST_TIME_BASE.overrides, 2: { title: "What price home are you planning to buy?", sub: "We'll show every dollar you'll need: down payment, closing costs, reserves." }, 5: { ctaLabel: "Show me my total cash needed →" } }, submitLabel: "Show me my total cash needed →" },
  "credit-readiness":        { ...CREDIT_BASE, overrides: { ...CREDIT_BASE.overrides, 3: { title: "Where does your credit fall today?", sub: "This is your starting point — not your ending point." }, 4: { title: "What's your household income?", sub: "Helps us map a realistic timeline for you." } }, submitLabel: "Check my credit readiness →" },
  "90-day-plan":             { ...READINESS_PLAN, overrides: { ...READINESS_PLAN.overrides, 2: { title: "What price home are you targeting in 90 days?", sub: "You're closer than you think — let's map it out." }, 5: { ctaLabel: "Build my 90-day plan →" } }, submitLabel: "Build my 90-day plan →" },
  "6-month-plan":            { ...READINESS_PLAN, overrides: { ...READINESS_PLAN.overrides, 2: { title: "What price home are you working toward?", sub: "A 6-month roadmap to your front door." }, 5: { ctaLabel: "Build my 6-month plan →" } }, submitLabel: "Build my 6-month plan →" },
  "12-month-plan":           { ...READINESS_PLAN, overrides: { ...READINESS_PLAN.overrides, 2: { title: "What price home is your 12-month goal?", sub: "12 months from now, you could own a home. Let's start." }, 5: { ctaLabel: "Build my 12-month plan →" } }, submitLabel: "Build my 12-month plan →" },
  "fha-vs-conv-comparison":  { ...DEFAULT, steps: [2, 3, 4, 5, 6], overrides: { 2: { title: "What price home are you comparing for?" }, 5: { ctaLabel: "See my FHA vs. Conventional →" } }, submitLabel: "See my loan comparison →" },
  "budget-builder":          { ...FIRST_TIME_BASE, overrides: { ...FIRST_TIME_BASE.overrides, 2: { title: "What price home are you budgeting for?", sub: "We'll break down your real monthly cost before you commit." }, 5: { ctaLabel: "Build my first-home budget →" } }, submitLabel: "Build my first-home budget →" },
  "buyer-class-reg":         { steps: [3, 6], overrides: { 3: { title: "Where does your credit fall today?", sub: "Helps us tailor the class content to you." } }, submitLabel: "Register for free →" },
  // Refinance
  "lower-payment":           { ...REFI_BASE, overrides: { ...REFI_BASE.overrides, 2: { title: "What's your home currently worth?", sub: "Even a half-point rate drop can save hundreds per month." }, 5: { ctaLabel: "See my payment reduction →" } }, submitLabel: "See my lower payment →" },
  "rate-term-review":        { ...REFI_BASE, overrides: { ...REFI_BASE.overrides, 2: { title: "What's your estimated home value?", sub: "Is your current rate still competitive? Let's find out." }, 5: { ctaLabel: "Review my rate →" } }, submitLabel: "Get my rate review →" },
  "cash-out-refi":           CASH_OUT,
  "debt-consolidation":      { ...CASH_OUT, overrides: { ...CASH_OUT.overrides, 2: { title: "What's your home currently worth?", sub: "Roll high-interest debt into one lower monthly payment." }, 5: { ctaLabel: "See my debt consolidation options →" } }, submitLabel: "Consolidate my debt →" },
  "renovation-funding":      { ...CASH_OUT, overrides: { ...CASH_OUT.overrides, 2: { title: "What's your home currently worth?", sub: "Use your equity to fund upgrades and renovations." }, 5: { ctaLabel: "See my renovation funding options →" } }, submitLabel: "Fund my renovation →" },
  "pmi-removal":             { ...REFI_BASE, overrides: { ...REFI_BASE.overrides, 2: { title: "What's your home currently worth?", sub: "If your equity has grown, you may be able to drop PMI today." }, 5: { ctaLabel: "See if I can remove PMI →" } }, submitLabel: "Remove my PMI →" },
  "15-year-comparison":      { ...REFI_BASE, overrides: { ...REFI_BASE.overrides, 2: { title: "What's your home currently worth?", sub: "Pay off your home faster and save tens of thousands in interest." }, 5: { ctaLabel: "Compare my 15 vs. 30-year options →" } }, submitLabel: "Compare my loan terms →" },
  "arm-to-fixed":            { ...REFI_BASE, overrides: { ...REFI_BASE.overrides, 2: { title: "What's your home currently worth?", sub: "Lock in a fixed rate before your ARM adjusts." }, 5: { ctaLabel: "Lock in my fixed rate →" } }, submitLabel: "Lock in my fixed rate →" },
  "refi-va-irrrl":           VA_IRRRL,
  "refi-fha-streamline":     FHA_STREAMLINE,
  "heloc":                   HELOC,
  "home-equity-loan":        { ...HELOC, overrides: { ...HELOC.overrides, 2: { title: "What's your home currently worth?", sub: "A fixed lump-sum at a predictable rate — different from a HELOC." }, 5: { ctaLabel: "See my home equity loan options →" } }, submitLabel: "Get my home equity loan quote →" },
  "investor-cash-out":       { ...DSCR_REFI, overrides: { ...DSCR_REFI.overrides, 2: { title: "What's your investment property currently worth?", sub: "Pull equity from your rental to fund your next deal." }, 5: { ctaLabel: "See my investment property cash-out options →" } }, submitLabel: "Cash out my investment property →" },
  "divorce-equity-buyout":   { ...CASH_OUT, overrides: { ...CASH_OUT.overrides, 2: { title: "What's your home currently worth?", sub: "We handle equity buyouts with discretion and expertise." }, 5: { ctaLabel: "Review my equity buyout options →" } }, submitLabel: "Explore my equity buyout →" },
  "mortgage-checkup":        { ...REFI_BASE, overrides: { ...REFI_BASE.overrides, 5: { ctaLabel: "Get my free checkup →" } }, submitLabel: "Book my checkup →", unlockLabel: "Get my free checkup →" },
  // Investor
  "dscr-purchase":           DSCR,
  "dscr-refi":               DSCR_REFI,
  "dscr-cash-out":           { ...DSCR_REFI, overrides: { ...DSCR_REFI.overrides, 2: { title: "What's your rental property currently worth?", sub: "Leverage your rental equity to fund your next investment." }, 5: { ctaLabel: "See my DSCR cash-out options →" } }, submitLabel: "Access my rental equity →" },
  "bank-statement-purchase": BANK_STMT,
  "bank-statement-refi":     { ...BANK_STMT, goalPreset: "refinance", overrides: { ...BANK_STMT.overrides, 2: { title: "What's your property currently worth?", sub: "Bank statement refi uses deposits, not tax returns." } }, submitLabel: "Get my bank-statement refi rate →" },
  "1099-loan":               { ...BANK_STMT, overrides: { ...BANK_STMT.overrides, 2: { title: "What price home are you financing?", sub: "1099 income can qualify — we know how to document it." }, 5: { ctaLabel: "See my 1099 loan options →" } }, submitLabel: "Get my 1099 loan quote →" },
  "asset-depletion":         { ...DSCR, overrides: { ...DSCR.overrides, 2: { title: "What's your target purchase price?", sub: "High net worth? Your investments can qualify as income." }, 3: { title: "Where does your credit fall?", sub: "Asset depletion programs typically require 680+." }, 5: { ctaLabel: "See my asset depletion options →" } }, submitLabel: "Explore asset depletion →" },
  "p-and-l-only":            { ...BANK_STMT, overrides: { ...BANK_STMT.overrides, 2: { title: "What price home are you financing?", sub: "A simple P&L statement can be all you need to qualify." }, 5: { ctaLabel: "See my P&L loan options →" } }, submitLabel: "Get my P&L loan quote →" },
  "foreign-national":        { ...INVESTOR_BASE, overrides: { ...INVESTOR_BASE.overrides, 2: { title: "What's the US property price?", sub: "US property investment without US credit history required." }, 3: { title: "Do you have a US credit profile?", sub: "Foreign national loans work with or without US credit." }, 5: { ctaLabel: "See my foreign national options →" } }, submitLabel: "Explore foreign national financing →" },
  "itin-loan":               { ...PURCHASE_FHA, overrides: { ...PURCHASE_FHA.overrides, 2: { title: "What price home are you buying?", sub: "No Social Security number? You may still qualify." }, 3: { title: "Where does your credit fall?", sub: "ITIN loans work with alternative credit documentation." }, 5: { ctaLabel: "See my ITIN loan options →" } }, submitLabel: "Get my ITIN loan options →" },
  "fix-and-flip":            { ...INVESTOR_BASE, overrides: { ...INVESTOR_BASE.overrides, 2: { title: "What's your total project cost (buy + rehab)?", sub: "Fast capital for your next renovation deal." }, 5: { ctaLabel: "Get my fix-and-flip quote →" } }, submitLabel: "Get my fix-and-flip quote →" },
  "bridge-loan":             { ...INVESTOR_BASE, overrides: { ...INVESTOR_BASE.overrides, 2: { title: "How much bridge financing do you need?", sub: "Cover the gap between buy and sell." }, 5: { ctaLabel: "Explore my bridge options →" } }, submitLabel: "Get my bridge loan quote →" },
  "short-term-rental":       { ...DSCR, overrides: { ...DSCR.overrides, 2: { title: "What's the short-term rental property price?", sub: "Airbnb/VRBO income — we know how to structure this." }, 5: { ctaLabel: "Finance my short-term rental →" } }, submitLabel: "Finance my short-term rental →" },
  "portfolio-expansion":     { ...DSCR, overrides: { ...DSCR.overrides, 2: { title: "What's the price of the next property?", sub: "Strategies for adding rental properties 2, 3, or more." }, 5: { ctaLabel: "Grow my portfolio →" } }, submitLabel: "Grow my rental portfolio →" },
  "first-investment":        { ...INVESTOR_BASE, overrides: { ...INVESTOR_BASE.overrides, 2: { title: "What price investment property are you targeting?", sub: "Learn the numbers before you make the jump." }, 5: { ctaLabel: "See my first-investment options →" } }, submitLabel: "Get my first investment quote →" },
  // Credit & Nurture
  "credit-quiz":             { ...CREDIT_BASE, overrides: { ...CREDIT_BASE.overrides, 3: { title: "Where does your credit fall today?", sub: "A quick no-pull check on where you stand." }, 4: { title: "What's your household income?", sub: "Helps us map the best path forward." } }, submitLabel: "Get my credit readiness score →" },
  "credit-range-check":      { ...CREDIT_BASE, overrides: { ...CREDIT_BASE.overrides, 3: { title: "What's your best credit range guess?", sub: "Find out what your range means for your mortgage." }, 4: { title: "What's your household income?", sub: "We'll pair your credit range with realistic loan options." } }, submitLabel: "See what my credit range means →" },
  "mortgage-readiness-score":{ ...CREDIT_BASE, overrides: { ...CREDIT_BASE.overrides, 3: { title: "Where does your credit fall today?", sub: "One of 5 factors in your mortgage readiness score." }, 4: { title: "What's your household income?", sub: "Income is the second factor in your readiness score." } }, submitLabel: "Get my readiness score →" },
  "after-bankruptcy":        { ...CREDIT_BASE, overrides: { ...CREDIT_BASE.overrides, 3: { title: "Where does your credit fall today?", sub: "Bankruptcy doesn't close the door — let us show you when it opens." }, 4: { title: "What's your household income?", sub: "Helps us build a realistic post-bankruptcy timeline." } }, submitLabel: "Build my post-bankruptcy plan →" },
  "after-foreclosure":       { ...CREDIT_BASE, overrides: { ...CREDIT_BASE.overrides, 3: { title: "Where does your credit fall today?", sub: "You can recover from foreclosure — let's map the path." }, 4: { title: "What's your household income?", sub: "Helps us build a realistic recovery timeline." } }, submitLabel: "Build my post-foreclosure plan →" },
  "after-short-sale":        { ...CREDIT_BASE, overrides: { ...CREDIT_BASE.overrides, 3: { title: "Where does your credit fall today?", sub: "Short sale behind you? Homeownership may be closer than you think." }, 4: { title: "What's your household income?", sub: "Used to estimate your path back to homeownership." } }, submitLabel: "Build my post-short-sale plan →" },
  "late-payment-recovery":   { ...CREDIT_BASE, overrides: { ...CREDIT_BASE.overrides, 3: { title: "Where does your credit fall today?", sub: "Rebuild your payment history and qualify sooner." }, 4: { title: "What's your household income?", sub: "Helps us set a realistic credit recovery timeline." } }, submitLabel: "Start my credit recovery plan →" },
  "dti-improvement":         { ...CREDIT_BASE, overrides: { ...CREDIT_BASE.overrides, 3: { title: "Where does your credit fall today?", sub: "Lower DTI = better loan options. We'll show you how." }, 4: { title: "What's your household income?", sub: "We'll calculate your current debt-to-income ratio." } }, submitLabel: "Improve my DTI →" },
  "12-month-roadmap":        { ...READINESS_PLAN, overrides: { ...READINESS_PLAN.overrides, 2: { title: "What price home is your 12-month goal?", sub: "A personalized plan to get you mortgage-ready in a year." }, 5: { ctaLabel: "Get my 12-month roadmap →" } }, submitLabel: "Get my 12-month roadmap →" },
  "free-consultation":       FREE_CONSULT,
  // Calculators
  "payment-calculator":      { ...CALC_BASE, overrides: { ...CALC_BASE.overrides, 2: { title: "What price home are you calculating for?", sub: "Get your real estimated monthly payment." }, 5: { ctaLabel: "Calculate my payment →" } }, submitLabel: "Get my payment estimate →" },
  "purchase-power":          { ...CALC_BASE, goalPreset: "buy", overrides: { ...CALC_BASE.overrides, 2: { title: "What price home are you targeting?", sub: "We'll show you exactly what you can afford." }, 5: { ctaLabel: "Show my purchase power →" } }, submitLabel: "Show me my purchase power →" },
  "rent-vs-buy-calc":        { ...RENT_VS_BUY, overrides: { ...RENT_VS_BUY.overrides, 2: { title: "What price home are you comparing against renting?", sub: "Run the numbers side by side." }, 5: { ctaLabel: "Show my rent vs. buy numbers →" } }, submitLabel: "Show my rent vs. buy numbers →" },
  "refi-savings":            REFI_CALC,
  "cash-out-calc":           { ...REFI_CALC, goalPreset: "refinance", overrides: { ...REFI_CALC.overrides, 2: { title: "What's your home currently worth?", sub: "We'll calculate your available equity and new payment." }, 5: { ctaLabel: "Calculate my cash-out →" } }, submitLabel: "Calculate my cash-out →" },
  "debt-consol-calc":        { ...CASH_OUT, overrides: { ...CASH_OUT.overrides, 2: { title: "What's your home currently worth?", sub: "We'll compare your current payments vs. one new mortgage." }, 5: { ctaLabel: "Calculate my consolidation savings →" } }, submitLabel: "Calculate my consolidation →" },
  "down-payment-calc":       { ...FIRST_TIME_BASE, overrides: { ...FIRST_TIME_BASE.overrides, 2: { title: "What price home are you saving for?", sub: "We'll break down exactly how much you need for a down payment." }, 5: { ctaLabel: "Calculate my down payment →" } }, submitLabel: "Calculate my down payment →" },
  "closing-cost-estimator":  { ...FIRST_TIME_BASE, overrides: { ...FIRST_TIME_BASE.overrides, 2: { title: "What price home are you estimating closing costs for?", sub: "No surprises — know every fee before you sign." }, 5: { ctaLabel: "Estimate my closing costs →" } }, submitLabel: "Estimate my closing costs →" },
  "income-needed-calc":      { ...CALC_BASE, overrides: { ...CALC_BASE.overrides, 2: { title: "What price home are you trying to afford?", sub: "We'll reverse-engineer the income you need." }, 5: { ctaLabel: "Calculate the income I need →" } }, submitLabel: "Calculate the income I need →" },
  "dscr-calculator":         { ...DSCR, overrides: { ...DSCR.overrides, 2: { title: "What's your investment property price?", sub: "We'll calculate your DSCR and see if you qualify." }, 5: { ctaLabel: "Calculate my DSCR →" } }, submitLabel: "Calculate my DSCR →" },
  "investment-cashflow":     { ...DSCR, overrides: { ...DSCR.overrides, 2: { title: "What's your rental property's value?", sub: "NOI, cap rate, and cash-on-cash return in one place." }, 5: { ctaLabel: "Analyze my rental cash flow →" } }, submitLabel: "Analyze my cash flow →" },
  "extra-payment":           { ...REFI_BASE, overrides: { ...REFI_BASE.overrides, 2: { title: "What's your remaining loan balance?", sub: "See how extra payments shrink your payoff timeline." }, 5: { ctaLabel: "See my payoff acceleration →" } }, submitLabel: "Calculate my payoff acceleration →" },
};

/** Resolve config for a funnel slug — falls back to DEFAULT */
export function getFunnelConfig(slug?: string): FunnelConfig {
  if (!slug) return DEFAULT;
  return FUNNEL_CONFIGS[slug] ?? DEFAULT;
}
