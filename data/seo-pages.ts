export type SeoPage = {
  slug: string;
  city: string;
  state: string;
  loanType: string;
  headline: string;
  description: string;
};

/** City-specific data used to enrich local SEO pages with unique content */
export type CityData = {
  county: string;
  medianHomePrice: number;  // USD
  propertyTaxRate: number;  // annual %, e.g. 0.89
};

export const CITY_DATA: Record<string, CityData> = {
  // Florida
  "Orlando":        { county: "Orange County",       medianHomePrice: 380000, propertyTaxRate: 0.86 },
  "Miami":          { county: "Miami-Dade County",    medianHomePrice: 620000, propertyTaxRate: 0.89 },
  "Tampa":          { county: "Hillsborough County",  medianHomePrice: 395000, propertyTaxRate: 1.05 },
  "Jacksonville":   { county: "Duval County",          medianHomePrice: 310000, propertyTaxRate: 0.84 },
  "Fort Lauderdale":{ county: "Broward County",        medianHomePrice: 460000, propertyTaxRate: 1.07 },
  "St. Petersburg": { county: "Pinellas County",       medianHomePrice: 375000, propertyTaxRate: 0.87 },
  "Hialeah":        { county: "Miami-Dade County",     medianHomePrice: 490000, propertyTaxRate: 0.89 },
  "Tallahassee":    { county: "Leon County",           medianHomePrice: 255000, propertyTaxRate: 0.76 },
  "Cape Coral":     { county: "Lee County",            medianHomePrice: 350000, propertyTaxRate: 0.80 },
  "Port St. Lucie": { county: "St. Lucie County",      medianHomePrice: 340000, propertyTaxRate: 1.16 },
  // Georgia
  "Atlanta":        { county: "Fulton County",         medianHomePrice: 420000, propertyTaxRate: 1.08 },
  "Savannah":       { county: "Chatham County",        medianHomePrice: 315000, propertyTaxRate: 0.93 },
  "Augusta":        { county: "Richmond County",       medianHomePrice: 195000, propertyTaxRate: 1.01 },
  "Columbus":       { county: "Muscogee County",       medianHomePrice: 175000, propertyTaxRate: 1.02 },
  "Macon":          { county: "Bibb County",            medianHomePrice: 155000, propertyTaxRate: 0.98 },
  "Athens":         { county: "Clarke County",          medianHomePrice: 285000, propertyTaxRate: 0.96 },
  "Sandy Springs":  { county: "Fulton County",         medianHomePrice: 495000, propertyTaxRate: 1.08 },
  "Roswell":        { county: "Fulton County",         medianHomePrice: 485000, propertyTaxRate: 1.08 },
  // Texas
  "Dallas":         { county: "Dallas County",         medianHomePrice: 360000, propertyTaxRate: 1.83 },
  "Houston":        { county: "Harris County",          medianHomePrice: 320000, propertyTaxRate: 1.76 },
  "Austin":         { county: "Travis County",          medianHomePrice: 540000, propertyTaxRate: 1.80 },
  "San Antonio":    { county: "Bexar County",           medianHomePrice: 290000, propertyTaxRate: 1.90 },
  "Fort Worth":     { county: "Tarrant County",         medianHomePrice: 325000, propertyTaxRate: 1.85 },
  "El Paso":        { county: "El Paso County",         medianHomePrice: 215000, propertyTaxRate: 1.73 },
  "Arlington":      { county: "Tarrant County",         medianHomePrice: 310000, propertyTaxRate: 1.85 },
  "Plano":          { county: "Collin County",          medianHomePrice: 470000, propertyTaxRate: 1.63 },
  // Nevada
  "Las Vegas":      { county: "Clark County",           medianHomePrice: 420000, propertyTaxRate: 0.55 },
  "Reno":           { county: "Washoe County",          medianHomePrice: 490000, propertyTaxRate: 0.56 },
  "Henderson":      { county: "Clark County",           medianHomePrice: 450000, propertyTaxRate: 0.55 },
  "North Las Vegas":{ county: "Clark County",           medianHomePrice: 375000, propertyTaxRate: 0.55 },
  "Sparks":         { county: "Washoe County",          medianHomePrice: 450000, propertyTaxRate: 0.56 },
  "Carson City":    { county: "Carson City",            medianHomePrice: 420000, propertyTaxRate: 0.57 },
  // Colorado
  "Denver":         { county: "Denver County",          medianHomePrice: 560000, propertyTaxRate: 0.49 },
  "Colorado Springs":{ county: "El Paso County",        medianHomePrice: 430000, propertyTaxRate: 0.47 },
  "Aurora":         { county: "Arapahoe County",        medianHomePrice: 435000, propertyTaxRate: 0.53 },
  "Fort Collins":   { county: "Larimer County",         medianHomePrice: 490000, propertyTaxRate: 0.50 },
  "Lakewood":       { county: "Jefferson County",       medianHomePrice: 490000, propertyTaxRate: 0.49 },
  "Pueblo":         { county: "Pueblo County",          medianHomePrice: 245000, propertyTaxRate: 0.66 },
  // Virginia
  "Virginia Beach": { county: "Virginia Beach (City)",  medianHomePrice: 375000, propertyTaxRate: 0.99 },
  "Richmond":       { county: "Richmond (City)",        medianHomePrice: 330000, propertyTaxRate: 1.09 },
  "Norfolk":        { county: "Norfolk (City)",         medianHomePrice: 275000, propertyTaxRate: 1.11 },
  "Chesapeake":     { county: "Chesapeake (City)",      medianHomePrice: 355000, propertyTaxRate: 0.95 },
  "Alexandria":     { county: "Alexandria (City)",      medianHomePrice: 580000, propertyTaxRate: 0.93 },
  // DC
  "Washington":     { county: "District of Columbia",  medianHomePrice: 640000, propertyTaxRate: 0.55 },
  // Maryland
  "Baltimore":      { county: "Baltimore City",         medianHomePrice: 220000, propertyTaxRate: 1.72 },
  "Silver Spring":  { county: "Montgomery County",     medianHomePrice: 510000, propertyTaxRate: 1.00 },
  "Bowie":          { county: "Prince George's County", medianHomePrice: 415000, propertyTaxRate: 1.16 },
  "Rockville":      { county: "Montgomery County",     medianHomePrice: 560000, propertyTaxRate: 1.00 },
  "Gaithersburg":   { county: "Montgomery County",     medianHomePrice: 470000, propertyTaxRate: 1.00 },
  "Frederick":      { county: "Frederick County",      medianHomePrice: 420000, propertyTaxRate: 1.05 },
  // California
  "Los Angeles":    { county: "Los Angeles County",    medianHomePrice: 850000, propertyTaxRate: 0.72 },
  "San Diego":      { county: "San Diego County",      medianHomePrice: 870000, propertyTaxRate: 0.73 },
  "San Jose":       { county: "Santa Clara County",    medianHomePrice: 1200000, propertyTaxRate: 0.65 },
  "San Francisco":  { county: "San Francisco County",  medianHomePrice: 1300000, propertyTaxRate: 0.65 },
  "Fresno":         { county: "Fresno County",          medianHomePrice: 360000, propertyTaxRate: 0.73 },
  "Sacramento":     { county: "Sacramento County",     medianHomePrice: 490000, propertyTaxRate: 0.75 },
  "Long Beach":     { county: "Los Angeles County",    medianHomePrice: 760000, propertyTaxRate: 0.72 },
  "Oakland":        { county: "Alameda County",         medianHomePrice: 780000, propertyTaxRate: 0.77 },
  "Bakersfield":    { county: "Kern County",            medianHomePrice: 340000, propertyTaxRate: 0.78 },
  "Anaheim":        { county: "Orange County",          medianHomePrice: 840000, propertyTaxRate: 0.72 },
  // Mississippi
  "Jackson":        { county: "Hinds County",           medianHomePrice: 145000, propertyTaxRate: 0.77 },
  "Gulfport":       { county: "Harrison County",        medianHomePrice: 195000, propertyTaxRate: 0.51 },
  "Southaven":      { county: "DeSoto County",          medianHomePrice: 250000, propertyTaxRate: 0.52 },
  "Hattiesburg":    { county: "Forrest County",         medianHomePrice: 180000, propertyTaxRate: 0.63 },
  "Biloxi":         { county: "Harrison County",        medianHomePrice: 205000, propertyTaxRate: 0.51 },
  "Meridian":       { county: "Lauderdale County",      medianHomePrice: 130000, propertyTaxRate: 0.74 },
};

