/** Master funnel catalog — all LO funnel variants, organized by family. */

export interface FunnelDef {
  /** URL-safe slug used in /go/[lo]/[funnel] */
  slug: string;
  /** Display label (short) */
  label: string;
  /** Hero headline shown at top of funnel page */
  headline: string;
  /** Subheadline / value prop */
  subhead: string;
  /** Family key */
  family: FunnelFamily;
  /** Optional badge shown in funnel header (e.g. "VA Loan", "FHA") */
  badge?: string;
}

export type FunnelFamily =
  | "purchase"
  | "va"
  | "fha"
  | "first-time"
  | "refinance"
  | "investor"
  | "credit"
  | "calculator";

export interface FunnelFamilyDef {
  key: FunnelFamily;
  label: string;
  /** Tailwind color tokens used for accent/badge */
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeClass: string;
  icon: string;
  description: string;
}

export const FUNNEL_FAMILIES: FunnelFamilyDef[] = [
  {
    key: "purchase",
    label: "Home Purchase",
    color: "amber",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-800",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    icon: "🏡",
    description: "Funnels for buyers at every stage and profile",
  },
  {
    key: "va",
    label: "VA Loans",
    color: "blue",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "⭐",
    description: "Veteran and military buyer funnels",
  },
  {
    key: "fha",
    label: "FHA Loans",
    color: "green",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-800",
    badgeClass: "bg-green-100 text-green-800 border-green-200",
    icon: "🔑",
    description: "FHA purchase, refinance and comparison funnels",
  },
  {
    key: "first-time",
    label: "First-Time Buyers",
    color: "violet",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    textColor: "text-violet-800",
    badgeClass: "bg-violet-100 text-violet-800 border-violet-200",
    icon: "🎉",
    description: "Education, readiness, and plan-building funnels",
  },
  {
    key: "refinance",
    label: "Refinance & Equity",
    color: "orange",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-800",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "🔄",
    description: "Rate reduction, cash-out, and equity access funnels",
  },
  {
    key: "investor",
    label: "Investor & Non-QM",
    color: "slate",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    textColor: "text-slate-800",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
    icon: "📈",
    description: "DSCR, Non-QM, and investment property funnels",
  },
  {
    key: "credit",
    label: "Credit & Nurture",
    color: "rose",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    textColor: "text-rose-800",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    icon: "💳",
    description: "Long-tail lead generators for credit-challenged borrowers",
  },
  {
    key: "calculator",
    label: "Calculators",
    color: "teal",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    textColor: "text-teal-800",
    badgeClass: "bg-teal-100 text-teal-800 border-teal-200",
    icon: "🧮",
    description: "Value-first calculators that convert into personalized leads",
  },
];

