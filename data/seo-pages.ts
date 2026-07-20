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
  medianHomePrice: number;   // USD
  propertyTaxRate: number;   // annual %, e.g. 0.89
  fhaLoanLimit?: number;     // legacy value; live pages use current HUD data
  dpaProgram?: string;       // State / local DPA program name and key detail
  neighborhoods?: string[];  // 2–4 recognizable sub-neighborhoods for hyper-local copy
};

export const CITY_DATA: Record<string, CityData> = {
  // Florida
  "Orlando":        { county: "Orange County",       medianHomePrice: 380000, propertyTaxRate: 0.86, fhaLoanLimit: 498257, dpaProgram: "Florida Housing Finance Corporation (Florida HLP) — up to $10,000 in down payment assistance for qualifying buyers", neighborhoods: ["Dr. Phillips", "Baldwin Park", "Thornton Park", "Lake Nona"] },
  "Miami":          { county: "Miami-Dade County",    medianHomePrice: 620000, propertyTaxRate: 0.89, fhaLoanLimit: 621000, dpaProgram: "Miami-Dade Infill Housing Initiative and Florida HLP for down payment assistance", neighborhoods: ["Brickell", "Kendall", "Coral Gables", "Wynwood"] },
  "Tampa":          { county: "Hillsborough County",  medianHomePrice: 395000, propertyTaxRate: 1.05, fhaLoanLimit: 498257, dpaProgram: "Hillsborough County's HOME program and Florida HLP for first-time buyers", neighborhoods: ["South Tampa", "Hyde Park", "Ybor City", "Westchase"] },
  "Jacksonville":   { county: "Duval County",         medianHomePrice: 310000, propertyTaxRate: 0.84, fhaLoanLimit: 498257, dpaProgram: "Jacksonville Housing Finance Authority and Florida HLP programs", neighborhoods: ["San Marco", "Riverside", "Ponte Vedra", "Mandarin"] },
  "Fort Lauderdale":{ county: "Broward County",       medianHomePrice: 460000, propertyTaxRate: 1.07, fhaLoanLimit: 621000, dpaProgram: "Broward County Housing Finance Authority and Florida HLP for eligible buyers", neighborhoods: ["Las Olas", "Victoria Park", "Lauderdale-by-the-Sea", "Coral Ridge"] },
  "St. Petersburg": { county: "Pinellas County",      medianHomePrice: 375000, propertyTaxRate: 0.87, fhaLoanLimit: 498257, dpaProgram: "Pinellas County Housing Finance Authority — first-time buyer assistance programs", neighborhoods: ["Downtown St. Pete", "Kenwood", "Gulfport", "Tierra Verde"] },
  "Hialeah":        { county: "Miami-Dade County",    medianHomePrice: 490000, propertyTaxRate: 0.89, fhaLoanLimit: 621000, dpaProgram: "Miami-Dade Infill Housing Initiative and Florida HLP", neighborhoods: ["Westland", "Palm Springs North", "Hialeah Gardens", "Medley"] },
  "Tallahassee":    { county: "Leon County",          medianHomePrice: 255000, propertyTaxRate: 0.76, fhaLoanLimit: 498257, dpaProgram: "City of Tallahassee and Florida HLP down payment assistance programs", neighborhoods: ["Midtown", "Killearn Estates", "Betton Hills", "SouthWood"] },
  "Cape Coral":     { county: "Lee County",           medianHomePrice: 350000, propertyTaxRate: 0.80, fhaLoanLimit: 498257, dpaProgram: "Lee County Housing Finance Authority and Florida HLP for eligible first-time buyers", neighborhoods: ["Cape Coral Parkway", "Pelican", "NW Cape", "SW Cape"] },
  "Port St. Lucie": { county: "St. Lucie County",     medianHomePrice: 340000, propertyTaxRate: 1.16, fhaLoanLimit: 498257, dpaProgram: "St. Lucie County and Florida HLP down payment assistance programs", neighborhoods: ["Tradition", "PGA Village", "River Park", "Torino"] },
  // Georgia
  "Atlanta":        { county: "Fulton County",        medianHomePrice: 420000, propertyTaxRate: 1.08, fhaLoanLimit: 498257, dpaProgram: "Georgia Dream Homeownership Program — up to $10,000 for qualifying buyers statewide", neighborhoods: ["Buckhead", "Midtown", "Old Fourth Ward", "Grant Park"] },
  "Savannah":       { county: "Chatham County",       medianHomePrice: 315000, propertyTaxRate: 0.93, fhaLoanLimit: 498257, dpaProgram: "Georgia Dream Homeownership Program for first-time buyers", neighborhoods: ["Historic District", "Ardsley Park", "Southside", "Pooler"] },
  "Augusta":        { county: "Richmond County",      medianHomePrice: 195000, propertyTaxRate: 1.01, fhaLoanLimit: 498257, dpaProgram: "Georgia Dream Homeownership Program — down payment assistance statewide", neighborhoods: ["Summerville", "The Hill", "Tobacco Road", "Evans"] },
  "Columbus":       { county: "Muscogee County",      medianHomePrice: 175000, propertyTaxRate: 1.02, fhaLoanLimit: 498257, dpaProgram: "Georgia Dream Homeownership Program for qualifying Columbus buyers", neighborhoods: ["Midland", "Wynnton", "Flatwoods", "Columbus Square"] },
  "Macon":          { county: "Bibb County",          medianHomePrice: 155000, propertyTaxRate: 0.98, fhaLoanLimit: 498257, dpaProgram: "Georgia Dream Homeownership Program — statewide DPA available", neighborhoods: ["Ingleside", "Vineville", "Bloomfield", "North Macon"] },
  "Athens":         { county: "Clarke County",        medianHomePrice: 285000, propertyTaxRate: 0.96, fhaLoanLimit: 498257, dpaProgram: "Georgia Dream Homeownership Program for first-time buyers in Clarke County", neighborhoods: ["Five Points", "Normaltown", "Boulevard", "East Athens"] },
  "Sandy Springs":  { county: "Fulton County",        medianHomePrice: 495000, propertyTaxRate: 1.08, fhaLoanLimit: 498257, dpaProgram: "Georgia Dream Homeownership Program — statewide eligibility", neighborhoods: ["Perimeter Center", "Dunwoody", "North Springs", "Abernathy"] },
  "Roswell":        { county: "Fulton County",        medianHomePrice: 485000, propertyTaxRate: 1.08, fhaLoanLimit: 498257, dpaProgram: "Georgia Dream Homeownership Program for qualifying buyers in Fulton County", neighborhoods: ["Historic Roswell", "Alpharetta", "Canton Street", "Mountain Park"] },
  // Texas
  "Dallas":         { county: "Dallas County",        medianHomePrice: 360000, propertyTaxRate: 1.83, fhaLoanLimit: 498257, dpaProgram: "TSAHC Home Sweet Texas — up to 5% DPA for qualifying buyers", neighborhoods: ["Uptown", "Deep Ellum", "Oak Cliff", "Lake Highlands"] },
  "Houston":        { county: "Harris County",        medianHomePrice: 320000, propertyTaxRate: 1.76, fhaLoanLimit: 498257, dpaProgram: "TSAHC Homes for Texas Heroes and Home Sweet Texas programs", neighborhoods: ["Montrose", "The Heights", "Katy", "Sugar Land"] },
  "Austin":         { county: "Travis County",        medianHomePrice: 540000, propertyTaxRate: 1.80, fhaLoanLimit: 498257, dpaProgram: "TSAHC Home Sweet Texas — 5% DPA available; Austin Housing Finance Corporation also active", neighborhoods: ["East Austin", "South Congress", "Round Rock", "Cedar Park"] },
  "San Antonio":    { county: "Bexar County",         medianHomePrice: 290000, propertyTaxRate: 1.90, fhaLoanLimit: 498257, dpaProgram: "TSAHC and San Antonio HOME program for first-time buyers", neighborhoods: ["Alamo Heights", "Stone Oak", "Helotes", "New Braunfels"] },
  "Fort Worth":     { county: "Tarrant County",       medianHomePrice: 325000, propertyTaxRate: 1.85, fhaLoanLimit: 498257, dpaProgram: "TSAHC Home Sweet Texas and Homes for Texas Heroes programs", neighborhoods: ["TCU-Westcliff", "Sundance Square", "Southlake", "Keller"] },
  "El Paso":        { county: "El Paso County",       medianHomePrice: 215000, propertyTaxRate: 1.73, fhaLoanLimit: 498257, dpaProgram: "TSAHC DPA programs; El Paso HDC also offers local assistance", neighborhoods: ["Upper Valley", "Westside", "East El Paso", "Central"] },
  "Arlington":      { county: "Tarrant County",       medianHomePrice: 310000, propertyTaxRate: 1.85, fhaLoanLimit: 498257, dpaProgram: "TSAHC Home Sweet Texas — 5% DPA statewide", neighborhoods: ["Arlington Heights", "Viridian", "Park Row", "Mansfield"] },
  "Plano":          { county: "Collin County",        medianHomePrice: 470000, propertyTaxRate: 1.63, fhaLoanLimit: 498257, dpaProgram: "TSAHC programs; Collin County low property taxes increase buying power", neighborhoods: ["Legacy West", "Downtown Plano", "Frisco", "McKinney"] },
  // Nevada
  "Las Vegas":      { county: "Clark County",         medianHomePrice: 420000, propertyTaxRate: 0.55, fhaLoanLimit: 498257, dpaProgram: "Nevada Rural Housing Authority Home At Last program; Clark County HAP", neighborhoods: ["Summerlin", "Henderson Border", "North Las Vegas", "Spring Valley"] },
  "Reno":           { county: "Washoe County",        medianHomePrice: 490000, propertyTaxRate: 0.56, fhaLoanLimit: 498257, dpaProgram: "Nevada Rural Housing Authority Home At Last — down payment and closing cost assistance", neighborhoods: ["Midtown Reno", "South Meadows", "Spanish Springs", "Damonte Ranch"] },
  "Henderson":      { county: "Clark County",         medianHomePrice: 450000, propertyTaxRate: 0.55, fhaLoanLimit: 498257, dpaProgram: "Clark County HAP and Home At Last programs for qualifying buyers", neighborhoods: ["Green Valley", "Seven Hills", "MacDonald Ranch", "Anthem"] },
  "North Las Vegas":{ county: "Clark County",         medianHomePrice: 375000, propertyTaxRate: 0.55, fhaLoanLimit: 498257, dpaProgram: "Clark County HAP and Nevada Home At Last programs available", neighborhoods: ["Aliante", "Eldorado", "Centennial Hills", "Sunrise Manor"] },
  "Sparks":         { county: "Washoe County",        medianHomePrice: 450000, propertyTaxRate: 0.56, fhaLoanLimit: 498257, dpaProgram: "Home At Last DPA program from Nevada Rural Housing Authority", neighborhoods: ["Victorian Square", "Wingfield Springs", "Sun Valley", "Golden Eagle"] },
  "Carson City":    { county: "Carson City",          medianHomePrice: 420000, propertyTaxRate: 0.57, fhaLoanLimit: 498257, dpaProgram: "Home At Last program — available across Nevada including Carson City", neighborhoods: ["Empire Ranch", "Lompa Ranch", "Hot Springs Road", "Old Town Carson City"] },
  // Colorado
  "Denver":         { county: "Denver County",        medianHomePrice: 560000, propertyTaxRate: 0.49, fhaLoanLimit: 787750, dpaProgram: "CHFA SmartStep and CHFA SectionEight — up to 3% DPA for qualifying buyers", neighborhoods: ["LoDo", "Capitol Hill", "Park Hill", "Stapleton/Central Park"] },
  "Colorado Springs":{ county: "El Paso County",     medianHomePrice: 430000, propertyTaxRate: 0.47, fhaLoanLimit: 787750, dpaProgram: "CHFA SmartStep and El Paso County DPA — statewide CHFA eligibility", neighborhoods: ["Old Colorado City", "Broadmoor", "Briargate", "Fountain"] },
  "Aurora":         { county: "Arapahoe County",     medianHomePrice: 435000, propertyTaxRate: 0.53, fhaLoanLimit: 787750, dpaProgram: "CHFA programs and Arapahoe County HOAP for qualifying buyers", neighborhoods: ["Southlands", "Murphy Creek", "Centrepoint", "Tallyn's Reach"] },
  "Fort Collins":   { county: "Larimer County",      medianHomePrice: 490000, propertyTaxRate: 0.50, fhaLoanLimit: 787750, dpaProgram: "CHFA and Fort Collins HFC down payment assistance programs", neighborhoods: ["Old Town", "Fossil Creek", "Midtown", "Timnath"] },
  "Lakewood":       { county: "Jefferson County",    medianHomePrice: 490000, propertyTaxRate: 0.49, fhaLoanLimit: 787750, dpaProgram: "CHFA SmartStep for Lakewood buyers; Jefferson County also participates", neighborhoods: ["Belmar", "Green Mountain", "Applewood", "Wheat Ridge"] },
  "Pueblo":         { county: "Pueblo County",       medianHomePrice: 245000, propertyTaxRate: 0.66, fhaLoanLimit: 498257, dpaProgram: "CHFA programs available statewide including Pueblo", neighborhoods: ["Historic Arkansas Riverwalk", "Belmont", "Eastside", "University Park"] },
  // Virginia
  "Virginia Beach": { county: "Virginia Beach (City)", medianHomePrice: 375000, propertyTaxRate: 0.99, fhaLoanLimit: 498257, dpaProgram: "VHDA Granting Freedom and Down Payment Assistance Grant for qualifying buyers", neighborhoods: ["Oceanfront", "Sandbridge", "Town Center", "Kempsville"] },
  "Richmond":       { county: "Richmond (City)",       medianHomePrice: 330000, propertyTaxRate: 1.09, fhaLoanLimit: 498257, dpaProgram: "VHDA Down Payment Assistance Grant and Richmond Redevelopment programs", neighborhoods: ["The Fan", "Carytown", "Scott's Addition", "Church Hill"] },
  "Norfolk":        { county: "Norfolk (City)",        medianHomePrice: 275000, propertyTaxRate: 1.11, fhaLoanLimit: 498257, dpaProgram: "VHDA programs and Norfolk Redevelopment and Housing Authority assistance", neighborhoods: ["Ghent", "Larchmont", "Ocean View", "Wards Corner"] },
  "Chesapeake":     { county: "Chesapeake (City)",     medianHomePrice: 355000, propertyTaxRate: 0.95, fhaLoanLimit: 498257, dpaProgram: "VHDA Down Payment Assistance Grant for Chesapeake buyers", neighborhoods: ["Great Bridge", "Greenbrier", "Deep Creek", "Western Branch"] },
  "Alexandria":     { county: "Alexandria (City)",     medianHomePrice: 580000, propertyTaxRate: 0.93, fhaLoanLimit: 498257, dpaProgram: "VHDA and Alexandria ARHA programs; jumbo financing common in this market", neighborhoods: ["Old Town", "Del Ray", "Cameron Station", "Eisenhower Ave"] },
  // DC
  "Washington":     { county: "District of Columbia",  medianHomePrice: 640000, propertyTaxRate: 0.55, fhaLoanLimit: 1149825, dpaProgram: "DC HPAP (Home Purchase Assistance Program) — up to $202,000 for low-income first-time buyers; DC Open Doors", neighborhoods: ["Capitol Hill", "Shaw", "Anacostia", "Georgetown"] },
  // Maryland
  "Baltimore":      { county: "Baltimore City",        medianHomePrice: 220000, propertyTaxRate: 1.72, fhaLoanLimit: 632500, dpaProgram: "Maryland Mortgage Program (MMP) and Baltimore City Live Near Your Work incentive", neighborhoods: ["Federal Hill", "Fells Point", "Roland Park", "Canton"] },
  "Silver Spring":  { county: "Montgomery County",    medianHomePrice: 510000, propertyTaxRate: 1.00, fhaLoanLimit: 1149825, dpaProgram: "Maryland Mortgage Program (MMP) — Montgomery County higher loan limits apply", neighborhoods: ["Downtown Silver Spring", "Woodside", "Four Corners", "Wheaton"] },
  "Bowie":          { county: "Prince George's County",medianHomePrice: 415000, propertyTaxRate: 1.16, fhaLoanLimit: 1149825, dpaProgram: "MMP and Prince George's County Pathway to Purchase DPA program", neighborhoods: ["Bowie Town Center", "Belair", "South Bowie", "Glenn Dale"] },
  "Rockville":      { county: "Montgomery County",    medianHomePrice: 560000, propertyTaxRate: 1.00, fhaLoanLimit: 1149825, dpaProgram: "Maryland Mortgage Program — higher loan limits in Montgomery County", neighborhoods: ["Twinbrook", "King Farm", "White Flint", "Potomac"] },
  "Gaithersburg":   { county: "Montgomery County",    medianHomePrice: 470000, propertyTaxRate: 1.00, fhaLoanLimit: 1149825, dpaProgram: "Maryland Mortgage Program (MMP) for qualifying Montgomery County buyers", neighborhoods: ["Kentlands", "Rio", "Lakelands", "Shady Grove"] },
  "Frederick":      { county: "Frederick County",     medianHomePrice: 420000, propertyTaxRate: 1.05, fhaLoanLimit: 498257, dpaProgram: "Maryland Mortgage Program (MMP) — statewide DPA eligibility", neighborhoods: ["Historic Downtown Frederick", "Gambrill Heights", "Ballenger Creek", "New Market"] },
  // California
  "Los Angeles":    { county: "Los Angeles County",   medianHomePrice: 850000, propertyTaxRate: 0.72, fhaLoanLimit: 1149825, dpaProgram: "CalHFA MyHome Assistance Program — up to 3.5% DPA; LA County LACDA programs", neighborhoods: ["Silver Lake", "Culver City", "Pasadena", "Long Beach"] },
  "San Diego":      { county: "San Diego County",     medianHomePrice: 870000, propertyTaxRate: 0.73, fhaLoanLimit: 1149825, dpaProgram: "CalHFA MyHome and San Diego Housing Commission (SDHC) programs", neighborhoods: ["North Park", "Mission Valley", "Chula Vista", "Rancho Bernardo"] },
  "San Jose":       { county: "Santa Clara County",   medianHomePrice: 1200000, propertyTaxRate: 0.65, fhaLoanLimit: 1149825, dpaProgram: "CalHFA and Santa Clara County Empower Homebuyers program", neighborhoods: ["Willow Glen", "Almaden Valley", "Downtown San Jose", "Santana Row"] },
  "San Francisco":  { county: "San Francisco County", medianHomePrice: 1300000, propertyTaxRate: 0.65, fhaLoanLimit: 1149825, dpaProgram: "MOHCD Below Market Rate (BMR) program; CalHFA for qualifying buyers", neighborhoods: ["Mission District", "Cole Valley", "Noe Valley", "Richmond District"] },
  "Fresno":         { county: "Fresno County",        medianHomePrice: 360000, propertyTaxRate: 0.73, fhaLoanLimit: 498257, dpaProgram: "CalHFA MyHome and Fresno Housing Authority first-time buyer programs", neighborhoods: ["Tower District", "Bullard", "Sunnyside", "Clovis"] },
  "Sacramento":     { county: "Sacramento County",    medianHomePrice: 490000, propertyTaxRate: 0.75, fhaLoanLimit: 763600, dpaProgram: "CalHFA MyHome and Sacramento Housing and Redevelopment Agency (SHRA) programs", neighborhoods: ["East Sacramento", "Midtown", "Natomas", "Elk Grove"] },
  "Long Beach":     { county: "Los Angeles County",   medianHomePrice: 760000, propertyTaxRate: 0.72, fhaLoanLimit: 1149825, dpaProgram: "CalHFA MyHome and LA County LACDA programs for qualifying buyers", neighborhoods: ["Belmont Shore", "Bixby Knolls", "Signal Hill", "Lakewood"] },
  "Oakland":        { county: "Alameda County",       medianHomePrice: 780000, propertyTaxRate: 0.77, fhaLoanLimit: 1149825, dpaProgram: "CalHFA and Alameda County Mortgage Assistance Program (MAP)", neighborhoods: ["Rockridge", "Grand Lake", "Temescal", "Fruitvale"] },
  "Bakersfield":    { county: "Kern County",          medianHomePrice: 340000, propertyTaxRate: 0.78, fhaLoanLimit: 498257, dpaProgram: "CalHFA MyHome and Kern County Housing programs for first-time buyers", neighborhoods: ["Southwest Bakersfield", "Oleander", "East Bakersfield", "Rosedale"] },
  "Anaheim":        { county: "Orange County",        medianHomePrice: 840000, propertyTaxRate: 0.72, fhaLoanLimit: 1149825, dpaProgram: "CalHFA MyHome and Orange County Housing Finance Trust DPA programs", neighborhoods: ["Anaheim Hills", "Platinum Triangle", "Colony District", "Fullerton"] },
  // Mississippi
  "Jackson":        { county: "Hinds County",         medianHomePrice: 145000, propertyTaxRate: 0.77, fhaLoanLimit: 498257, dpaProgram: "Mississippi Home Corporation (MHC) Smart6 and MHC DPA programs statewide", neighborhoods: ["Belhaven", "Fondren", "Eastover", "Ridgeland"] },
  "Gulfport":       { county: "Harrison County",      medianHomePrice: 195000, propertyTaxRate: 0.51, fhaLoanLimit: 498257, dpaProgram: "MHC Smart6 mortgage and MHC Down Payment Assistance program", neighborhoods: ["Long Beach", "Pass Christian", "D'Iberville", "Biloxi Coast"] },
  "Southaven":      { county: "DeSoto County",        medianHomePrice: 250000, propertyTaxRate: 0.52, fhaLoanLimit: 498257, dpaProgram: "MHC DPA programs; DeSoto County is among the fastest-growing in MS", neighborhoods: ["Horn Lake", "Olive Branch", "Hernando", "Walls"] },
  "Hattiesburg":    { county: "Forrest County",       medianHomePrice: 180000, propertyTaxRate: 0.63, fhaLoanLimit: 498257, dpaProgram: "MHC Smart6 and DPA programs for qualifying Hattiesburg buyers", neighborhoods: ["Oak Grove", "Petal", "Sumrall", "USM Area"] },
  "Biloxi":         { county: "Harrison County",      medianHomePrice: 205000, propertyTaxRate: 0.51, fhaLoanLimit: 498257, dpaProgram: "MHC DPA program for Harrison County first-time buyers", neighborhoods: ["Back Bay", "D'Iberville", "Ocean Springs", "Point Cadet"] },
  "Meridian":       { county: "Lauderdale County",    medianHomePrice: 130000, propertyTaxRate: 0.74, fhaLoanLimit: 498257, dpaProgram: "MHC Smart6 program — statewide eligibility for qualifying buyers", neighborhoods: ["Northwest Meridian", "Bonita Lakes", "East Meridian", "Collinsville"] },
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
    { q: "What is a jumbo loan?", a: "A jumbo loan exceeds the conforming loan limit that applies to the property. For 2026, the baseline one-unit limit is $832,750 and the high-cost ceiling is $1,249,125. Jumbo loans are not eligible for purchase by Fannie Mae or Freddie Mac." },
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

/**
 * AEO (Answer Engine Optimization) FAQs — high-intent, conversational question format.
 * Each function receives (city, state) and returns 3 targeted Q&A pairs for that loan type.
 * These target "People Also Ask" boxes and voice search snippets.
 */
export const AEO_FAQS: Record<string, (city: string, state: string) => { q: string; a: string }[]> = {
  "FHA Loan": (city, state) => [
    {
      q: `How do I qualify for an FHA loan in ${city}, ${state} with a 620 credit score?`,
      a: `A 620 credit score qualifies you for a 3.5% down payment FHA loan in ${city}, ${state}. You will also need a debt-to-income ratio at or below 43%, a steady 2-year employment history, and the property must be your primary residence. Harris Capital Mortgage Group's loan officers in ${state} can review your full profile and confirm eligibility in minutes — no hard credit check required for an initial estimate.`,
    },
    {
      q: `What is the FHA loan limit in ${city}, ${state} for 2026?`,
      a: `HUD's 2026 FHA one-unit limits range from $541,287 to $1,249,125 nationally, but the exact limit is county-specific. Your Harris Capital loan officer will confirm the applicable limit for the property county.`,
    },
    {
      q: `Can I buy a home in ${city} with no money down if I have an FHA loan?`,
      a: `FHA loans require a minimum 3.5% down payment — they are not zero-down loans. However, the down payment can come from down payment assistance programs in ${state}, a gift from a family member, or local grant programs. Our loan officers know every active DPA program in ${city} and can tell you whether you qualify for a grant or second mortgage that effectively reduces your out-of-pocket to near zero.`,
    },
  ],
  "VA Loan": (city, state) => [
    {
      q: `Can I buy a home in ${city}, ${state} with a VA loan and zero down payment?`,
      a: `Yes. If you are an eligible veteran, active duty service member, or qualifying surviving spouse, a VA loan in ${city}, ${state} allows 100% financing — zero down payment, no private mortgage insurance. Harris Capital Mortgage Group's VA specialists handle your Certificate of Eligibility (COE) and guide you through the VA appraisal process specific to ${state}.`,
    },
    {
      q: `What is the VA funding fee for a home purchase in ${state}?`,
      a: `For most first-time VA loan users putting zero down, the funding fee is 2.15% of the loan amount. For subsequent uses it rises to 3.3%. Some veterans with service-connected disabilities are fully exempt from the funding fee. Your HCMG loan officer will verify your exemption status before estimating your closing costs.`,
    },
    {
      q: `How long does it take to close a VA loan in ${city}?`,
      a: `Most VA loans in ${city} close in 30–45 days when all documents are submitted promptly. The VA appraisal — which can only be ordered by a VA-approved lender — is often the longest step. Harris Capital's VA team in ${state} knows the local appraiser timeline and will set accurate expectations from day one.`,
    },
  ],
  "Conventional Loan": (city, state) => [
    {
      q: `What credit score do I need for a conventional loan in ${city}, ${state}?`,
      a: `Most conventional loan programs in ${city}, ${state} require a minimum credit score of 620. Higher scores — 740 and above — unlock significantly better interest rates and eliminate mortgage insurance costs at lower down payment levels. HCMG's loan officers will show you side-by-side rate comparisons based on your specific score so you can make an informed decision.`,
    },
    {
      q: `How much should I put down on a conventional loan in ${city} to avoid PMI?`,
      a: `A 20% down payment eliminates private mortgage insurance (PMI) on a conventional loan. In ${city} where the median home price is higher, that can be a significant hurdle. Programs like Fannie Mae HomeReady and Freddie Mac Home Possible allow as little as 3% down for qualifying buyers — though PMI will apply until you reach 20% equity. Your Harris Capital loan officer will calculate the exact PMI cost and break-even point for your price range.`,
    },
    {
      q: `What is the conforming loan limit for a conventional loan in ${state} in 2026?`,
      a: `The 2026 baseline conforming limit for a one-unit property is $832,750, with a high-cost ceiling of $1,249,125. The applicable limit depends on the property county and unit count.`,
    },
  ],
  "Refinance": (city, state) => [
    {
      q: `When does it make sense to refinance my mortgage in ${city}, ${state}?`,
      a: `Refinancing in ${city} typically makes sense when you can reduce your interest rate by at least 0.5–1.0%, convert an ARM to a fixed rate before a reset, or tap equity for a home improvement or debt consolidation. Your break-even timeline matters — if you plan to sell within 3 years, the closing costs may outweigh the savings. HCMG's ${state} loan officers will run the numbers for your specific situation at no cost.`,
    },
    {
      q: `How much equity do I need to do a cash-out refinance in ${state}?`,
      a: `Most lenders allow a cash-out refinance up to 80% loan-to-value (LTV) on a primary residence — meaning you need at least 20% equity remaining after the refinance. FHA cash-out allows up to 80% LTV as well. VA cash-out can go up to 90% for eligible veterans. Harris Capital will assess your current equity position in ${city} and determine which program gives you the most cash while keeping your payment manageable.`,
    },
    {
      q: `How long does a refinance take to close in ${city}?`,
      a: `A refinance in ${city} typically closes in 30–45 days. Cash-out refinances can take slightly longer due to additional appraisal and title review steps. The fastest path is to gather your last two pay stubs, W-2s, two months of bank statements, and your current mortgage statement before you apply. HCMG's digital process lets you upload documents securely so your ${state} loan officer can move quickly.`,
    },
  ],
  "First-Time Buyer": (city, state) => [
    {
      q: `What down payment assistance programs are available for first-time buyers in ${city}, ${state}?`,
      a: `${state} offers several down payment assistance programs for first-time buyers in ${city}. Options typically include state housing agency grants, forgivable second mortgages, and deferred loans with no monthly payment. Income and purchase price limits apply. Harris Capital's ${state} loan officers are certified with the primary state programs and will identify every program you qualify for — including local city and county programs that many lenders overlook.`,
    },
    {
      q: `How much money do I need to buy my first home in ${city}, ${state}?`,
      a: `For a first home in ${city}, plan for 3–5% down payment (or less with assistance programs), 2–3% in closing costs, and a small cash reserve for move-in expenses. With down payment assistance, your out-of-pocket can be significantly lower. HCMG will give you a precise cash-to-close estimate — including taxes, insurance, and prepaid items — before you tour a single home, so there are no surprises at the closing table.`,
    },
    {
      q: `Do I need a real estate agent to buy my first home in ${city}?`,
      a: `You are not legally required to use a buyer's agent in ${state}, but most first-time buyers benefit from one — especially in competitive markets like ${city}. Starting with a mortgage pre-qualification from Harris Capital before you engage an agent gives you a clear budget and makes your offers stronger. Our loan officers work with buyer's agents across ${city} every day and can refer you to experienced professionals if needed.`,
    },
  ],
  "Down Payment Assistance": (city, state) => [
    {
      q: `How do I qualify for down payment assistance in ${city}, ${state}?`,
      a: `Down payment assistance eligibility in ${city} typically requires: a credit score of 620 or higher, income at or below 80–115% of the area median income (AMI), the property must be a primary residence, and you may need to complete a homebuyer education course. Many programs also require first-time buyer status, defined as not owning a home in the past 3 years. Harris Capital's ${state} loan officers will match you to every program you qualify for in ${city} within minutes.`,
    },
    {
      q: `Do I have to repay down payment assistance in ${state}?`,
      a: `It depends on the program. Some ${state} DPA programs are forgivable grants — if you stay in the home for a set period (usually 3–10 years), you never repay the assistance. Others are deferred second mortgages with no monthly payment, due only when you sell, refinance, or pay off the home. A small number require monthly payments. Your HCMG loan officer will explain the exact terms of every program you are matched with in ${city}.`,
    },
    {
      q: `Can I combine down payment assistance with an FHA loan in ${city}?`,
      a: `Yes. Many ${state} down payment assistance programs are specifically designed to pair with FHA loans, reducing your out-of-pocket to as little as $500–$1,000. The DPA covers part or all of the required 3.5% FHA down payment and sometimes closing costs as well. Harris Capital works with the major ${state} DPA programs and can structure your loan to maximize the benefit while keeping your monthly payment within budget for ${city}'s median home prices.`,
    },
  ],
  "Jumbo Loan": (city, state) => [
    {
      q: `What is the jumbo loan threshold in ${city}, ${state} for 2026?`,
      a: `A loan becomes jumbo when its amount exceeds the conforming limit that applies to the property. The 2026 one-unit baseline is $832,750 and some high-cost counties have higher limits, up to $1,249,125.`,
    },
    {
      q: `What credit score and down payment do I need for a jumbo loan in ${city}?`,
      a: `Most jumbo loan programs in ${city} require a minimum credit score of 700–720 and a down payment of 10–20% depending on loan size. Lenders also scrutinize cash reserves after closing — typically 6–12 months of mortgage payments held in verifiable assets. The stronger your financial profile, the more competitive your jumbo rate. HCMG's loan officers will match you to the jumbo program with the best rate for your specific profile.`,
    },
    {
      q: `Are jumbo loan rates higher than conventional rates in ${state}?`,
      a: `Jumbo loan rates in ${state} have historically been 0.25–0.5% higher than conforming rates, though in some market environments they have been nearly equal or even lower. The rate spread depends on your credit score, down payment, reserves, and the lender's jumbo product. Harris Capital works with multiple jumbo investors and will present the best available rate for your ${city} purchase price and profile.`,
    },
  ],
  "USDA Loan": (city, state) => [
    {
      q: `Do areas near ${city}, ${state} qualify for a USDA loan?`,
      a: `USDA loan eligibility is based on the USDA's property eligibility map — not a strict definition of "rural." Many suburban areas and small towns near ${city} qualify. Your HCMG loan officer can look up any specific address instantly. USDA loans offer 100% financing (zero down payment) and are often the best-value loan for buyers purchasing outside dense urban cores in ${state}.`,
    },
    {
      q: `What is the income limit for a USDA loan in ${state}?`,
      a: `USDA income limits vary by county and household size, but typically allow buyers earning up to 115% of the area median income (AMI). In ${state}, that translates to different thresholds depending on the county — rural counties have lower AMI benchmarks. HCMG's ${state} loan officers run the USDA income eligibility check as part of the initial consultation at no cost.`,
    },
    {
      q: `How does a USDA loan compare to an FHA loan for a home near ${city}?`,
      a: `A USDA loan is often better than an FHA loan for buyers who qualify, because USDA requires zero down payment versus FHA's 3.5%, and USDA's annual mortgage insurance fee (0.35%) is lower than FHA's annual MIP (0.55–0.85%). The tradeoff is that USDA has geographic and income limits that FHA does not. Your HCMG loan officer near ${city} will compare both options side by side so you can choose the better-value program.`,
    },
  ],
  "HELOC": (city, state) => [
    {
      q: `How much can I borrow with a HELOC on my home in ${city}, ${state}?`,
      a: `Most HELOC lenders allow you to borrow up to 85–90% of your home's value minus your existing mortgage balance. In ${city} where home values have appreciated significantly, many homeowners have substantial equity available. Harris Capital can give you a quick equity estimate based on current ${city} market data and your original loan balance — no formal appraisal needed for an initial assessment.`,
    },
    {
      q: `What are typical HELOC interest rates in ${state} right now?`,
      a: `HELOC rates are variable and tied to the prime rate. In ${state}, current HELOC rates typically range from prime + 0% to prime + 2%, depending on your credit score, equity position, and lender. HELOCs generally carry lower rates than personal loans or credit cards, making them a cost-effective option for home improvements, debt consolidation, or large expenses in ${city}.`,
    },
    {
      q: `Is a HELOC or a cash-out refinance better for my ${city} home?`,
      a: `It depends on your first mortgage rate. If your current mortgage rate is below today's market rates, a HELOC lets you access equity without refinancing your first mortgage — preserving your low rate. If your first mortgage rate is at or above current market rates, a cash-out refinance might lower your overall payment while pulling cash out. HCMG's ${state} loan officers will model both options with real numbers for your ${city} property.`,
    },
  ],
  "ARM Loan": (city, state) => [
    {
      q: `Is an ARM loan a good idea for buying in ${city}, ${state}?`,
      a: `An ARM loan can make sense in ${city} if you plan to sell or refinance within 5–7 years, since the initial fixed-rate period typically offers a lower rate than a 30-year fixed. It also works well for buyers expecting significant income growth. However, if you plan to stay long-term, a fixed-rate loan eliminates the payment risk of rate adjustments. HCMG's ${state} loan officers will model both scenarios with current rates so you can choose confidently.`,
    },
    {
      q: `What happens to my payment when an ARM adjusts in ${state}?`,
      a: `When your ARM loan's fixed period ends, the rate adjusts annually based on a market index (typically SOFR). ARM loans include caps: a per-adjustment cap (typically 2%), a lifetime cap (typically 5–6%), and an initial adjustment cap (typically 2–5%). At worst case, your rate could rise by the lifetime cap amount. Your HCMG loan officer will show you the worst-case scenario payment for any ARM you consider so there are no surprises.`,
    },
    {
      q: `What ARM loan terms are available in ${city}, ${state}?`,
      a: `Common ARM structures in ${city} are 5/1, 7/1, and 10/1 ARMs — the first number is the fixed-rate period in years, the second is how often the rate adjusts afterward. A 7/1 ARM in ${state} gives you a lower rate than a 30-year fixed for 7 full years, then adjusts annually. For buyers who plan to sell within the fixed period, the savings can be substantial on higher-priced ${city} properties.`,
    },
  ],
  "Investment Property Loan": (city, state) => [
    {
      q: `What down payment do I need for an investment property in ${city}, ${state}?`,
      a: `Investment property loans in ${city} typically require 15–25% down depending on the property type and loan program. Single-family rentals often qualify for 15–20% down on conventional investment loans. Multi-unit properties (2–4 units) require 20–25%. A larger down payment improves your rate and cash flow analysis. Harris Capital's ${state} loan officers specialize in investment property financing and will structure the optimal down payment for your ${city} rental scenario.`,
    },
    {
      q: `Can I use projected rental income to qualify for an investment property loan in ${city}?`,
      a: `Yes. Lenders can typically count 75% of documented or projected rental income toward your qualifying income on investment properties in ${city}. For existing rentals, you need a current lease and proof of deposits. For new rentals, a market rent appraisal is used. HCMG's ${state} loan officers will walk you through exactly what documentation is needed to count rental income for your specific ${city} property type.`,
    },
    {
      q: `Are mortgage rates higher for investment properties in ${state} than for a primary home?`,
      a: `Yes. Investment property mortgage rates in ${state} are typically 0.5–1.0% higher than rates for primary residences because lenders view investment loans as higher risk. Strong credit (720+), a larger down payment (25%+), and significant cash reserves can minimize this premium. Harris Capital works with multiple investor programs and will find the most competitive rate available for your ${city} investment property profile.`,
    },
  ],
  "Condo Loan": (city, state) => [
    {
      q: `Are condos in ${city}, ${state} FHA-approved?`,
      a: `Not all condo buildings in ${city} are on the FHA-approved list, but individual unit approvals are now available for projects that were previously blocked. If the building you are interested in is not FHA-approved, your HCMG loan officer will check whether it qualifies for the DELRAP individual unit approval process. Conventional condo loans have a separate review process and can sometimes be obtained even when FHA is not available.`,
    },
    {
      q: `What is a condo questionnaire and why does it matter for my ${city} purchase?`,
      a: `A condo questionnaire is completed by the condo HOA and provides lenders with data on the building's financial health, insurance coverage, owner-occupancy rate, and active litigation. If the ${city} building you are purchasing in fails the review — due to high investor concentration or inadequate reserves, for example — your loan may not be approved for that project. HCMG reviews condo questionnaires early in the process to identify issues before you are under contract.`,
    },
    {
      q: `What is a non-warrantable condo and can I get a mortgage on one in ${state}?`,
      a: `A non-warrantable condo in ${state} is one that does not meet Fannie Mae or Freddie Mac guidelines — often due to high investor concentration, active litigation, or a hotel/resort designation. These properties cannot be financed with conventional agency loans. However, portfolio lenders and some jumbo programs can finance non-warrantable condos in ${city} at slightly higher rates. HCMG's ${state} loan officers know which ${city} buildings have warrantability issues and will steer you to the right program before you make an offer.`,
    },
  ],
};