const cities = [
  // Florida
  ["Orlando", "FL"], ["Miami", "FL"], ["Tampa", "FL"], ["Jacksonville", "FL"],
  ["Fort Lauderdale", "FL"], ["St. Petersburg", "FL"], ["Hialeah", "FL"],
  ["Tallahassee", "FL"], ["Cape Coral", "FL"], ["Port St. Lucie", "FL"],

  // Georgia
  ["Atlanta", "GA"], ["Savannah", "GA"], ["Augusta", "GA"], ["Columbus", "GA"],
  ["Macon", "GA"], ["Athens", "GA"], ["Sandy Springs", "GA"], ["Roswell", "GA"],

  // Texas
  ["Dallas", "TX"], ["Houston", "TX"], ["Austin", "TX"], ["San Antonio", "TX"],
  ["Fort Worth", "TX"], ["El Paso", "TX"], ["Arlington", "TX"], ["Plano", "TX"],

  // Nevada
  ["Las Vegas", "NV"], ["Reno", "NV"], ["Henderson", "NV"], ["North Las Vegas", "NV"],
  ["Sparks", "NV"], ["Carson City", "NV"],

  // Colorado
  ["Denver", "CO"], ["Colorado Springs", "CO"], ["Aurora", "CO"], ["Fort Collins", "CO"],
  ["Lakewood", "CO"], ["Pueblo", "CO"],

  // Virginia
  ["Virginia Beach", "VA"], ["Richmond", "VA"], ["Norfolk", "VA"], ["Chesapeake", "VA"],
  ["Arlington", "VA"], ["Alexandria", "VA"],

  // DC
  ["Washington", "DC"],

  // Maryland
  ["Baltimore", "MD"], ["Silver Spring", "MD"], ["Bowie", "MD"],
  ["Rockville", "MD"], ["Gaithersburg", "MD"], ["Frederick", "MD"],

  // California
  ["Los Angeles", "CA"], ["San Diego", "CA"], ["San Jose", "CA"], ["San Francisco", "CA"],
  ["Fresno", "CA"], ["Sacramento", "CA"], ["Long Beach", "CA"], ["Oakland", "CA"],
  ["Bakersfield", "CA"], ["Anaheim", "CA"],

  // Mississippi
  ["Jackson", "MS"], ["Gulfport", "MS"], ["Southaven", "MS"], ["Hattiesburg", "MS"],
  ["Biloxi", "MS"], ["Meridian", "MS"],
] as const;