// ─── Purchase Family ──────────────────────────────────────────────────────────
const PURCHASE: FunnelDef[] = [
  { slug: "home-purchase",          label: "General Home Purchase",      headline: "Find your home-buying options",                subhead: "Tell us a little about yourself and we'll map your path to homeownership.", family: "purchase" },
  { slug: "fha-purchase",           label: "FHA Purchase",               headline: "Explore your FHA loan options",                subhead: "Low down payment. Flexible credit. See if FHA is your path.", family: "purchase", badge: "FHA" },
  { slug: "va-purchase",            label: "VA Purchase",                headline: "Explore your VA loan benefit",                 subhead: "You've earned it. Zero down, no PMI, competitive rates.", family: "purchase", badge: "VA" },
  { slug: "conventional-purchase",  label: "Conventional Purchase",      headline: "Compare conventional loan options",            subhead: "Great credit? See how far conventional financing takes you.", family: "purchase", badge: "Conventional" },
  { slug: "usda-purchase",          label: "USDA Purchase",              headline: "Check your USDA eligibility",                  subhead: "Zero-down financing in eligible rural and suburban areas.", family: "purchase", badge: "USDA" },
  { slug: "jumbo-purchase",         label: "Jumbo Purchase",             headline: "Explore jumbo financing options",              subhead: "High-value homes deserve high-value mortgage strategy.", family: "purchase", badge: "Jumbo" },
  { slug: "first-time-buyer",       label: "First-Time Buyer",           headline: "Build your first home-buying plan",            subhead: "No experience needed. We walk you through every step.", family: "purchase" },
  { slug: "repeat-buyer",           label: "Repeat Buyer",               headline: "Plan your next home purchase",                 subhead: "You've done this before. Let's make it even smoother.", family: "purchase" },
  { slug: "move-up-buyer",          label: "Move-Up Buyer",              headline: "Buy your next home before or after selling",   subhead: "Upgrade your space without the stress of timing.", family: "purchase" },
  { slug: "low-down-payment",       label: "Low Down Payment",           headline: "See your low-down-payment options",            subhead: "More paths to homeownership than you might think.", family: "purchase" },
  { slug: "3-percent-down",         label: "3% Down",                    headline: "Explore 3%-down loan programs",                subhead: "Get into your first home with as little as 3% down.", family: "purchase" },
  { slug: "5-percent-down",         label: "5% Down",                    headline: "Estimate your purchase power at 5% down",      subhead: "See how much home you can afford with 5% down.", family: "purchase" },
  { slug: "10-percent-down",        label: "10% Down",                   headline: "Compare financing with 10% down",              subhead: "Smart scenarios for mid-range down payment buyers.", family: "purchase" },
  { slug: "20-percent-down",        label: "20% Down",                   headline: "Compare structures with 20% down",             subhead: "Skip PMI, maximize equity, see your full picture.", family: "purchase" },
  { slug: "down-payment-assistance",label: "Down Payment Assistance",    headline: "Find potential assistance programs",           subhead: "Grants and programs may be available in your area.", family: "purchase" },
  { slug: "closing-cost-assistance",label: "Closing Cost Assistance",    headline: "Explore closing-cost strategies",              subhead: "Reduce what you bring to the table at closing.", family: "purchase" },
  { slug: "self-employed-buyer",    label: "Self-Employed Buyer",        headline: "Mortgage options for business owners",         subhead: "Your income is real. We know how to document it.", family: "purchase" },
  { slug: "1099-buyer",             label: "1099 Buyer",                 headline: "Financing options for 1099 earners",           subhead: "Contract and gig income can qualify — let's review yours.", family: "purchase" },
  { slug: "commission-income-buyer",label: "Commission Income Buyer",    headline: "Evaluate your variable income",                subhead: "Commission income? We average it the right way.", family: "purchase" },
  { slug: "new-construction",       label: "New Construction",           headline: "Finance your new build",                       subhead: "Builder contract in hand? Let's lock in your financing.", family: "purchase" },
  { slug: "relocation-buyer",       label: "Relocation Buyer",           headline: "Plan your move and mortgage together",         subhead: "Relocating for work or family? We handle the moving parts.", family: "purchase" },
  { slug: "buying-before-selling",  label: "Buying Before Selling",      headline: "Explore bridge strategies",                    subhead: "Don't wait to sell before you can buy.", family: "purchase" },
  { slug: "vacation-home",          label: "Vacation Home",              headline: "Finance a second home",                        subhead: "Your getaway. Let's make the math work.", family: "purchase" },
  { slug: "condo-buyer",            label: "Condo Buyer",                headline: "Check your condo financing path",              subhead: "HOA, project approval, and financing — we cover it all.", family: "purchase" },
  { slug: "manufactured-home",      label: "Manufactured Home",          headline: "Explore manufactured home financing",          subhead: "Affordable options for land-home and in-park purchases.", family: "purchase" },
];

// ─── VA Family ────────────────────────────────────────────────────────────────
const VA: FunnelDef[] = [
  { slug: "va-home-purchase",        label: "VA Purchase",                headline: "Explore your VA home loan benefit",            subhead: "Zero down. No PMI. Competitive rates. You've earned it.", family: "va", badge: "VA" },
  { slug: "va-first-time-buyer",     label: "VA First-Time Buyer",        headline: "Your first home with your VA benefit",         subhead: "Education and guidance tailored to VA first-time buyers.", family: "va", badge: "VA" },
  { slug: "va-zero-down",            label: "VA Zero-Down Exploration",   headline: "Buy a home with zero down",                    subhead: "Your VA benefit can mean $0 cash to close. Let's explore.", family: "va", badge: "VA" },
  { slug: "va-irrrl",                label: "VA IRRRL",                   headline: "Streamline your current VA loan",              subhead: "Lower your rate with minimal paperwork through the IRRRL.", family: "va", badge: "VA IRRRL" },
  { slug: "va-cash-out",             label: "VA Cash-Out Refinance",      headline: "Access your equity with a VA cash-out refi",   subhead: "Tap your home equity with your VA benefit.", family: "va", badge: "VA" },
  { slug: "va-active-duty-pcs",      label: "Active Duty PCS",            headline: "PCS orders? Let's plan your mortgage",         subhead: "Duty station, report date, current housing — we plan for all of it.", family: "va", badge: "VA" },
  { slug: "va-veteran-buyer",        label: "Veteran Home Buyer",         headline: "A home-buying experience built for veterans",  subhead: "Straightforward, respectful, and built around your service.", family: "va", badge: "VA" },
  { slug: "va-surviving-spouse",     label: "Surviving Spouse",           headline: "Surviving spouse VA eligibility",              subhead: "Explore your potential VA home loan eligibility.", family: "va", badge: "VA" },
  { slug: "va-entitlement-reuse",    label: "VA Entitlement Reuse",       headline: "Reuse your VA loan entitlement",               subhead: "Used your VA benefit before? You may be able to use it again.", family: "va", badge: "VA" },
  { slug: "va-loan-assumption",      label: "VA Loan Assumption",         headline: "Assume a low-rate VA loan",                    subhead: "Explore assuming an existing VA loan with a below-market rate.", family: "va", badge: "VA" },
];

