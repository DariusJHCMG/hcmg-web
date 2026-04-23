export type SeoPage = {
  slug: string;
  city: string;
  state: string;
  loanType: string;
  headline: string;
  description: string;
};

const cities = [
  ["Orlando", "FL"], ["Miami", "FL"], ["Tampa", "FL"], ["Jacksonville", "FL"],
  ["Atlanta", "GA"], ["Savannah", "GA"], ["Dallas", "TX"], ["Houston", "TX"],
  ["Austin", "TX"], ["San Antonio", "TX"], ["Las Vegas", "NV"], ["Reno", "NV"],
  ["Denver", "CO"], ["Colorado Springs", "CO"], ["Virginia Beach", "VA"],
  ["Richmond", "VA"], ["Washington", "DC"], ["Baltimore", "MD"],
  ["Silver Spring", "MD"], ["Bowie", "MD"],
] as const;

const loanTypes = [
  "FHA Loan", "VA Loan", "Conventional Loan", "Refinance", "First-Time Buyer",
] as const;

export const seoPages: SeoPage[] = cities.flatMap(([city, state]) =>
  loanTypes.map((loanType) => ({
    slug: `${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${loanType.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    city,
    state,
    loanType,
    headline: `${loanType} in ${city}, ${state}`,
    description: `Explore ${loanType.toLowerCase()} options, payment estimates, and next steps for buyers in ${city}, ${state}. Harris Capital Mortgage Group · NMLS# 1918223.`,
  })),
);

export const featuredCities = seoPages.slice(0, 12);

export const STATE_COPY: Record<string, string> = {
  FL: "Florida's real estate market has seen strong buyer demand. Down payment assistance programs are available for first-time buyers through the Florida Housing Finance Corporation.",
  TX: "Texas has no state income tax, which can increase your buying power. Property taxes vary significantly by county — your loan officer will factor in local rates.",
  GA: "Georgia offers first-time homebuyer programs through GAHFA. The Atlanta metro continues to see competitive offers, and our team knows the local market.",
  NV: "Nevada's no state income tax is attractive to relocating buyers. Las Vegas and Reno markets move quickly — a fast pre-qualification matters.",
  CO: "Colorado's CHFA offers down payment assistance and below-market rate programs for first-time buyers. Mountain and metro markets both remain competitive.",
  VA: "Virginia has strong employment markets and diverse housing stock. Northern Virginia near DC commands premium pricing — our team specializes in this corridor.",
  DC: "Washington DC has some of the highest median home prices on the East Coast. DC and Maryland first-time buyer programs can significantly reduce upfront costs.",
  MD: "Maryland offers the MMP (Maryland Mortgage Program) for first-time buyers with competitive rates and down payment help. Proximity to DC affects pricing in many counties.",
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
    { q: "What should I expect during the homebuying process?", a: "The typical process: pre-qualification → home search → offer → inspection → loan processing → appraisal → closing. Orange Key helps you understand your numbers before you start searching." },
    { q: "How much should I save before buying?", a: "Aim for 3–5% for down payment, plus 2–3% for closing costs, plus 1–2% for move-in expenses and immediate repairs. Your loan officer will give you a precise cash-to-close estimate." },
  ],
};