const loanTypes = [
  "FHA Loan",
  "VA Loan",
  "Conventional Loan",
  "Refinance",
  "First-Time Buyer",
  "Jumbo Loan",
  "USDA Loan",
  "Down Payment Assistance",
  "HELOC",
  "ARM Loan",
  "Investment Property Loan",
  "Condo Loan",
] as const;

export const seoPages: SeoPage[] = cities.flatMap(([city, state]) =>
  loanTypes.map((loanType) => ({
    slug: `${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${loanType.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    city,
    state,
    loanType,
    headline: `${loanType} in ${city}, ${state}`,
    description: `Looking for a ${loanType.toLowerCase()} near ${city}, ${state}? Harris Capital Mortgage Group is a licensed mortgage lender serving ${city} and surrounding areas. Get a free estimate — no hard credit check. NMLS# 1918223.`,
  })),
);

export const featuredCities = seoPages.slice(0, 12);

export const STATE_COPY: Record<string, string> = {
  FL: "Florida's real estate market has seen strong buyer demand. Down payment assistance programs are available for first-time buyers through the Florida Housing Finance Corporation.",
  TX: "Texas has no state income tax, which can increase your buying power. Property taxes vary significantly by county — your loan officer will factor in local rates when building your estimate.",
  GA: "Georgia offers first-time homebuyer programs through GAHFA. The Atlanta metro continues to see competitive offers, and our team knows the local market.",
  NV: "Nevada's no state income tax is attractive to relocating buyers. Las Vegas and Reno markets move quickly — a fast pre-qualification matters.",
  CO: "Colorado's CHFA offers down payment assistance and below-market rate programs for first-time buyers. Mountain and metro markets both remain competitive.",
  VA: "Virginia has strong employment markets and diverse housing stock. Northern Virginia near DC commands premium pricing — our team specializes in this corridor.",
  DC: "Washington DC has some of the highest median home prices on the East Coast. DC and Maryland first-time buyer programs can significantly reduce upfront costs.",
  MD: "Maryland offers the MMP (Maryland Mortgage Program) for first-time buyers with competitive rates and down payment help. Proximity to DC affects pricing in many counties.",
  CA: "California has some of the most competitive real estate markets in the country. CalHFA offers down payment assistance and first mortgage programs for qualifying buyers. Conforming loan limits are higher in many CA counties, making jumbo loans less common than in other states.",
  MS: "Mississippi consistently offers some of the most affordable home prices in the Southeast. The Mississippi Home Corporation provides down payment assistance and first mortgage programs for eligible buyers across the state.",
};