// ─── FHA Family ───────────────────────────────────────────────────────────────
const FHA: FunnelDef[] = [
  { slug: "fha-home-purchase",       label: "FHA Purchase",               headline: "Explore your FHA home loan options",           subhead: "Low down payment. Flexible credit guidelines.", family: "fha", badge: "FHA" },
  { slug: "fha-first-time-buyer",    label: "FHA First-Time Buyer",       headline: "Your first home through FHA",                  subhead: "First-time buyer with less-than-perfect credit? This is for you.", family: "fha", badge: "FHA" },
  { slug: "fha-low-credit",          label: "FHA Low Credit",             headline: "FHA options for lower credit scores",          subhead: "FHA is designed for borrowers still building credit.", family: "fha", badge: "FHA" },
  { slug: "fha-35-down",             label: "FHA 3.5% Down",              headline: "Buy a home with just 3.5% down",               subhead: "FHA's 3.5%-down program is one of the most accessible in the country.", family: "fha", badge: "FHA" },
  { slug: "fha-streamline",          label: "FHA Streamline Refinance",   headline: "Streamline your existing FHA loan",            subhead: "Faster, simpler, lower — that's the FHA Streamline.", family: "fha", badge: "FHA" },
  { slug: "fha-cash-out",            label: "FHA Cash-Out Refinance",     headline: "Access your equity with FHA",                  subhead: "Tap your home's value and consolidate debt.", family: "fha", badge: "FHA" },
  { slug: "fha-203k",                label: "FHA 203(k) Renovation",      headline: "Finance a fixer-upper with FHA 203(k)",        subhead: "Buy it and fix it up — all in one loan.", family: "fha", badge: "FHA 203(k)" },
  { slug: "fha-vs-conventional",     label: "FHA vs. Conventional",       headline: "FHA or conventional — which fits you?",        subhead: "Tell us what matters most. We'll show you the best path.", family: "fha", badge: "FHA" },
];

// ─── First-Time Buyer Family ──────────────────────────────────────────────────
const FIRST_TIME: FunnelDef[] = [
  { slug: "readiness-quiz",          label: "Buyer Readiness Quiz",       headline: "Are you ready to buy a home?",                 subhead: "5 quick questions to find out where you stand.", family: "first-time" },
  { slug: "how-much-can-i-afford",   label: "How Much Can I Afford?",     headline: "How much home can you afford?",                subhead: "Get a real estimate in under 60 seconds.", family: "first-time" },
  { slug: "rent-vs-buy",             label: "Rent vs. Buy",               headline: "Should you rent or buy right now?",            subhead: "Compare the numbers and make a smart decision.", family: "first-time" },
  { slug: "dpa-finder",              label: "Down Payment Assistance",    headline: "Down payment assistance finder",               subhead: "Find programs that could fund your down payment.", family: "first-time" },
  { slug: "how-much-cash-needed",    label: "How Much Cash Do I Need?",   headline: "How much cash do you need to buy?",            subhead: "Down payment, closing costs, and reserves — all in one place.", family: "first-time" },
  { slug: "credit-readiness",        label: "Credit Readiness Check",     headline: "Is your credit ready to buy a home?",          subhead: "A quick check before you apply — no hard pull.", family: "first-time" },
  { slug: "90-day-plan",             label: "90-Day Home Buying Plan",    headline: "Buy a home in 90 days",                        subhead: "You're closer than you think. Let's map it out.", family: "first-time" },
  { slug: "6-month-plan",            label: "6-Month Home Buying Plan",   headline: "A 6-month roadmap to homeownership",           subhead: "Build your plan and we'll check in at every milestone.", family: "first-time" },
  { slug: "12-month-plan",           label: "12-Month Home Buying Plan",  headline: "Start building toward homeownership today",    subhead: "12 months from now, you could own a home. Let's start.", family: "first-time" },
  { slug: "fha-vs-conv-comparison",  label: "FHA vs. Conventional",       headline: "Which loan is right for you?",                 subhead: "Not sure where to start? Tell us what matters most.", family: "first-time" },
  { slug: "budget-builder",          label: "First Home Budget Builder",  headline: "Build your first-home budget",                 subhead: "Understand the real monthly cost before you commit.", family: "first-time" },
  { slug: "buyer-class-reg",         label: "First-Time Buyer Class",     headline: "Register for a free home buyer class",         subhead: "Get educated. Get confident. Get your keys.", family: "first-time" },
];

// ─── Refinance Family ─────────────────────────────────────────────────────────
const REFINANCE: FunnelDef[] = [
  { slug: "lower-payment",           label: "Lower My Payment",           headline: "Reduce your monthly mortgage payment",         subhead: "Even a small rate drop can save hundreds per month.", family: "refinance" },
  { slug: "rate-term-review",        label: "Rate & Term Review",         headline: "Review your rate and loan term",               subhead: "Is your current rate still competitive? Let's find out.", family: "refinance" },
  { slug: "cash-out-refi",           label: "Cash-Out Refinance",         headline: "Turn your equity into cash",                   subhead: "Use your home's value for renovations, debt, or anything else.", family: "refinance" },
  { slug: "debt-consolidation",      label: "Debt Consolidation",         headline: "Consolidate debt into one lower payment",      subhead: "Roll high-interest debt into a single mortgage payment.", family: "refinance" },
  { slug: "renovation-funding",      label: "Renovation Funding",         headline: "Fund your home improvements",                  subhead: "Use your equity to upgrade your space.", family: "refinance" },
  { slug: "pmi-removal",             label: "Remove PMI",                 headline: "Get rid of private mortgage insurance",        subhead: "If your equity has grown, you may be able to drop PMI.", family: "refinance" },
  { slug: "15-year-comparison",      label: "15-Year vs. 30-Year",        headline: "Compare a 15-year vs. 30-year mortgage",       subhead: "Pay off your home faster and save thousands in interest.", family: "refinance" },
  { slug: "arm-to-fixed",            label: "ARM to Fixed",               headline: "Convert your ARM to a fixed rate",             subhead: "Lock in predictability before your rate adjusts.", family: "refinance" },
  { slug: "refi-va-irrrl",           label: "VA IRRRL",                   headline: "Streamline your VA loan",                      subhead: "Faster, lower, simpler — the VA IRRRL makes it easy.", family: "refinance", badge: "VA" },
  { slug: "refi-fha-streamline",     label: "FHA Streamline",             headline: "Streamline your FHA loan",                     subhead: "Already in an FHA loan? Lower your rate with less hassle.", family: "refinance", badge: "FHA" },
  { slug: "heloc",                   label: "HELOC",                      headline: "Open a home equity line of credit",            subhead: "Flexible access to your home's equity — use what you need.", family: "refinance" },
  { slug: "home-equity-loan",        label: "Home Equity Loan",           headline: "Tap your equity with a fixed second mortgage", subhead: "Lump-sum equity access at a predictable fixed rate.", family: "refinance" },
  { slug: "investor-cash-out",       label: "Investment Property Cash-Out",headline: "Cash-out refi on your investment property",   subhead: "Pull equity from your rental to fund your next deal.", family: "refinance" },
  { slug: "divorce-equity-buyout",   label: "Equity Buyout",              headline: "Equity buyout analysis",                       subhead: "Navigate refinancing during a transition with confidence.", family: "refinance" },
  { slug: "mortgage-checkup",        label: "Mortgage Checkup",           headline: "Free mortgage checkup",                        subhead: "Is your current loan still the best option? Let's find out.", family: "refinance" },
];