export const LOAN_TYPE_FAQS: Record<string, { q: string; a: string }[]> = {
  "FHA Loan": [
    { q: "What is the minimum down payment for an FHA loan?", a: "FHA loans allow down payments as low as 3.5% for borrowers with a credit score of 580 or higher. Scores between 500–579 require 10% down." },
    { q: "Does FHA require mortgage insurance?", a: "Yes. FHA loans require an upfront MIP (1.75% of the loan amount) and an annual MIP paid monthly. For most loans, MIP continues for the life of the loan." },
    { q: "What credit score do I need for FHA?", a: "Most FHA lenders require a minimum score of 580 for 3.5% down. Harris Capital will review your full profile to find the best available path." },
  ],
  "VA Loan": [
    { q: "Who qualifies for a VA loan?", a: "Active duty service members, veterans, National Guard members, reservists, and eligible surviving spouses may qualify. A Certificate of Eligibility (COE) is required." },
    { q: "Do VA loans require a down payment?", a: "No. VA loans typically require zero down payment, which is one of the most significant benefits available to eligible borrowers." },
    { q: "Is there a VA funding fee?", a: "Yes. Most VA loans include a funding fee (0.5%–3.3% depending on service history and down payment). Some veterans are exempt due to disability." },
  ],
  "Conventional Loan": [
    { q: "What is the minimum down payment for a conventional loan?", a: "Conventional loans can start as low as 3% down for qualifying first-time buyers. 20% down eliminates the need for private mortgage insurance (PMI)." },
    { q: "What credit score is needed for conventional?", a: "Most conventional programs require a minimum score of 620. Better scores typically unlock better rates. Your loan officer will identify the optimal program for your profile." },
    { q: "What is PMI and when does it end?", a: "PMI (private mortgage insurance) is required when your down payment is under 20%. It can be removed once your equity reaches 20% of the original home value." },
  ],
  Refinance: [
    { q: "When does it make sense to refinance?", a: "Refinancing typically makes sense when you can reduce your rate by at least 0.5–1%, shorten your loan term, or convert from an ARM to a fixed rate. Your break-even timeline matters." },
    { q: "What's the difference between rate/term and cash-out refinance?", a: "A rate/term refinance adjusts your rate or term without pulling out equity. A cash-out refinance allows you to borrow against your home's equity for renovations, debt payoff, or other goals." },
    { q: "How long does a refinance take?", a: "Most refinances close in 30–45 days. Having your documents ready and responding promptly to requests from your loan officer significantly speeds up the process." },
  ],
  "First-Time Buyer": [
    { q: "What programs are available for first-time buyers?", a: "Programs vary by state but often include down payment assistance grants, below-market rate loans, and tax credits. Harris Capital's loan officers know the programs available in your market." },
    { q: "What should I expect during the homebuying process?", a: "The typical process: pre-qualification → home search → offer → inspection → loan processing → appraisal → closing. HCMG helps you understand your numbers before you start searching." },
    { q: "How much should I save before buying?", a: "Aim for 3–5% for down payment, plus 2–3% for closing costs, plus 1–2% for move-in expenses and immediate repairs. Your loan officer will give you a precise cash-to-close estimate." },
  ],
  "Jumbo Loan": [
    { q: "What is a jumbo loan?", a: "A jumbo loan is a mortgage that exceeds the conforming loan limit set by the FHFA — $766,550 in most areas for 2024, and higher in designated high-cost markets. Jumbo loans are not backed by Fannie Mae or Freddie Mac." },
    { q: "What credit score do I need for a jumbo loan?", a: "Most jumbo programs require a minimum score of 700–720. Reserves (cash in the bank after closing) are also evaluated more heavily than on conforming loans." },
    { q: "What down payment is required for a jumbo loan?", a: "Down payments typically range from 10–20% for jumbo loans, depending on the loan size and borrower profile. Some high-balance programs allow less with strong compensating factors." },
  ],
  "USDA Loan": [
    { q: "What is a USDA loan?", a: "A USDA loan is a government-backed mortgage for buyers purchasing in eligible rural and suburban areas. It offers 100% financing — meaning zero down payment — for qualifying borrowers." },
    { q: "Do I have to live in a rural area to get a USDA loan?", a: "USDA loan eligibility is based on the USDA's property eligibility map, not a strict definition of 'rural.' Many suburban areas and small towns qualify. Your loan officer can look up any address." },
    { q: "Is there income limit for USDA loans?", a: "Yes. USDA loans have household income limits that vary by county and household size. In most markets, borrowers earning up to 115% of the area median income qualify." },
  ],
  "Down Payment Assistance": [
    { q: "What is down payment assistance?", a: "Down payment assistance (DPA) programs provide grants or low-interest second loans to help buyers cover their down payment and closing costs. Programs are typically offered by state housing agencies, nonprofits, and some lenders." },
    { q: "Do I have to repay down payment assistance?", a: "It depends on the program. Some DPA is a forgivable grant — if you stay in the home for a set period, you never repay it. Others are deferred second loans with no payments until you sell or refinance." },
    { q: "Who qualifies for down payment assistance?", a: "Requirements vary by program but commonly include income limits, first-time buyer status (or not owning a home in 3 years), minimum credit scores (typically 620+), and completing a homebuyer education course." },
  ],
  HELOC: [
    { q: "What is a HELOC?", a: "A Home Equity Line of Credit (HELOC) lets you borrow against the equity you've built in your home. It works like a revolving credit line — draw what you need, pay interest only on what you use." },
    { q: "How much can I borrow with a HELOC?", a: "Most lenders allow you to borrow up to 85–90% of your home's value minus what you owe on your first mortgage. The amount available depends on your equity, credit, and income." },
    { q: "What are typical HELOC interest rates?", a: "HELOC rates are variable and tied to the prime rate. They are generally lower than personal loans or credit cards, making them a cost-effective option for home improvements, debt consolidation, or large expenses." },
  ],
  "ARM Loan": [
    { q: "What is an ARM loan?", a: "An Adjustable-Rate Mortgage (ARM) has an interest rate that is fixed for an initial period (typically 5, 7, or 10 years), then adjusts annually based on a market index. Common structures are 5/1, 7/1, and 10/1 ARMs." },
    { q: "When does an ARM loan make sense?", a: "ARMs often make sense if you plan to sell or refinance before the fixed period ends, since the initial rate is typically lower than a 30-year fixed. They can also be a fit for buyers expecting income growth." },
    { q: "How much can my ARM rate increase?", a: "ARM loans include rate caps that limit how much your rate can increase at each adjustment and over the life of the loan. Common caps are 2% per adjustment and 5–6% lifetime. Your loan officer will walk you through the specific caps on any ARM you're considering." },
  ],
  "Investment Property Loan": [
    { q: "What down payment is required for an investment property?", a: "Investment property loans typically require 15–25% down depending on the property type and loan program. Second homes have different requirements than true investment or rental properties." },
    { q: "Are investment property mortgage rates higher?", a: "Yes. Rates for investment properties are generally 0.5–1.0% higher than owner-occupied properties because lenders view them as higher risk. Strong credit and reserves can help offset this." },
    { q: "Can I use rental income to qualify?", a: "In many cases, yes. Lenders can count a percentage of expected or actual rental income toward your qualifying income. Documentation requirements vary — your loan officer will explain what's needed for your specific property." },
  ],
  "Condo Loan": [
    { q: "Is it harder to get a mortgage on a condo?", a: "Condo loans can have additional requirements because the lender must review both the borrower and the condo project itself. FHA and VA condo approvals require the building to be on an approved list, while conventional loans have their own project review process." },
    { q: "What is a condo questionnaire?", a: "A condo questionnaire is a form completed by the HOA that provides lenders with information about the building's finances, insurance, owner-occupancy rate, and any active litigation. It is a standard part of the condo loan process." },
    { q: "What down payment do I need for a condo?", a: "FHA condo loans allow as little as 3.5% down for approved projects. Conventional condo loans can start at 3% for first-time buyers. Non-warrantable condos (those that don't meet agency guidelines) typically require larger down payments through portfolio lenders." },
  ],
};