// ─── Investor / Non-QM Family ─────────────────────────────────────────────────
const INVESTOR: FunnelDef[] = [
  { slug: "dscr-purchase",           label: "DSCR Purchase",              headline: "Buy an investment property with DSCR",         subhead: "Qualify on rental income, not personal income.", family: "investor", badge: "DSCR" },
  { slug: "dscr-refi",               label: "DSCR Refinance",             headline: "Refinance your rental with DSCR",              subhead: "Lower your rate or pull cash out — based on rent, not W-2s.", family: "investor", badge: "DSCR" },
  { slug: "dscr-cash-out",           label: "DSCR Cash-Out",              headline: "Cash-out refinance using DSCR",                subhead: "Leverage your rental's equity to fund your next investment.", family: "investor", badge: "DSCR" },
  { slug: "bank-statement-purchase", label: "Bank Statement Purchase",    headline: "Qualify using bank statements",                subhead: "Self-employed? Your deposits can document your income.", family: "investor", badge: "Non-QM" },
  { slug: "bank-statement-refi",     label: "Bank Statement Refinance",   headline: "Refinance using bank statements",              subhead: "Lower your rate without W-2s or tax returns.", family: "investor", badge: "Non-QM" },
  { slug: "1099-loan",               label: "1099 Loan",                  headline: "Mortgage for 1099 earners",                    subhead: "1099 income can qualify — let us show you how.", family: "investor", badge: "Non-QM" },
  { slug: "asset-depletion",         label: "Asset Depletion",            headline: "Use your assets as qualifying income",         subhead: "High net worth? Your investments can help you qualify.", family: "investor", badge: "Non-QM" },
  { slug: "p-and-l-only",            label: "P&L-Only Loan",              headline: "Qualify with a P&L statement only",            subhead: "Business owner? A simple P&L can be enough.", family: "investor", badge: "Non-QM" },
  { slug: "foreign-national",        label: "Foreign National",           headline: "Mortgage for foreign national buyers",         subhead: "US property investment without US credit history.", family: "investor", badge: "Non-QM" },
  { slug: "itin-loan",               label: "ITIN Loan",                  headline: "Homeownership with an ITIN",                   subhead: "No Social Security number? You may still qualify.", family: "investor", badge: "Non-QM" },
  { slug: "fix-and-flip",            label: "Fix & Flip",                 headline: "Finance your fix-and-flip project",            subhead: "Fast capital for your next renovation deal.", family: "investor", badge: "Investor" },
  { slug: "bridge-loan",             label: "Bridge Loan",                headline: "Bridge financing for your next deal",          subhead: "Cover the gap between buy and sell.", family: "investor", badge: "Investor" },
  { slug: "short-term-rental",       label: "Short-Term Rental Investor", headline: "Finance your short-term rental",               subhead: "Airbnb/VRBO income? We know how to structure this.", family: "investor", badge: "Investor" },
  { slug: "portfolio-expansion",     label: "Portfolio Expansion",        headline: "Grow your rental portfolio",                   subhead: "Strategies for adding properties 2, 3, or more.", family: "investor", badge: "Investor" },
  { slug: "first-investment",        label: "First Investment Property",  headline: "Buy your first investment property",           subhead: "Learn the numbers before you make the jump.", family: "investor", badge: "Investor" },
];

// ─── Credit & Nurture Family ──────────────────────────────────────────────────
const CREDIT: FunnelDef[] = [
  { slug: "credit-quiz",             label: "Credit Readiness Quiz",      headline: "Is your credit ready for a mortgage?",         subhead: "A quick, no-pull check on where you stand.", family: "credit" },
  { slug: "credit-range-check",      label: "What Credit Range Am I In?", headline: "What's your credit range?",                    subhead: "Find out where you land — and what it means for your mortgage.", family: "credit" },
  { slug: "mortgage-readiness-score",label: "Mortgage Readiness Score",   headline: "Get your mortgage readiness score",            subhead: "Instantly score your homebuying readiness across 5 factors.", family: "credit" },
  { slug: "after-bankruptcy",        label: "After Bankruptcy",           headline: "Buying a home after bankruptcy",               subhead: "A bankruptcy doesn't close the door — let us show you when it opens.", family: "credit" },
  { slug: "after-foreclosure",       label: "After Foreclosure",          headline: "Buying a home after foreclosure",              subhead: "You can recover. Let's build a roadmap.", family: "credit" },
  { slug: "after-short-sale",        label: "After Short Sale",           headline: "Buying a home after a short sale",             subhead: "Short sale behind you? Homeownership may be closer than you think.", family: "credit" },
  { slug: "late-payment-recovery",   label: "Late Payment Recovery Plan", headline: "Late payment recovery plan",                   subhead: "Rebuild your payment history and qualify sooner.", family: "credit" },
  { slug: "dti-improvement",         label: "Debt-to-Income Plan",        headline: "Improve your debt-to-income ratio",            subhead: "Lower DTI = better loan options. We'll show you how.", family: "credit" },
  { slug: "12-month-roadmap",        label: "12-Month Mortgage Roadmap",  headline: "Your 12-month mortgage roadmap",               subhead: "A personalized plan to get you mortgage-ready in a year.", family: "credit" },
  { slug: "free-consultation",       label: "Free Consultation",          headline: "Book a free home buyer consultation",          subhead: "No pressure. Just answers to your questions.", family: "credit" },
];

// ─── Calculator Family ────────────────────────────────────────────────────────
const CALCULATORS: FunnelDef[] = [
  { slug: "payment-calculator",      label: "Payment Calculator",         headline: "Calculate your mortgage payment",              subhead: "Get your estimated payment — then see your full picture.", family: "calculator" },
  { slug: "purchase-power",          label: "Purchase Power Calculator",  headline: "How much home can you afford?",                subhead: "Know your number before you start shopping.", family: "calculator" },
  { slug: "rent-vs-buy-calc",        label: "Rent vs. Buy Calculator",    headline: "Rent vs. buy — what makes sense for you?",     subhead: "Run the numbers side by side.", family: "calculator" },
  { slug: "refi-savings",            label: "Refinance Savings Calculator",headline: "See how much you could save by refinancing",  subhead: "Enter your current loan — we'll show the savings.", family: "calculator" },
  { slug: "cash-out-calc",           label: "Cash-Out Calculator",        headline: "How much equity can you access?",              subhead: "Estimate your available equity and monthly payment.", family: "calculator" },
  { slug: "debt-consol-calc",        label: "Debt Consolidation Calculator",headline: "Consolidate your debt — see the savings",    subhead: "Compare your current payments vs. one new mortgage payment.", family: "calculator" },
  { slug: "down-payment-calc",       label: "Down Payment Calculator",    headline: "How much do you need for a down payment?",     subhead: "Break down every dollar you'll need at closing.", family: "calculator" },
  { slug: "closing-cost-estimator",  label: "Closing Cost Estimator",     headline: "Estimate your closing costs",                  subhead: "No surprises. Know every fee before you sign.", family: "calculator" },
  { slug: "income-needed-calc",      label: "Income Needed Calculator",   headline: "What income do I need to buy this home?",      subhead: "Reverse-engineer the income needed for your target home.", family: "calculator" },
  { slug: "dscr-calculator",         label: "DSCR Calculator",            headline: "Calculate your DSCR",                          subhead: "Does your rental income qualify for a DSCR loan? Find out.", family: "calculator", badge: "DSCR" },
  { slug: "investment-cashflow",     label: "Investment Cash Flow",       headline: "Analyze your rental property cash flow",       subhead: "NOI, cap rate, and cash-on-cash return in one place.", family: "calculator", badge: "Investor" },
  { slug: "extra-payment",           label: "Extra Payment Calculator",   headline: "Pay off your mortgage faster",                 subhead: "See how extra payments shrink your payoff timeline.", family: "calculator" },
];

// ─── Master catalog ───────────────────────────────────────────────────────────
export const FUNNEL_CATALOG: FunnelDef[] = [
  ...PURCHASE,
  ...VA,
  ...FHA,
  ...FIRST_TIME,
  ...REFINANCE,
  ...INVESTOR,
  ...CREDIT,
  ...CALCULATORS,
];

/** Look up a funnel def by slug */
export function getFunnelBySlug(slug: string): FunnelDef | undefined {
  return FUNNEL_CATALOG.find((f) => f.slug === slug);
}

/** Get all funnels in a given family */
export function getFunnelsByFamily(family: FunnelFamily): FunnelDef[] {
  return FUNNEL_CATALOG.filter((f) => f.family === family);
}

/** Get the family definition for a given key */
export function getFamilyDef(key: FunnelFamily): FunnelFamilyDef | undefined {
  return FUNNEL_FAMILIES.find((f) => f.key === key);
}
