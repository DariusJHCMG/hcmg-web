export type GlossaryCategory =
  | "Loan Types"
  | "Costs & Fees"
  | "Underwriting"
  | "Process & Closing"
  | "Credit & Qualification"
  | "Property & Appraisal"
  | "Servicing"
  | "Refinance"
  | "Parties & Roles"
  | "Programs & Agencies";

export type GlossaryTerm = {
  slug: string;
  term: string;
  shortDef: string;
  longDef: string[];
  related: string[];
  category: GlossaryCategory;
};

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: "adjustable-rate-mortgage",
    term: "Adjustable-Rate Mortgage (ARM)",
    shortDef:
      "A home loan whose interest rate is fixed for an initial period and then adjusts on a set schedule based on a market index.",
    longDef: [
      "An adjustable-rate mortgage carries an interest rate that resets at predetermined intervals after an introductory fixed window. The most common structures are 5/6, 7/6, and 10/6 ARMs, the first number is how many years the starting rate is locked, and the second indicates how often the rate adjusts in months once the fixed period ends.",
      "Adjustments are calculated by adding a fixed margin (set by your lender at origination) to a published index such as SOFR. Caps limit how much the rate can move at the first adjustment, at each subsequent adjustment, and over the life of the loan, so even in a rising-rate environment your payment cannot spike without ceiling.",
      "ARMs typically offer a lower starting rate than a comparable fixed-rate mortgage, which can make sense if you plan to sell or refinance before the fixed period ends. They carry payment-shock risk if you stay in the loan past the initial reset, so the math should always include a worst-case scenario.",
    ],
    related: ["fixed-rate-mortgage", "interest-rate", "rate-lock", "refinance"],
    category: "Loan Types",
  },
  {
    slug: "annual-percentage-rate",
    term: "Annual Percentage Rate (APR)",
    shortDef:
      "A blended figure that combines the note rate with most upfront loan costs to express the true yearly cost of borrowing.",
    longDef: [
      "APR is a regulatory disclosure designed to help borrowers compare loans on equal footing. It captures the interest rate plus the financing-related charges the lender either collects directly or builds into the deal, discount points, origination fees, mortgage insurance premiums, and certain third-party costs the lender requires.",
      "Because APR includes those upfront costs amortized over the full loan term, it almost always reads higher than the note rate. A loan with a low quoted rate but heavy points may carry an APR meaningfully above its rate, while a no-point loan from the same lender will show APR much closer to its note rate.",
      "APR is most useful when you're comparing two loans you'd realistically keep to maturity. If you expect to refinance or sell within a few years, the upfront costs dominate the math and you should compare total dollars paid in your actual holding period rather than relying on APR alone.",
    ],
    related: ["interest-rate", "discount-points", "origination-fee", "loan-estimate"],
    category: "Costs & Fees",
  },
  {
    slug: "appraisal",
    term: "Appraisal",
    shortDef:
      "An independent valuation of a property by a licensed appraiser, used to confirm that the home is worth what the buyer agreed to pay.",
    longDef: [
      "Every purchase mortgage requires the lender to verify that the property securing the loan is worth at least the contract price. An appraiser visits the home, measures it, photographs the condition, and reconciles its value against recent sales of comparable nearby properties.",
      "When the appraised value matches or exceeds the purchase price, the loan moves forward as agreed. When it comes in low, the buyer has a few options: renegotiate with the seller, bring extra cash to bridge the gap, dispute the appraisal with supporting comparable sales, or, if their contract allows, walk away.",
      "Some refinances and select purchase scenarios qualify for an appraisal waiver, where the lender accepts an automated valuation in place of a full report. Whether that's available depends on the loan program, the strength of the borrower file, and the property's data footprint with the agencies.",
    ],
    related: ["comparable-sales", "market-value", "property-inspection-waiver", "loan-to-value"],
    category: "Property & Appraisal",
  },
  {
    slug: "buyers-agent",
    term: "Buyer's Agent",
    shortDef:
      "A licensed real estate agent who represents the buyer's interests in a home purchase transaction.",
    longDef: [
      "A buyer's agent works exclusively for the person purchasing the home, they identify suitable listings, schedule showings, draft offer terms, negotiate price and contingencies, and shepherd the contract through inspection, appraisal, and closing.",
      "Compensation has historically been paid out of the seller's proceeds at closing, though recent industry settlements have shifted some markets toward buyers negotiating and signing their agent's commission directly. Either way, the cost is real and should be understood up front.",
      "Choosing an agent who knows your specific market matters more than any other single factor, local inventory pace, recent comps, builder reputation, and HOA quirks all live in the heads of agents who do twenty deals a year in your zip code.",
    ],
    related: ["sellers-agent", "purchase-agreement", "earnest-money-deposit", "comparable-sales"],
    category: "Parties & Roles",
  },
  {
    slug: "balancing",
    term: "Balancing",
    shortDef:
      "The final pre-closing step where the lender, title company, and settlement agent confirm every dollar in the transaction adds up exactly.",
    longDef: [
      "Before the closing disclosure can be marked final, every party touching the file has to reconcile their numbers against the Closing Disclosure. The loan amount, the cash to close, every credit, every fee, every prorated item, all of it has to tie out across the lender's system and the title company's ledger.",
      "Balancing usually happens in the last day or two before closing. If there's any discrepancy, a wrong tax proration, a missed lender credit, an updated payoff figure on the seller's existing loan, it gets resolved at this stage so signing day is a non-event.",
      "When balancing fails late, closings get rescheduled. That's why experienced loan officers and processors push to get the file balanced 48–72 hours before the scheduled closing rather than the morning of.",
    ],
    related: ["closing", "closing-disclosure", "cash-to-close", "settlement-fees"],
    category: "Process & Closing",
  },
  {
    slug: "cash-out-refinance",
    term: "Cash-Out Refinance",
    shortDef:
      "A refinance that replaces your existing mortgage with a new, larger loan and returns the difference to you as cash.",
    longDef: [
      "Cash-out refinances let homeowners tap accumulated equity by borrowing against their home's current value. The new loan pays off the old one and you walk away from closing with the remaining proceeds, less closing costs.",
      "Most lenders allow you to borrow up to 80% of the home's appraised value on a conventional cash-out, with FHA and VA programs sometimes permitting higher limits. The rate on a cash-out is generally a touch higher than on a no-cash-out refinance because of the increased risk profile.",
      "Borrowers commonly use cash-out proceeds for home improvement, debt consolidation, education costs, or investment opportunities. The trade-off is that you reset your amortization clock and convert unsecured uses of money into debt secured by your home, a worthwhile move when the math is favorable, a dangerous one when it isn't.",
    ],
    related: ["refinance", "equity", "loan-to-value", "home-equity-line-of-credit"],
    category: "Refinance",
  },
  {
    slug: "cash-to-close",
    term: "Cash to Close",
    shortDef:
      "The total amount of money the borrower must bring to the closing table in certified funds.",
    longDef: [
      "Cash to close is the sum of the down payment, closing costs, prepaid items like the first year of homeowner's insurance and the property-tax reserve, and any required reserves, minus credits from the lender, the seller, or earnest money already on deposit.",
      "The exact number appears on the Closing Disclosure, which must reach you at least three business days before closing. By that point, the figure should be stable; if anything material moves after, you generally get another three-day waiting period.",
      "Cash to close almost always has to arrive by wire transfer or cashier's check, personal checks above a small threshold typically aren't accepted. Wire fraud at closing is a real threat, so always verify wire instructions by phone with someone you've already spoken to before sending funds.",
    ],
    related: ["closing-disclosure", "closing-costs", "down-payment", "earnest-money-deposit"],
    category: "Costs & Fees",
  },
  {
    slug: "closing",
    term: "Closing",
    shortDef:
      "The final step of a real estate purchase or refinance where loan documents are signed and ownership or lien position transfers.",
    longDef: [
      "Closing, also called settlement, is the meeting (in person or remote) where the borrower signs the note, mortgage or deed of trust, and a stack of disclosures, while the seller signs the deed transferring ownership. Funds move, documents are notarized, and the new ownership and lien positions are recorded with the county.",
      "Most purchase closings take 30–45 minutes if everyone is prepared. Refinance closings are usually shorter. You'll want to bring a government-issued photo ID, and for purchases, evidence that your cash to close has wired in.",
      "Closings can happen at a title company, an attorney's office, a real estate office, or, increasingly, via remote online notarization from your kitchen table, depending on state law and lender support.",
    ],
    related: ["closing-disclosure", "closing-costs", "settlement-fees", "cash-to-close"],
    category: "Process & Closing",
  },
  {
    slug: "closing-costs",
    term: "Closing Costs",
    shortDef:
      "The collection of fees and prepaid items, separate from the down payment, that a borrower pays at closing.",
    longDef: [
      "Closing costs typically run 2%–5% of the loan amount on a purchase and similar on a refinance. They include lender charges (origination, underwriting, discount points), third-party services the lender requires (appraisal, credit report, flood certification, title work), government recording and transfer fees, and prepaid escrow items like the first year of homeowner's insurance.",
      "Many of these costs are negotiable or can be shopped, title insurance providers, in particular, often vary in price for the same coverage. Lender credits can offset closing costs in exchange for a slightly higher rate, which is the right move for buyers short on cash but with steady future income.",
      "Sellers can sometimes contribute toward a buyer's closing costs through a seller credit, subject to program limits. On a tight budget, structuring an offer with a seller credit can mean the difference between affording the closing table and walking away.",
    ],
    related: ["cash-to-close", "origination-fee", "discount-points", "sellers-credits"],
    category: "Costs & Fees",
  },
  {
    slug: "closing-disclosure",
    term: "Closing Disclosure",
    shortDef:
      "The five-page final-numbers document a lender must deliver to the borrower at least three business days before closing.",
    longDef: [
      "The Closing Disclosure (CD) is the federal-required snapshot of the entire transaction: loan terms, payment breakdown, total closing costs, cash to close, lender and seller credits, and a side-by-side comparison against the original Loan Estimate.",
      "By rule, the CD must be in the borrower's hands at least three business days before consummation. If certain key terms change after delivery, APR moves significantly, the loan product changes, or a prepayment penalty is added, the three-day clock restarts.",
      "Read the CD carefully and call your loan officer with any discrepancies the day you receive it. Most fixable errors are mundane (a typo in a name, a transposed digit in a tax proration); catching them at CD review rather than at the signing table avoids costly delays.",
    ],
    related: ["loan-estimate", "annual-percentage-rate", "cash-to-close", "closing-costs"],
    category: "Process & Closing",
  },
  {
    slug: "collateral",
    term: "Collateral",
    shortDef:
      "The asset pledged to secure a loan, which the lender can take and sell if the borrower defaults.",
    longDef: [
      "In a mortgage, the home itself is the collateral. The borrower owns it, but the lender holds a lien, a recorded legal claim, against the property until the loan is paid off. If the borrower stops paying, the lender's right to that collateral is what allows foreclosure to recover the unpaid balance.",
      "Because the lender's risk is partly secured by the property, mortgage rates are dramatically lower than rates on unsecured debt like credit cards. The trade-off is that the lender's claim on the home survives even sale or bankruptcy until satisfied.",
      "When you refinance, the new lender steps into the original lender's lien position. Second mortgages and HELOCs become subordinate liens, lower priority claims that get paid only after the first mortgage in any forced sale.",
    ],
    related: ["lien", "foreclosure", "loan-to-value", "subordination"],
    category: "Underwriting",
  },
  {
    slug: "comparable-sales",
    term: "Comparable Sales",
    shortDef:
      "Recent sales of similar nearby properties, used to support an appraiser's opinion of value.",
    longDef: [
      "Comparable sales, comps for short, are the evidence base behind almost every residential appraisal. An appraiser typically pulls three to six recently sold homes in the same neighborhood, with similar square footage, bedroom count, lot size, and condition, then adjusts each one for differences against the subject property.",
      "Strong comps are recent (ideally within 90 days), close by (often within a mile or even on the same street in dense areas), and genuinely similar in style and quality. When good comps don't exist, appraisers expand the search radius or time window and adjust further, which introduces more subjectivity.",
      "Buyers and sellers can pull their own comps before listing or making an offer to sanity-check pricing. Agents will do this as part of a CMA, comparative market analysis, which is a less formal cousin of the appraisal.",
    ],
    related: ["appraisal", "market-value", "buyers-agent", "sellers-agent"],
    category: "Property & Appraisal",
  },
  {
    slug: "conforming-mortgage",
    term: "Conforming Mortgage",
    shortDef:
      "A conventional loan whose amount falls within the limit eligible to be purchased by Fannie Mae or Freddie Mac.",
    longDef: [
      "Conforming loans meet the size and underwriting criteria set by the two government-sponsored enterprises that buy mortgages from lenders. The Federal Housing Finance Agency publishes annual loan-limit ceilings, higher in high-cost counties, and any conventional loan at or below that ceiling is conforming.",
      "Because Fannie and Freddie buy these loans in volume, they trade as commodities in the secondary market, which keeps rates competitive and the process standardized. Most conventional rate sheets quote conforming pricing as their reference point.",
      "A loan above the conforming limit is a jumbo loan, governed by different underwriting standards and held on lender balance sheets or sold to private investors rather than the agencies.",
    ],
    related: ["conventional-loans", "jumbo-loan", "high-balance-loan", "fannie-mae"],
    category: "Loan Types",
  },
  {
    slug: "conventional-loans",
    term: "Conventional Loans",
    shortDef:
      "Mortgages not insured or guaranteed by a government agency, typically sold to Fannie Mae or Freddie Mac.",
    longDef: [
      "Conventional loans are the workhorse of the mortgage market. They aren't backed by the FHA, VA, or USDA, but they conform to underwriting guidelines published by Fannie Mae and Freddie Mac, which buy them from originating lenders.",
      "Conventional underwriting rewards strong credit, steady documented income, and meaningful down payments. Borrowers with 20% down avoid mortgage insurance entirely; lower down payments are available (as little as 3% on some programs) with private mortgage insurance until equity reaches 20%.",
      "For buyers who qualify, conventional financing is usually the cheapest path over the life of the loan, no upfront funding fee, no permanent mortgage insurance, and the ability to drop PMI without refinancing.",
    ],
    related: ["conforming-mortgage", "fha-loan", "private-mortgage-insurance", "fannie-mae"],
    category: "Loan Types",
  },
  {
    slug: "credit-check",
    term: "Credit Check",
    shortDef:
      "A lender's review of your credit report and score to assess your willingness and ability to repay debt.",
    longDef: [
      "Mortgage lenders pull what's called a tri-merge, your reports from all three major credit bureaus (Equifax, Experian, TransUnion), and use the middle of the three FICO scores for qualification. This is a hard pull and may dent your score by a few points temporarily.",
      "Multiple mortgage credit checks within a focused shopping window (typically 14–45 days, depending on scoring model) are treated as a single inquiry, so it's safe to get rate quotes from several lenders without compounding the score impact.",
      "Beyond the score, underwriters look at the underlying tradelines: how long accounts have been open, payment history, recent late payments, collections, and how much of your available credit you're using. A score is just the summary, the report is the full story.",
    ],
    related: ["credit-score", "pre-approval", "underwriting", "loan-estimate"],
    category: "Credit & Qualification",
  },
  {
    slug: "credit-score",
    term: "Credit Score",
    shortDef:
      "A three-digit number summarizing your credit history, used by lenders as a primary risk metric.",
    longDef: [
      "Most mortgage decisions rely on FICO scores, which range from 300 to 850. Conventional loans generally start at a 620 minimum, FHA loans go down to 580 (and sometimes 500 with extra down payment), and VA loans don't publish an official minimum though most lenders enforce one.",
      "FICO weighting is roughly 35% payment history, 30% amounts owed, 15% length of history, 10% credit mix, and 10% new credit. The fastest score improvement for most borrowers comes from paying down revolving balances below 30%, and ideally below 10%, of their credit limits.",
      "Mortgage scores use specific older FICO versions that often read a few points different from consumer-facing scores you see in apps. Don't be surprised if your mortgage score is 10–30 points off from what your credit card app shows.",
    ],
    related: ["credit-check", "underwriting", "pre-approval", "debt-to-income"],
    category: "Credit & Qualification",
  },
  {
    slug: "debt-to-income",
    term: "Debt-to-Income Ratio (DTI)",
    shortDef:
      "The percentage of your gross monthly income that goes toward debt payments, including the proposed new mortgage.",
    longDef: [
      "DTI compares your monthly debt obligations to your gross monthly income. The numerator includes the proposed PITI, plus any other monthly debt: car loans, student loans, credit card minimums, child support, alimony, and other installment obligations.",
      "Conventional loans generally allow DTI up to around 45%–50% depending on compensating factors. Government programs, FHA, VA, and USDA, often permit somewhat higher DTIs because the agency guarantee lowers the lender's risk on each loan.",
      "Lowering DTI before applying is one of the highest-leverage things a borrower can do. Paying off a car loan with three months left, eliminating a small credit card balance, or restructuring student loans can each shift a tight file into the approval zone.",
    ],
    related: ["housing-ratio", "underwriting", "credit-score", "pre-approval"],
    category: "Credit & Qualification",
  },
  {
    slug: "disbursement",
    term: "Disbursement",
    shortDef:
      "The release and distribution of loan funds at closing to the parties entitled to receive them.",
    longDef: [
      "At closing, the lender wires the loan proceeds to the settlement agent (usually a title company or closing attorney), who then disburses funds according to the Closing Disclosure: the seller's net proceeds, the existing mortgage payoff, real estate commissions, county recording fees, title insurance premiums, and any other authorized payees.",
      "Most states require the settlement agent to disburse on the day of closing, but a handful operate as dry-funded, meaning documents are signed one day and funds disburse the next business day after final review. Your loan officer can tell you which model applies in your jurisdiction.",
      "Once disbursement happens and the deed and mortgage are recorded at the county, the transaction is officially complete. The borrower owns the home, the lender holds the lien, and you can change the locks.",
    ],
    related: ["closing", "settlement-fees", "cash-to-close", "closing-disclosure"],
    category: "Process & Closing",
  },
  {
    slug: "down-payment",
    term: "Down Payment",
    shortDef:
      "The portion of a home's purchase price the buyer pays out of pocket up front, with the mortgage covering the rest.",
    longDef: [
      "Down payment requirements vary by loan program. VA loans permit 0% down for eligible service members and veterans. USDA loans also allow 0% in qualifying rural areas. FHA requires 3.5% down for borrowers with credit scores of 580 or higher. Conventional loans accept as little as 3% down through specific first-time buyer programs.",
      "A larger down payment reduces the loan amount, eliminates or shrinks mortgage insurance, and generally unlocks better pricing. The classic 20% down target exists because it lets a borrower skip private mortgage insurance entirely on a conventional loan.",
      "Down payment funds need to be documented and sourced. Most lenders require two months of statements for any account the money is coming from, and gift funds from family members require a signed gift letter with bank statements showing the donor's ability to give and the transfer trail.",
    ],
    related: ["gift-letter", "loan-to-value", "private-mortgage-insurance", "cash-to-close"],
    category: "Costs & Fees",
  },
  {
    slug: "earnest-money-deposit",
    term: "Earnest Money Deposit",
    shortDef:
      "A good-faith cash deposit a buyer puts down when offering on a home, typically held in escrow until closing.",
    longDef: [
      "Earnest money signals to the seller that the buyer is serious. In most markets it runs 1%–3% of the purchase price, though in competitive situations it can be higher. The check or wire is held by a third party, usually the title company or listing brokerage, not delivered to the seller.",
      "If the deal closes, earnest money is credited toward the buyer's cash to close. If the deal falls apart for a reason the contract protects (failed inspection, low appraisal, loan denial within deadlines), the buyer gets it back. If the buyer simply walks away outside their contingencies, the seller usually keeps it.",
      "Earnest money is also a source of documented funds for underwriting. Once it clears your account and lands in escrow, the lender will trace it as part of your asset documentation and credit it against required cash at closing.",
    ],
    related: ["purchase-agreement", "cash-to-close", "escrow-account", "down-payment"],
    category: "Process & Closing",
  },
  {
    slug: "equity",
    term: "Equity",
    shortDef:
      "The portion of your home's value you own outright, calculated as current value minus what you owe on the mortgage.",
    longDef: [
      "If your home is worth $400,000 and you owe $260,000 on your mortgage, you have $140,000 in equity. Equity builds two ways: by paying down loan principal over time and by appreciation in the home's market value.",
      "Equity isn't liquid by default, to access it, you either sell the home, refinance and pull cash out, or open a home equity line of credit. Each path has costs and trade-offs in rate, payment structure, and how it interacts with your existing first mortgage.",
      "Many lenders calculate equity using a recent appraised value rather than the original purchase price. In rising markets that can mean substantial equity well before the loan amortization curve would suggest, but it can also evaporate if local values pull back.",
    ],
    related: ["cash-out-refinance", "home-equity-line-of-credit", "loan-to-value", "principal"],
    category: "Refinance",
  },
  {
    slug: "escrow-account",
    term: "Escrow Account",
    shortDef:
      "A lender-managed account that holds funds for property taxes and homeowner's insurance, paid in monthly with your mortgage.",
    longDef: [
      "When you have an escrow account, your monthly mortgage payment includes 1/12 of your annual property taxes and 1/12 of your annual homeowner's insurance premium. The lender holds the money and pays the bills when they come due.",
      "Escrow protects the lender's collateral position, unpaid taxes can become a senior lien ahead of the mortgage, and an uninsured loss could wipe out the property's value entirely. For the borrower, escrow smooths out lumpy annual bills into a predictable monthly amount.",
      "Lenders perform an annual escrow analysis to check whether the account is on track. If taxes or insurance rose, your monthly payment will go up to cover the higher annual outflow; if the account ran a surplus, you typically receive a refund check.",
    ],
    related: ["piti", "property-tax", "homeowners-insurance", "reserves"],
    category: "Servicing",
  },
  {
    slug: "fha-loan",
    term: "FHA Loan",
    shortDef:
      "A government-insured mortgage program designed to help buyers with lower credit scores or smaller down payments qualify.",
    longDef: [
      "FHA loans are insured by the Federal Housing Administration, a division of HUD. Because the federal insurance limits lender losses, FHA programs accept credit scores as low as 580 with 3.5% down, and sometimes as low as 500 with 10% down.",
      "The trade-off is mortgage insurance. FHA borrowers pay an upfront premium (often financed into the loan) and an ongoing annual premium that's broken into monthly installments. On most modern FHA loans the annual premium lasts the life of the loan unless you refinance.",
      "FHA is especially popular with first-time buyers, borrowers rebuilding credit after a setback, and anyone whose path to a home is constrained by down payment cash. The break-even versus a low-down-payment conventional loan depends on credit score and how long you plan to hold the loan.",
    ],
    related: ["va-loans", "usda-loans", "mortgage-insurance-premium", "conventional-loans"],
    category: "Loan Types",
  },
  {
    slug: "fixed-rate-mortgage",
    term: "Fixed-Rate Mortgage",
    shortDef:
      "A home loan whose interest rate stays the same for the entire repayment period.",
    longDef: [
      "Fixed-rate loans give you a single interest rate for the life of the loan, which means your principal-and-interest payment never changes. The most common terms are 30 years and 15 years, with 20- and 25-year options available from many lenders.",
      "Because the rate is locked, fixed loans cost more up front than the introductory rate on a comparable ARM, you're paying for certainty. Over a long holding period that certainty is usually worth it, especially in rising-rate environments.",
      "Short-term fixed loans (15- and 20-year) carry lower rates than 30-year loans because the lender's exposure is shorter. The shorter the term, the higher the monthly payment, but the dramatically lower total interest paid often makes the math compelling for buyers with payment headroom.",
    ],
    related: ["adjustable-rate-mortgage", "interest-rate", "principal", "amortization"],
    category: "Loan Types",
  },
  {
    slug: "forbearance",
    term: "Forbearance",
    shortDef:
      "A temporary pause or reduction of mortgage payments granted by the servicer when a borrower faces hardship.",
    longDef: [
      "Forbearance is not loan forgiveness. It's an agreement that you can skip or reduce payments for a defined period, usually three to twelve months, without those missed payments triggering foreclosure. Interest still accrues, and the skipped amounts have to be repaid eventually.",
      "Repayment options at the end of forbearance typically include resuming normal payments plus a catch-up plan, modifying the loan terms to roll missed payments into the back end, or paying the missed amount in a lump sum if circumstances allow.",
      "Borrowers should always work through the loan servicer rather than ignoring missed payments, proactive communication is the single biggest factor that determines what forbearance and modification options remain available.",
    ],
    related: ["modifications", "foreclosure", "servicer", "principal-reduction"],
    category: "Servicing",
  },
  {
    slug: "foreclosure",
    term: "Foreclosure",
    shortDef:
      "The legal process by which a lender takes possession of and sells a property after a borrower defaults on the mortgage.",
    longDef: [
      "Foreclosure begins when a borrower misses enough payments, generally 90 to 120 days delinquent, that the lender invokes its right to recover the collateral. The exact process varies by state, with judicial foreclosure (going through the courts) and non-judicial foreclosure (using a power-of-sale clause in the loan documents) being the two main models.",
      "A completed foreclosure stays on credit reports for seven years and makes future mortgage qualification difficult, most loan programs require a multi-year waiting period before a foreclosed borrower can buy again.",
      "Before things get to foreclosure, borrowers usually have meaningful options: forbearance, loan modification, short sale, or deed in lieu. The earlier the borrower contacts the servicer about hardship, the more options remain on the table.",
    ],
    related: ["forbearance", "modifications", "default", "servicer"],
    category: "Servicing",
  },
  {
    slug: "gift-letter",
    term: "Gift Letter",
    shortDef:
      "A signed statement from a donor confirming that funds provided toward a home purchase are a gift, not a loan.",
    longDef: [
      "When down payment or closing-cost money comes from a parent, grandparent, or other allowed donor, the lender requires documentation that it isn't a hidden loan, otherwise the gift would inflate the borrower's debt load and skew underwriting.",
      "A standard gift letter includes the donor's name and relationship, the dollar amount, the property address, and an explicit statement that no repayment is expected. Most lenders also want bank statements showing the donor had the funds available and showing the transfer into the borrower's account.",
      "Some loan programs restrict who can be a gift donor, generally limited to family, fiancées, or established relationships. Gifts from sellers, agents, or interested parties to the transaction are usually prohibited or count as something else entirely (a seller credit, for example).",
    ],
    related: ["down-payment", "cash-to-close", "underwriting", "reserves"],
    category: "Credit & Qualification",
  },
  {
    slug: "high-balance-loan",
    term: "High-Balance Loan",
    shortDef:
      "A conforming loan in a designated high-cost area that exceeds the standard conforming limit but stays within a higher local ceiling.",
    longDef: [
      "Each year FHFA publishes a baseline conforming loan limit applicable nationwide, plus higher ceilings for designated high-cost counties, places like the Bay Area, parts of New York, and select metros where median home prices are well above the national average.",
      "A loan amount above the baseline limit but at or below the local high-cost ceiling is a high-balance conforming loan. It's still eligible for Fannie Mae or Freddie Mac purchase, but typically priced slightly higher than a standard conforming loan because of marginally higher risk.",
      "If your purchase falls between the baseline and the local high-cost ceiling, a high-balance conforming product almost always beats a jumbo loan on rate and underwriting flexibility, so it's worth confirming your county's specific limit before assuming you need jumbo financing.",
    ],
    related: ["conforming-mortgage", "jumbo-loan", "conventional-loans", "fannie-mae"],
    category: "Loan Types",
  },
  {
    slug: "home-equity-line-of-credit",
    term: "Home Equity Line of Credit (HELOC)",
    shortDef:
      "A revolving credit line secured by your home's equity, with a variable rate and draw period followed by repayment.",
    longDef: [
      "A HELOC works like a credit card backed by your house. The lender approves a maximum credit limit based on your home's value and existing first mortgage, and during the draw period (typically 10 years) you can borrow, repay, and reborrow as needed.",
      "After the draw period ends, the HELOC converts to a repayment phase, usually 20 years, where you pay back what you've borrowed in monthly principal and interest installments. Rates are almost always variable, tied to the prime rate plus a margin.",
      "HELOCs are flexible but introduce variable-rate risk. They're a good fit for homeowners who want a standby reserve for opportunities or emergencies. Borrowers who plan to draw the full amount up front and hold a balance often do better with a cash-out refinance or fixed-rate home equity loan.",
    ],
    related: ["cash-out-refinance", "equity", "subordination", "interest-rate"],
    category: "Loan Types",
  },
  {
    slug: "housing-ratio",
    term: "Housing Ratio",
    shortDef:
      "The percentage of your gross monthly income consumed by total housing costs (PITI).",
    longDef: [
      "Where DTI captures all debt, the housing ratio (also called the front-end ratio) zeroes in on housing-only costs: principal, interest, property taxes, homeowner's insurance, and any HOA dues. Mortgage insurance premiums are also included when applicable.",
      "Most conventional programs prefer housing ratios under 28%, though guideline files routinely close higher when other strengths offset. Government loan programs generally accept higher front-end ratios because their insurance or guarantee de-risks the file for the lender.",
      "Housing ratio matters because it's a leading indicator of payment stress. A borrower at 35% housing ratio can technically afford the loan on paper but has very little cushion for tax reassessments, insurance hikes, or HOA special assessments.",
    ],
    related: ["debt-to-income", "piti", "underwriting", "property-tax"],
    category: "Credit & Qualification",
  },
  {
    slug: "ipac",
    term: "IPAC (Income, Property, Assets, Credit)",
    shortDef:
      "The four pillars of mortgage underwriting, every loan approval comes down to verifying these four categories.",
    longDef: [
      "Mortgage underwriters organize their review around IPAC because every loan decision rests on these four legs: can the borrower's documented income support the payment, does the property's value and condition justify the loan, are there sufficient assets to close and maintain reserves, and does the credit history show willingness to repay?",
      "A weakness in one area can sometimes be offset by strength in another, strong credit and large reserves can sometimes carry a thin income file, for example. But a serious failure in any one of the four is usually fatal to the approval.",
      "Knowing the IPAC framework helps borrowers prep efficiently: gather two years of W-2s and tax returns for income, get the home appraised cleanly for property, document every account showing required cash for assets, and avoid new credit inquiries or balances during the process for credit.",
    ],
    related: ["underwriting", "debt-to-income", "credit-score", "reserves"],
    category: "Underwriting",
  },
  {
    slug: "installment-debt",
    term: "Installment Debt",
    shortDef:
      "Debt that is repaid in fixed scheduled payments over a defined term, such as a car loan or student loan.",
    longDef: [
      "Installment debt has a beginning balance, a fixed term, and a defined monthly payment that pays off the balance by maturity. Auto loans, student loans, personal loans, and mortgages themselves are all installment debt, distinct from revolving debt like credit cards where the balance and payment fluctuate.",
      "Underwriters treat installment debt differently depending on how close it is to payoff. Most guidelines let you exclude installment payments from your DTI when there are 10 or fewer payments remaining, which makes paying down a car loan to that threshold a high-leverage move before applying.",
      "Deferred installment debts, like student loans in forbearance, still count toward DTI in most programs. The exact calculation can use the actual deferred payment, a percentage of the balance, or the income-driven amount, depending on the loan program's rules.",
    ],
    related: ["debt-to-income", "underwriting", "credit-score", "pre-approval"],
    category: "Credit & Qualification",
  },
  {
    slug: "interest-rate",
    term: "Interest Rate",
    shortDef:
      "The percentage of the loan balance the lender charges as the cost of borrowing, paid annually but accrued daily.",
    longDef: [
      "Your interest rate determines the largest line item in your mortgage payment, the principal-and-interest portion. On a 30-year loan, a half-point difference in rate can swing tens of thousands of dollars in total interest paid.",
      "Rate is influenced by your credit score, loan-to-value ratio, loan type and term, property type, occupancy, and current market conditions. Lenders publish daily rate sheets that move with the broader bond market, often shifting multiple times in a single day during volatile periods.",
      "The rate alone doesn't tell the whole cost story, that's why the APR exists. A rate quoted alongside heavy discount points isn't directly comparable to a no-point rate, so always compare rate-and-cost combinations rather than rates in isolation.",
    ],
    related: ["annual-percentage-rate", "rate-lock", "discount-points", "fixed-rate-mortgage"],
    category: "Costs & Fees",
  },
  {
    slug: "investment-home",
    term: "Investment Home",
    shortDef:
      "A property purchased not to live in but to rent out or hold for appreciation, with stricter financing terms.",
    longDef: [
      "Investment property financing exists on different terms than financing for a home you'll occupy yourself. Lenders require larger down payments (typically 15%–25%), charge higher interest rates, and demand more documented reserves because the default risk on investment loans is statistically higher.",
      "On the income side, lenders often allow a percentage of the projected rent (usually 75%) to be added to the borrower's qualifying income, which can help offset the higher payment in DTI calculations. Existing landlord experience strengthens the file.",
      "Conventional loans through Fannie Mae and Freddie Mac dominate investment property financing, FHA and VA programs are restricted to primary residences. Some borrowers use cash-out refinances on an existing primary to fund the down payment on an investment property.",
    ],
    related: ["primary-residence", "secondary-home", "down-payment", "reserves"],
    category: "Loan Types",
  },
  {
    slug: "jumbo-loan",
    term: "Jumbo Loan",
    shortDef:
      "A mortgage that exceeds the conforming loan limit and therefore cannot be sold to Fannie Mae or Freddie Mac.",
    longDef: [
      "Jumbo loans pick up where conforming and high-balance conforming leave off. They're held on lender balance sheets or sold to private investors and securitizers, so each lender sets its own jumbo guidelines within broad market norms.",
      "Underwriting on jumbos is typically stricter, higher credit-score thresholds (often 700 or above), lower maximum DTI, and bigger reserves measured in months of full PITI payments. Down payment requirements range from 10% to 25%+ depending on loan amount and borrower profile.",
      "Jumbo pricing varies more between lenders than conforming pricing because there's no single secondary-market benchmark. Shopping multiple jumbo lenders frequently turns up rate differences large enough to justify the time spent.",
    ],
    related: ["conforming-mortgage", "high-balance-loan", "non-qualified-mortgage", "reserves"],
    category: "Loan Types",
  },
  {
    slug: "loan-to-value",
    term: "Loan-to-Value (LTV)",
    shortDef:
      "The loan amount expressed as a percentage of the property's appraised value or purchase price (whichever is lower).",
    longDef: [
      "LTV is one of the most important numbers in mortgage underwriting. A purchase at $400,000 with a $320,000 loan is 80% LTV; the same purchase with $360,000 borrowed is 90% LTV. Higher LTV means less borrower skin in the game and more lender risk.",
      "LTV drives pricing, most rate sheets break down pricing by LTV bands (60%, 70%, 75%, 80%, 85%, 90%, 95%). It also controls mortgage insurance: conventional loans above 80% LTV require PMI; FHA has its own MIP regardless of LTV; VA and USDA have no traditional PMI but charge their own funding fees.",
      "On refinances, LTV is calculated against the appraised value of the home, not the original purchase price. That makes appreciation a powerful tool for borrowers, a home that's grown in value over time can fund a refinance without bringing cash to lower the LTV.",
    ],
    related: ["appraisal", "private-mortgage-insurance", "equity", "down-payment"],
    category: "Underwriting",
  },
  {
    slug: "land-contract",
    term: "Land Contract",
    shortDef:
      "A seller-financed purchase agreement where the buyer makes payments to the seller and receives title only after final payment.",
    longDef: [
      "Land contracts are an alternative to bank financing in which the seller acts as the lender. The buyer takes possession and makes installment payments to the seller, but legal title doesn't transfer until the agreed-on terms are satisfied, sometimes a final balloon payment after several years.",
      "Land contracts can give a path to homeownership for buyers who can't qualify for conventional financing. The trade-offs are real: typically higher interest rates, less consumer protection than a traditional mortgage, and the risk of losing the home and accumulated equity if the buyer misses payments before title transfer.",
      "Many borrowers use a land contract as a bridge, planning to refinance into a conventional mortgage once they've built credit, equity, or documented income. A clear refinance plan and exit timeline at the outset is essential.",
    ],
    related: ["purchase-agreement", "refinance", "credit-score", "subordination"],
    category: "Process & Closing",
  },
  {
    slug: "lender-credits",
    term: "Lender Credits",
    shortDef:
      "Money the lender contributes toward your closing costs in exchange for accepting a slightly higher interest rate.",
    longDef: [
      "Lender credits invert the discount-point math: instead of paying points up front to lower your rate, you take a higher rate and the lender hands you cash to apply against closing costs. The credit reduces what you bring to the closing table.",
      "Lender credits make sense when you're short on cash to close or expect to refinance or move within a few years, there's no point paying down a rate you won't keep. The trade-off is a higher payment for the life of the loan compared to a no-credit alternative.",
      "Most rate sheets show pricing in 0.125% rate increments with the corresponding credit or cost. A good loan officer will sketch out the breakeven math, how many months of higher payment until the cost outweighs the credit, so you can decide based on your actual holding-period assumption.",
    ],
    related: ["discount-points", "annual-percentage-rate", "closing-costs", "interest-rate"],
    category: "Costs & Fees",
  },
  {
    slug: "lien",
    term: "Lien",
    shortDef:
      "A legal claim against property that secures a debt and must be paid off before clear title can transfer.",
    longDef: [
      "When you take out a mortgage, the lender records a lien against your property at the county. That lien gives the lender the right to force a sale if you don't pay, and it stays on the title until the loan is paid off and the lien is formally released.",
      "Liens come in priority order. The first mortgage usually holds first lien position. Second mortgages and HELOCs sit in subordinate position behind it. Tax liens generally jump in front of all of them, unpaid property taxes can become a senior claim ahead of even the first mortgage.",
      "Title insurance exists in part to protect against undiscovered liens. A title search examines public records to surface every recorded claim against a property, and the title policy stands behind the search if something later emerges that should have been caught.",
    ],
    related: ["title-insurance", "subordination", "collateral", "foreclosure"],
    category: "Process & Closing",
  },
  {
    slug: "loan-commitment",
    term: "Loan Commitment",
    shortDef:
      "A formal written agreement from the lender promising to fund a loan, subject to specific conditions.",
    longDef: [
      "A loan commitment goes a step beyond pre-approval. It's issued after the lender has underwritten the file, reviewed income, assets, credit, and property, and confirmed the loan will fund as long as a list of remaining conditions is satisfied.",
      "Commitments come with two kinds of conditions: prior-to-docs (must be cleared before closing documents are prepared) and prior-to-funding (must be cleared before money disburses). Most are routine: a final pay stub, a clear title commitment, evidence of insurance.",
      "Sellers in competitive markets often prefer offers backed by an underwritten loan commitment rather than a basic pre-approval letter because the commitment signals materially less risk of the buyer's financing falling through.",
    ],
    related: ["pre-approval", "underwriting", "loan-estimate", "closing-disclosure"],
    category: "Underwriting",
  },
  {
    slug: "loan-estimate",
    term: "Loan Estimate",
    shortDef:
      "The standardized three-page disclosure a lender must provide within three business days of a complete loan application.",
    longDef: [
      "The Loan Estimate (LE) is your earliest detailed look at what a loan will cost. Federally mandated and standardized across all lenders, it lays out the loan amount, rate, monthly payment, projected costs to close, and breakdown of fees in the same format every time, so you can compare lenders apples to apples.",
      "Because the format is identical across lenders, the most useful comparison is the bottom-line cash to close and the total interest over the loan's life. Watch for differences in title fees, origination charges, and discount points, these are where lenders can differ significantly.",
      "The LE is followed by the Closing Disclosure at the end of the process. By rule, costs can move only within tolerance limits between the two documents, and certain costs can't move at all unless circumstances genuinely change.",
    ],
    related: ["closing-disclosure", "annual-percentage-rate", "closing-costs", "discount-points"],
    category: "Process & Closing",
  },
  {
    slug: "loan-originator",
    term: "Loan Originator",
    shortDef:
      "The licensed individual who takes a borrower's loan application and represents them through the mortgage process.",
    longDef: [
      "The loan originator (also called a loan officer or LO) is your primary point of contact. They take your application, structure the loan, deliver your Loan Estimate, work with the processor and underwriter to clear conditions, and guide you to the closing table.",
      "Federal law requires loan originators to be registered or licensed through the Nationwide Multistate Licensing System (NMLS). Their NMLS number must appear on rate quotes, advertisements, and loan documents, and you can look up their license history on the public NMLS Consumer Access site.",
      "A good loan originator is part advisor, part project manager, part advocate. They explain trade-offs honestly, escalate problems before they become emergencies, and translate underwriter-speak into actions you can take.",
    ],
    related: ["mortgage-broker", "loan-processor", "underwriting", "retail-lender"],
    category: "Parties & Roles",
  },
  {
    slug: "loan-processor",
    term: "Loan Processor",
    shortDef:
      "The team member who assembles, verifies, and organizes the documents in a loan file before submission to underwriting.",
    longDef: [
      "Processors are the air traffic controllers of a mortgage file. They request documents, verify employment and assets, order title work, schedule the appraisal, and assemble everything into the package an underwriter reviews. A strong processor can save weeks of back-and-forth.",
      "While the loan originator is your main relationship, the processor is often who you'll hear from when documents are requested. Responding to processor requests within 24 hours dramatically shortens the overall timeline.",
      "Processing happens in three rough phases: setup (everything gathered for first submission), conditional approval (gathering follow-up items the underwriter requests), and clear-to-close (final verifications before docs are drawn). Knowing where you are in the process helps set realistic timing expectations.",
    ],
    related: ["loan-originator", "underwriting", "loan-commitment", "closing"],
    category: "Parties & Roles",
  },
  {
    slug: "market-value",
    term: "Market Value",
    shortDef:
      "The most probable price a property would bring in an arm's-length sale between a willing buyer and willing seller.",
    longDef: [
      "Market value is what an appraiser is ultimately trying to determine. It assumes neither party is under duress, both have reasonable knowledge of the market, and a reasonable marketing period has been allowed. It's not necessarily the same as the listing price, the contract price, or the assessed value for tax purposes.",
      "Market value moves with conditions. Interest rates, inventory levels, school district ratings, neighborhood comparable activity, and broader economic factors all influence what a home would bring in a given month. Two appraisals six months apart on the same property can legitimately differ if the market has shifted.",
      "Property tax assessed value is governed by state and local rules and rarely matches market value precisely, sometimes it lags, sometimes it overshoots. A property's assessed value tells you about the tax bill, not what someone would pay to buy.",
    ],
    related: ["appraisal", "comparable-sales", "property-tax", "loan-to-value"],
    category: "Property & Appraisal",
  },
  {
    slug: "modifications",
    term: "Loan Modifications",
    shortDef:
      "A permanent change to the terms of an existing mortgage to help a borrower facing long-term hardship stay in the home.",
    longDef: [
      "A modification rewrites parts of the original loan: the interest rate, the term, the principal balance, or some combination. Unlike forbearance, which is a temporary pause, a modification changes the loan permanently and is reserved for borrowers whose hardship is expected to persist.",
      "Most modifications go through the existing servicer, who has discretion within program guidelines set by the investor that owns the loan (Fannie Mae, Freddie Mac, FHA, or a private investor). The process involves documenting hardship, current income, and a proposed plan that brings the payment down to a sustainable level.",
      "Modifications avoid the credit damage of foreclosure but typically show on credit reports as a modified obligation, which can affect future credit decisions. Compared to losing the home, that's an acceptable trade-off, but borrowers should weigh modification against alternatives like selling and renting if they can.",
    ],
    related: ["forbearance", "foreclosure", "servicer", "principal-reduction"],
    category: "Servicing",
  },
  {
    slug: "mortgage-broker",
    term: "Mortgage Broker",
    shortDef:
      "A licensed professional who shops a borrower's loan application across multiple wholesale lenders rather than originating directly.",
    longDef: [
      "Mortgage brokers don't lend their own money. They submit your application to one of several wholesale lender partners and the lender that approves on the best terms funds the loan. Brokers earn compensation either from the lender or the borrower, disclosed up front.",
      "The broker model can produce real savings when one wholesale lender has a meaningfully better product or price for your specific scenario, a niche jumbo, an unusual property type, or a tight credit profile. The trade-off is one layer of separation from the actual lender's underwriting team.",
      "All loan originators, whether at a broker, a retail lender, or a credit union, must be NMLS-licensed. The structural difference is whether they're lending directly or matching you to a wholesale partner that lends.",
    ],
    related: ["loan-originator", "retail-lender", "wholesale", "loan-estimate"],
    category: "Parties & Roles",
  },
  {
    slug: "mortgage-insurance-premium",
    term: "Mortgage Insurance Premium (MIP)",
    shortDef:
      "The insurance premium paid on FHA loans, structured as both an upfront charge and an ongoing annual premium.",
    longDef: [
      "MIP is the FHA-specific equivalent of mortgage insurance. Every FHA borrower pays an upfront mortgage insurance premium (UFMIP), typically 1.75% of the loan amount, which can be financed into the loan rather than paid in cash at closing.",
      "There's also an annual MIP charged monthly with your payment. The rate depends on loan term, LTV, and loan amount. On most modern 30-year FHA loans with less than 10% down, annual MIP lasts the life of the loan and can only be removed by refinancing out of FHA into a conventional loan once equity supports it.",
      "Compared to conventional PMI, FHA MIP doesn't credit-tier, it's the same rate regardless of credit score. That makes FHA structurally attractive for lower-score borrowers and structurally worse for higher-score borrowers who would get cheaper conventional pricing.",
    ],
    related: ["private-mortgage-insurance", "fha-loan", "refinance", "loan-to-value"],
    category: "Costs & Fees",
  },
  {
    slug: "mortgage-note",
    term: "Mortgage Note",
    shortDef:
      "The borrower's signed promise to repay the loan, including the amount, rate, term, and payment terms.",
    longDef: [
      "The note is the actual loan agreement, a legally binding IOU. It states the principal balance, interest rate (or how it adjusts on an ARM), term, payment amount, where to send payments, and the consequences of default.",
      "The mortgage (or deed of trust, depending on state) is a separate document that grants the lender the lien against the property to secure the note. The note creates the obligation; the mortgage attaches the obligation to the collateral.",
      "Notes are bought and sold in the secondary market all the time. Most originating lenders sell loans to investors shortly after closing, which is why borrowers often receive notice that their servicer is changing within the first few months, the loan didn't change, but the holder did.",
    ],
    related: ["collateral", "lien", "servicer", "promissory-note"],
    category: "Process & Closing",
  },
  {
    slug: "mortgage-recast",
    term: "Mortgage Recast",
    shortDef:
      "A lump-sum prepayment toward principal followed by a recalculation of the monthly payment based on the new balance.",
    longDef: [
      "A recast is a lighter-weight cousin of refinancing. Instead of replacing the loan, the servicer simply re-amortizes the remaining balance after you make a substantial principal payment, keeping the original rate and term but with a lower monthly payment going forward.",
      "Recasts work because most conventional loans permit one or two during the life of the loan, usually for a small fee. They make sense if you come into a windfall, an inheritance, a bonus, or proceeds from selling a previous home after a contingent purchase, and want to lower payments without refinancing into a potentially higher rate.",
      "Government loans (FHA, VA, USDA) generally don't permit recasts in the same way. Always check with your servicer for the exact program rules, the minimum lump-sum required, and the recast fee before sending money.",
    ],
    related: ["refinance", "principal-reduction", "amortization", "servicer"],
    category: "Servicing",
  },
  {
    slug: "non-qualified-mortgage",
    term: "Non-Qualified Mortgage (Non-QM)",
    shortDef:
      "A mortgage that doesn't meet the Qualified Mortgage standards set by federal regulation, often used for self-employed borrowers or non-standard income.",
    longDef: [
      "After the 2008 housing crisis, regulators created the Qualified Mortgage (QM) standard, a set of underwriting rules loans must meet to receive certain legal protections for lenders. Loans that step outside those rules are non-QM, but that doesn't make them subprime, many are responsibly underwritten using alternative documentation.",
      "The most common non-QM use case is self-employed borrowers whose tax returns understate cash flow because of business expenses, depreciation, or pass-through structures. Bank-statement programs, asset-depletion programs, and investor cash-flow loans all live under the non-QM umbrella.",
      "Non-QM loans typically carry higher rates than QM equivalents because they don't fit into standard secondary-market buckets. For self-employed borrowers and investors with complex profiles, that premium is often a worthwhile trade for getting a deal done at all.",
    ],
    related: ["jumbo-loan", "underwriting", "conventional-loans", "investment-home"],
    category: "Loan Types",
  },
  {
    slug: "origination-fee",
    term: "Origination Fee",
    shortDef:
      "The lender's charge for processing the loan application and underwriting the file, expressed as a percentage of the loan amount or a flat dollar amount.",
    longDef: [
      "Origination fees compensate the lender for the work of creating the loan, taking the application, ordering verifications, underwriting, drawing documents, and funding. They typically range from 0.5% to 1% of the loan amount, sometimes higher on smaller loans where percentage-based fees underprice the real cost of work.",
      "The origination fee is one of the most important costs to compare between Loan Estimates. Two lenders may quote identical rates but very different origination fees, and the difference flows straight through to your cash to close.",
      "Some lenders structure pricing with low or zero origination fees but offset that by charging more in other fee categories, administration, processing, underwriting fees, or by quoting slightly higher rates. The total of all lender charges is what matters, not the line item labeled origination.",
    ],
    related: ["loan-estimate", "annual-percentage-rate", "closing-costs", "discount-points"],
    category: "Costs & Fees",
  },
  {
    slug: "planned-unit-development",
    term: "Planned Unit Development (PUD)",
    shortDef:
      "A residential development with individually owned homes plus shared common areas managed by a homeowners association.",
    longDef: [
      "PUDs blend single-family ownership with shared community features, a private street network, a clubhouse, a pool, common landscaping. Each homeowner owns their lot and house outright, but the shared elements are managed and maintained by an HOA that the homeowner is required to belong to.",
      "From a mortgage standpoint, PUDs underwrite mostly like standard single-family homes, but the lender will review the HOA's financial health, adequate reserves, manageable delinquency rates, no pending litigation, as part of the appraisal process.",
      "PUDs differ from condos in that you own the land beneath your unit and your dwelling structure. In a condo, you own the interior airspace and a percentage interest in the common elements. The financing rules for the two property types diverge in meaningful ways.",
    ],
    related: ["hoa-dues", "appraisal", "investment-home", "primary-residence"],
    category: "Property & Appraisal",
  },
  {
    slug: "discount-points",
    term: "Discount Points",
    shortDef:
      "Prepaid interest paid at closing to permanently lower the loan's interest rate.",
    longDef: [
      "One discount point equals 1% of the loan amount. On a $400,000 loan, one point costs $4,000 at closing and typically reduces the rate by somewhere between 0.125% and 0.375% depending on the lender's pricing grid and current market conditions.",
      "Paying points is a present-value bet: you pay cash today to save monthly payments tomorrow. The break-even is the number of months until the lower payment recovers the upfront cost. If you'll keep the loan well past that point, points pay off; if you might sell or refinance sooner, they probably don't.",
      "Borrowers with strong long-term holding plans and tight cash flow often benefit most from buying down the rate. Borrowers who expect to move or refinance generally do better directing that cash toward closing costs or the down payment.",
    ],
    related: ["interest-rate", "annual-percentage-rate", "lender-credits", "rate-lock"],
    category: "Costs & Fees",
  },
  {
    slug: "pre-approval",
    term: "Pre-Approval",
    shortDef:
      "A lender's preliminary commitment to lend you a specified amount, based on a review of credit, income, and assets.",
    longDef: [
      "A pre-approval is stronger than a pre-qualification. It involves a credit pull, documented income (pay stubs, W-2s, sometimes tax returns), and documented assets (bank statements). The lender issues a pre-approval letter stating the loan amount, program, and any conditions outstanding.",
      "Sellers and listing agents take pre-approvals seriously, they signal a serious buyer whose financing is unlikely to fall through. Many sellers in competitive markets will only entertain offers backed by a pre-approval letter, and stronger pre-approvals (especially fully underwritten ones) often win competing bids.",
      "A pre-approval letter is typically valid for 60–90 days. Major financial changes during that window, quitting a job, opening new credit, taking on additional debt, can invalidate the pre-approval, so it's smart to coast on autopilot until closing.",
    ],
    related: ["pre-qualification", "loan-commitment", "credit-check", "loan-estimate"],
    category: "Credit & Qualification",
  },
  {
    slug: "pre-qualification",
    term: "Pre-Qualification",
    shortDef:
      "An informal estimate of how much a lender might let you borrow, based on self-reported information without document verification.",
    longDef: [
      "Pre-qualification is a fast first look. You share basic information, estimated income, debts, credit score, and the lender gives you a ballpark range. No credit pull, no document review, no underwriter involvement.",
      "Pre-quals are useful for early budgeting and casual house-hunting, but they carry minimal weight with sellers because there's been no real verification. Most experienced agents and sellers will ask buyers to upgrade to a pre-approval before submitting a serious offer.",
      "If you're just starting to think about buying, a pre-qualification is a low-friction way to learn the rough range you might afford. Once you're actively shopping, move to a pre-approval, it's a more accurate number and a more credible signal.",
    ],
    related: ["pre-approval", "loan-estimate", "debt-to-income", "credit-score"],
    category: "Credit & Qualification",
  },
  {
    slug: "pre-payment-penalty",
    term: "Pre-Payment Penalty",
    shortDef:
      "A fee charged for paying off all or part of a loan before a defined period elapses.",
    longDef: [
      "Pre-payment penalties were once common in residential lending but are now largely banned on most loan types subject to federal Qualified Mortgage rules. Some non-QM loans, business-purpose investor loans, and select commercial mortgages still include them.",
      "When they apply, pre-payment penalties typically run for the first three to five years of the loan and are calculated either as a percentage of the prepaid amount or a sliding fee that declines over time. The exact structure must be disclosed in the loan documents.",
      "If you're working with a loan that has a pre-payment penalty, factor it into any refinance or sale planning. Holding the loan a few extra months until the penalty expires can save real money, and the math is usually straightforward once you have the schedule.",
    ],
    related: ["non-qualified-mortgage", "refinance", "loan-estimate", "investment-home"],
    category: "Costs & Fees",
  },
  {
    slug: "prepaids",
    term: "Prepaids",
    shortDef:
      "Items paid at closing for costs that will be due in the future, such as property taxes and homeowner's insurance.",
    longDef: [
      "Prepaids are a category on the Closing Disclosure separate from closing costs. They include the first year of homeowner's insurance, daily interest from closing through the end of the month, and an initial deposit into the escrow account for taxes and insurance.",
      "Prepaids are not lender fees, they're future expenses being collected up front. You'd pay them either way; closing simply consolidates them into a single transaction.",
      "Because they're not lender charges, prepaids aren't subject to the same cost-tolerance limits between the Loan Estimate and Closing Disclosure. They can adjust as the closing date moves or as accurate amounts come in from the insurance carrier and taxing authority.",
    ],
    related: ["closing-costs", "escrow-account", "property-tax", "homeowners-insurance"],
    category: "Costs & Fees",
  },
  {
    slug: "primary-residence",
    term: "Primary Residence",
    shortDef:
      "The home a borrower lives in as their main place of residence, qualifying for the most favorable loan terms.",
    longDef: [
      "Primary-residence financing gets the best rates, the lowest down-payment requirements, and access to government programs like FHA, VA, and USDA. The trade-off is the borrower must intend to occupy the property within 60 days of closing and continue to live there for the foreseeable future.",
      "Occupancy is a sworn statement made on the loan application and underlying loan documents. Misrepresenting it, for example, financing a second home or investment property as a primary, constitutes occupancy fraud, a serious legal issue that lenders investigate when red flags appear.",
      "Life happens, and people sometimes need to move from a primary into a rental status earlier than expected. That's fine and legal as long as the original intent was honest. Documenting the change of circumstances is wise if it happens close to closing.",
    ],
    related: ["secondary-home", "investment-home", "fha-loan", "va-loans"],
    category: "Property & Appraisal",
  },
  {
    slug: "principal",
    term: "Principal",
    shortDef:
      "The portion of your mortgage payment that goes toward reducing the loan balance, separate from interest.",
    longDef: [
      "Every monthly mortgage payment on a standard amortizing loan splits between principal and interest. In the early years of a 30-year loan, the split is dramatically tilted toward interest, most of the payment is rent on the borrowed money, with only a sliver going to balance reduction.",
      "The split shifts gradually over time. By the back half of the loan, more of each payment goes to principal than interest. This is why prepaying small amounts in the early years has an outsized effect, every dollar of early principal payment removes years of compounding interest from the loan's life.",
      "Your monthly statement breaks down each payment into the principal and interest components. Watching the principal portion grow month over month is one of the more concrete signals of progress in long-term financial planning.",
    ],
    related: ["amortization", "interest-rate", "principal-reduction", "piti"],
    category: "Process & Closing",
  },
  {
    slug: "piti",
    term: "Principal, Interest, Taxes, and Insurance (PITI)",
    shortDef:
      "The four components that make up a typical fully-escrowed monthly mortgage payment.",
    longDef: [
      "PITI is the standard way lenders summarize the total monthly cost of homeownership for underwriting and budgeting purposes. Principal and interest are the loan-payment portions; taxes and insurance are the escrowed portions that the lender pays on your behalf when due.",
      "When mortgage insurance or HOA dues apply, lenders sometimes refer to PITIA, adding the A for association dues, or include MI as a separate line. The point is the same: capture every recurring housing cost that the underwriter measures against income.",
      "A common rookie mistake is comparing the rate-and-payment quote a lender gives (often just P&I) against the all-in number on the Closing Disclosure (full PITI). Always compare apples to apples, especially when budgeting.",
    ],
    related: ["principal", "interest-rate", "property-tax", "homeowners-insurance"],
    category: "Process & Closing",
  },
  {
    slug: "principal-reduction",
    term: "Principal Reduction",
    shortDef:
      "Any payment made toward the loan balance beyond the scheduled monthly principal amount.",
    longDef: [
      "A principal-reduction payment goes straight to lowering the loan balance, not to next month's payment. On a standard amortizing mortgage with no prepayment penalty, every extra dollar applied to principal saves you the full compounding interest that dollar would have generated over the remaining life of the loan.",
      "There are several patterns: a single lump sum (after a bonus or tax refund), a small recurring extra each month (one-thirteenth of a payment shaves years off a 30-year loan), or biweekly payment schedules that effectively add one extra monthly payment per year.",
      "Always confirm with your servicer that extra payments are being applied to principal rather than to future scheduled payments. Most online portals have a clearly labeled principal-only payment option; check the statement the following month to verify.",
    ],
    related: ["principal", "amortization", "mortgage-recast", "refinance"],
    category: "Servicing",
  },
  {
    slug: "private-mortgage-insurance",
    term: "Private Mortgage Insurance (PMI)",
    shortDef:
      "An insurance policy that protects the lender if a borrower defaults on a conventional loan with less than 20% down.",
    longDef: [
      "Conventional loans above 80% LTV require PMI. The premium is determined by credit score, LTV, and loan term, and is typically rolled into the monthly payment as a separate line. Stronger credit dramatically lowers PMI cost, sometimes by hundreds of dollars per month versus a weaker file.",
      "Unlike FHA MIP, conventional PMI can be canceled. By federal law, lenders must auto-cancel PMI when the loan reaches 78% LTV based on the original amortization schedule. Borrowers can request earlier removal once they cross 80% LTV based on current value, supported by an appraisal or broker price opinion.",
      "Some conventional programs offer lender-paid mortgage insurance (LPMI) where the lender absorbs the PMI cost in exchange for a slightly higher rate. LPMI sticks for the life of the loan, so it's most attractive when you're confident you won't refinance or sell in the medium term.",
    ],
    related: ["mortgage-insurance-premium", "loan-to-value", "conventional-loans", "refinance"],
    category: "Costs & Fees",
  },
  {
    slug: "property-inspection-waiver",
    term: "Property Inspection Waiver (PIW)",
    shortDef:
      "An offer from Fannie Mae or Freddie Mac to skip the traditional appraisal in favor of an automated valuation.",
    longDef: [
      "Modern automated underwriting systems use historical data, county records, and prior appraisals to estimate value with confidence on certain transactions. When the data is strong and the deal fits eligible criteria, the system can issue a PIW (also called an appraisal waiver) and skip the full appraisal entirely.",
      "PIWs save time and money. Without a traditional appraisal, you skip the $500–$800 appraisal fee and avoid the week or two that scheduling, inspecting, and reporting can add to the timeline.",
      "Not every transaction qualifies. PIWs are more common on rate-and-term refinances with strong equity, on conventional loans with conservative LTVs, and on properties with recent prior appraisals on file. High-balance loans, jumbo loans, and FHA/VA loans generally aren't eligible.",
    ],
    related: ["appraisal", "fannie-mae", "freddie-mac", "refinance"],
    category: "Underwriting",
  },
  {
    slug: "purchase-agreement",
    term: "Purchase Agreement",
    shortDef:
      "The signed contract between buyer and seller that defines the terms of a real estate sale.",
    longDef: [
      "The purchase agreement (also called a purchase contract or sales contract) is the foundational legal document of any home sale. It specifies the price, the closing date, what's included in the sale, the earnest money amount, and the contingencies that protect each party.",
      "Common contingencies include financing (the buyer's offer is contingent on getting their mortgage approved), inspection (subject to a satisfactory home inspection), appraisal (the home must appraise for at least the contract price), and sometimes the sale of the buyer's current home.",
      "Every term in a purchase agreement matters and is negotiable. Lenders will need a fully executed copy with all signatures and any addenda to underwrite the loan. Buyers should read the contract carefully and have questions answered before signing.",
    ],
    related: ["earnest-money-deposit", "buyers-agent", "sellers-agent", "appraisal"],
    category: "Process & Closing",
  },
  {
    slug: "rate-lock",
    term: "Rate Lock",
    shortDef:
      "A lender's commitment to honor a specified interest rate for a defined period, regardless of market movement.",
    longDef: [
      "Once your loan is in process, you can lock the rate to insulate yourself from market volatility. Common lock periods are 30, 45, or 60 days; longer locks are available for purchases with extended closing timelines but typically cost more in points or rate adjustment.",
      "If rates move against you during your lock window, you're protected. If rates drop substantially, most lenders offer a one-time float-down option for a fee, letting you capture some of the improvement without restarting the underwriting clock.",
      "Letting a lock expire is expensive, you'd be re-pricing at current market levels, which may be higher. If closing is going to delay past the lock expiration, ask about a lock extension early; extension fees are usually cheaper than re-locking at worse market levels.",
    ],
    related: ["interest-rate", "discount-points", "loan-estimate", "closing-disclosure"],
    category: "Costs & Fees",
  },
  {
    slug: "real-estate-agent",
    term: "Real Estate Agent",
    shortDef:
      "A licensed professional who helps clients buy, sell, or rent residential real estate.",
    longDef: [
      "Real estate agents are licensed at the state level and typically work under the supervision of a managing broker. They represent either buyers (buyer's agents) or sellers (listing agents, also called seller's agents), though dual agency is permitted in some states with full disclosure.",
      "Agents earn commission on closed transactions, traditionally a percentage of the sale price split between buyer's side and listing side. Industry settlement changes in 2024 have moved more commission negotiation onto explicit written agreements between buyers and their agents.",
      "Good agents bring market knowledge, negotiation experience, and a vetted network of inspectors, lenders, and attorneys. Ask for references, check recent transaction volume in your specific neighborhood, and interview at least two or three before committing to representation.",
    ],
    related: ["buyers-agent", "sellers-agent", "purchase-agreement", "comparable-sales"],
    category: "Parties & Roles",
  },
  {
    slug: "refinance",
    term: "Refinance",
    shortDef:
      "Replacing an existing mortgage with a new one, typically to lower the rate, change the term, or extract equity.",
    longDef: [
      "Refinancing pays off your existing mortgage with a new loan on the same property. The new loan may have a lower rate, a different term, a different product type (fixed to ARM or vice versa), or, in the case of a cash-out refinance, a larger balance with proceeds returned to you.",
      "Refinances run through largely the same underwriting process as purchases: application, credit pull, documented income and assets, an appraisal (or a PIW if eligible), title work, and closing. Most close in 25–40 days, though current market volume affects timelines.",
      "The classic question is whether refinancing makes sense. The shortcut answer is to compare the monthly savings against total closing costs and calculate the break-even months. If you'll keep the loan past break-even, the refi pays off; if not, the costs eat the savings.",
    ],
    related: ["cash-out-refinance", "interest-rate", "closing-costs", "rate-lock"],
    category: "Refinance",
  },
  {
    slug: "reserves",
    term: "Reserves",
    shortDef:
      "Liquid funds the borrower must have available after closing, measured in months of full PITI payment.",
    longDef: [
      "Reserves are a safety cushion the lender wants to see, proof that if income hiccuped, the borrower could still make payments while they recovered. Reserve requirements vary by program, property type, occupancy, and loan size.",
      "Primary-residence purchases on a conforming loan often require zero or two months of reserves. Second homes typically require two to six months. Investment properties commonly require six months or more, and jumbo loans frequently require 12 months or more, sometimes specifically against the new mortgage plus other documented obligations.",
      "Acceptable reserves are typically liquid: checking and savings, money market accounts, marketable securities (sometimes counted at a haircut), and certain retirement accounts (counted at a discount and only if accessible). Real estate equity in other properties generally does not count toward reserves.",
    ],
    related: ["underwriting", "debt-to-income", "investment-home", "jumbo-loan"],
    category: "Underwriting",
  },
  {
    slug: "retail-lender",
    term: "Retail Lender",
    shortDef:
      "A lender that originates loans directly to borrowers through its own loan officers, branches, and call centers.",
    longDef: [
      "Retail lenders take applications, underwrite, fund, and often service their own loans. Big banks, credit unions, and direct mortgage lenders all operate retail channels. The borrower works with a loan originator employed by the lending institution directly.",
      "Retail tends to offer the most integrated experience, one team, one set of systems, end-to-end. The trade-off is that you're constrained to that lender's product menu and pricing on any given day.",
      "Compared to mortgage brokers (who shop wholesale lenders) and correspondent lenders (who originate using their own money but then sell to investors), retail is the simplest path. Many borrowers benefit from getting quotes from both channels to see which has the better fit for their scenario.",
    ],
    related: ["mortgage-broker", "loan-originator", "wholesale", "loan-estimate"],
    category: "Parties & Roles",
  },
  {
    slug: "secondary-home",
    term: "Secondary Home",
    shortDef:
      "A property the borrower will occupy part-time, such as a vacation home, financed at terms between primary and investment.",
    longDef: [
      "Secondary-home financing exists in a middle tier between primary residences and investment properties. The borrower must intend to occupy the home themselves for at least a portion of the year, the property must be suitable for year-round occupancy in most cases, and rental restrictions often apply.",
      "Down payment requirements typically run 10%–25%, rates sit slightly above primary-residence rates, and reserve requirements are higher than primary. Lenders verify that the location is a reasonable distance from the primary, buying a vacation home five miles from your primary raises red flags.",
      "Many borrowers eventually convert a second home into either a primary (downsize move) or a rental (after a primary upgrade). Either transition is fine, but a near-term plan to rent the property out should generally be financed as an investment property from day one.",
    ],
    related: ["primary-residence", "investment-home", "reserves", "down-payment"],
    category: "Property & Appraisal",
  },
  {
    slug: "sellers-agent",
    term: "Seller's Agent",
    shortDef:
      "A licensed real estate agent who represents the homeowner selling a property, also called a listing agent.",
    longDef: [
      "Seller's agents help homeowners price the property, prepare it for market, list it on the multiple listing service, host showings, negotiate offers, and shepherd the contract through to closing. They have a fiduciary duty to the seller's interests, similar to a buyer's agent's duty to the buyer.",
      "Listing agreements typically run 90–180 days and define the commission rate, marketing scope, and what happens if the seller terminates early. Sellers should interview several agents, compare proposed marketing plans, and look at recent listing-to-sale price ratios in their neighborhood.",
      "Buyers should remember that the seller's agent is not their advocate, anything shared with them goes back to the seller. Buyers benefit from having their own representation rather than relying on the listing agent to fairly represent both sides.",
    ],
    related: ["buyers-agent", "real-estate-agent", "purchase-agreement", "comparable-sales"],
    category: "Parties & Roles",
  },
  {
    slug: "sellers-credits",
    term: "Seller's Credits",
    shortDef:
      "Money the seller contributes toward the buyer's closing costs or prepaids as part of the negotiated sale.",
    longDef: [
      "In some transactions, the buyer negotiates a seller credit at the closing table, the seller effectively reduces their net proceeds by an agreed amount and that amount applies against the buyer's closing costs. This can help a buyer who's short on cash to close without changing the purchase price the seller advertised.",
      "Seller credits are capped by program. Conventional loans on a primary residence with at least 10% down typically allow up to 6% in seller credits. FHA caps at 6%, VA at 4%, USDA at 6%. The cap is calculated against either the purchase price or appraised value, whichever is lower.",
      "Credits can only apply against actual costs, you can't pocket the difference. If the credit exceeds what's owed, the excess is forfeited or used to lower the loan balance, depending on the lender and program.",
    ],
    related: ["closing-costs", "cash-to-close", "purchase-agreement", "lender-credits"],
    category: "Costs & Fees",
  },
  {
    slug: "servicer",
    term: "Servicer",
    shortDef:
      "The company that collects monthly payments, manages the escrow account, and handles borrower service on a loan after closing.",
    longDef: [
      "The originating lender often sells loans shortly after closing, but the loan can be sold and the servicer can change independently. Your servicer is wherever you send your payment, it may or may not be the same company that originated your loan.",
      "Servicers handle escrow analyses, send year-end tax documents, process payoff requests, and field calls about payment changes, escrow shortages, or hardship. Federal regulations control how servicers must handle these interactions, with detailed rules around timely application of payments and required notices.",
      "When your loan is sold, you'll receive notice in advance from both the old and new servicer. You generally have a 60-day grace period after a servicer change to make payments to the old servicer without penalty if you miss the notice.",
    ],
    related: ["forbearance", "modifications", "escrow-account", "principal-reduction"],
    category: "Servicing",
  },
  {
    slug: "settlement-fees",
    term: "Settlement Fees",
    shortDef:
      "The fees paid to the title company or attorney handling the closing, including title services and recording.",
    longDef: [
      "Settlement fees are a subset of closing costs that go to the closing agent rather than the lender. They cover services like preparing the closing documents, conducting the closing meeting, performing the title search, issuing title insurance, recording the deed and mortgage with the county, and providing notary services.",
      "Title-related fees often vary considerably between providers for the same coverage. In most states the buyer can choose their own title company even if the seller or agent suggests one, shopping these fees can save several hundred dollars.",
      "Recording and transfer taxes are set by state and county and aren't negotiable. They typically show up as their own line items on the Closing Disclosure under government recording charges or transfer taxes.",
    ],
    related: ["closing-costs", "title-insurance", "closing-disclosure", "lien"],
    category: "Costs & Fees",
  },
  {
    slug: "subordination",
    term: "Subordination",
    shortDef:
      "The act of placing or moving a lien into a lower priority position relative to other liens on the same property.",
    longDef: [
      "When you refinance a first mortgage on a home that also has a HELOC or second mortgage, the existing junior lien needs to be subordinated, formally agreed to stay in second position behind the new first mortgage being placed. Without subordination, the junior lender's claim would technically jump to first position when the original first is paid off, which isn't what either side wants.",
      "Subordination agreements are typically processed by the junior lien holder for a fee, and approval depends on their assessment of the new loan terms. Most major HELOC providers handle this routinely; smaller second mortgage holders sometimes require more documentation.",
      "Plan for subordination in your refinance timeline. Some servicers process it in days, others take weeks. Knowing this up front avoids closing-day surprises when the new lender realizes the existing HELOC hasn't been formally subordinated yet.",
    ],
    related: ["home-equity-line-of-credit", "lien", "refinance", "collateral"],
    category: "Process & Closing",
  },
  {
    slug: "third-party-fees",
    term: "Third-Party Fees",
    shortDef:
      "Costs charged by entities other than the lender for services the lender requires in the closing process.",
    longDef: [
      "Third-party fees include the appraisal, credit report, flood certification, tax service, pest inspection (where required), survey (where required), and various title-related services. These costs flow through the lender's Loan Estimate but aren't lender revenue, they're pass-through charges to outside providers.",
      "Some third-party services the borrower can shop and choose their own provider (most title and settlement services); others the lender selects (typically appraisal and flood certification). The Loan Estimate flags which is which on the Services You Can Shop For section.",
      "Because third-party fees aren't lender revenue, lenders can't always control the final amount. Tolerance rules under federal regulation limit how much they can move between LE and CD, but legitimate changes (a more expensive title commitment, an extended appraisal) can flow through.",
    ],
    related: ["loan-estimate", "appraisal", "settlement-fees", "closing-costs"],
    category: "Costs & Fees",
  },
  {
    slug: "usda-loans",
    term: "USDA Loans",
    shortDef:
      "Zero-down-payment mortgages backed by the US Department of Agriculture for buyers in eligible rural and suburban areas.",
    longDef: [
      "USDA loans support homeownership in less-densely-populated areas through the Rural Development guarantee program. Eligible properties must be in a USDA-designated location, a map that includes a surprising amount of suburban America, not just farmland.",
      "There's no down payment requirement and rates are competitive with conventional, often slightly lower. The program has income limits that vary by county and household size; buyers above the limit don't qualify regardless of credit strength.",
      "Like FHA, USDA loans have both an upfront guarantee fee (financeable into the loan) and an annual fee paid monthly. The combined cost is generally lower than FHA's MIP structure, making USDA an attractive option when borrowers qualify on both location and income.",
    ],
    related: ["fha-loan", "va-loans", "down-payment", "mortgage-insurance-premium"],
    category: "Loan Types",
  },
  {
    slug: "underwriting",
    term: "Underwriting",
    shortDef:
      "The lender's formal review of a loan application to confirm it meets program guidelines and is acceptable to fund.",
    longDef: [
      "Underwriting is where the actual loan decision happens. An underwriter, a trained professional applying program guidelines, reviews the borrower's income, credit, assets, and the property file to determine whether the loan can move forward, with what conditions, and at what risk profile.",
      "Most modern underwriting starts with an automated decision through Fannie Mae's Desktop Underwriter or Freddie Mac's Loan Product Advisor. The automated finding sets the baseline, and a human underwriter then verifies that the supporting documentation matches what the system saw.",
      "Underwriting outcomes are typically one of three: approved (often with conditions), suspended (needs more information), or denied. Most denials at the underwriting stage are because something didn't match expectations, and most can be resolved by addressing the specific concern.",
    ],
    related: ["loan-commitment", "credit-check", "debt-to-income", "ipac"],
    category: "Underwriting",
  },
  {
    slug: "va-loans",
    term: "VA Loans",
    shortDef:
      "Mortgages backed by the Department of Veterans Affairs for eligible service members, veterans, and qualifying surviving spouses.",
    longDef: [
      "VA loans are one of the most attractive financing products available, period. Zero down payment, no monthly mortgage insurance, and competitive rates make them dramatically less expensive than most alternatives for eligible borrowers.",
      "The VA charges a funding fee (usually 1.4%–3.6% of the loan amount, depending on service category, prior VA use, and down payment) that can be financed into the loan. Borrowers with a service-connected disability are typically exempt from the funding fee entirely.",
      "VA underwriting uses residual income, money left over after all monthly obligations, as a key metric in addition to DTI. This often allows VA borrowers to qualify at higher DTIs than conventional underwriting would permit, recognizing that the unique structure of military pay supports loans that look tight on paper.",
    ],
    related: ["fha-loan", "usda-loans", "down-payment", "underwriting"],
    category: "Loan Types",
  },
  {
    slug: "wholesale",
    term: "Wholesale Lending",
    shortDef:
      "The channel through which lenders fund loans originated by independent mortgage brokers rather than their own retail loan officers.",
    longDef: [
      "In a wholesale relationship, a mortgage broker submits a borrower's application to a wholesale lender, who underwrites and funds the loan. The broker handles the borrower-facing relationship; the wholesale lender handles the actual lending.",
      "Wholesale pricing is often more competitive than retail because the wholesale lender doesn't carry the cost of running its own loan officer network. The broker captures some of that savings as their compensation, and some flows through to the borrower as a better rate or lower fees.",
      "Different wholesale lenders specialize in different product niches, jumbo, non-QM, government, first-time buyer programs. A good broker maintains relationships with multiple wholesale partners so they can route each loan to the lender most likely to approve it on the best terms.",
    ],
    related: ["mortgage-broker", "retail-lender", "loan-originator", "non-qualified-mortgage"],
    category: "Parties & Roles",
  },
  {
    slug: "title-insurance",
    term: "Title Insurance",
    shortDef:
      "A policy that protects buyers and lenders against claims arising from defects in the property's chain of ownership.",
    longDef: [
      "Title insurance covers risks that a title search might miss, forged deeds in the chain of ownership, undisclosed heirs, mechanic's liens that didn't surface in the search, fraud, recording errors. Unlike most insurance, the premium is paid once at closing and the coverage lasts as long as you (or your heirs) own the property.",
      "There are typically two policies issued at closing: a lender's policy protecting the bank's interest in the property up to the loan amount, and an owner's policy protecting the buyer's equity up to the purchase price. The lender's policy is usually required; the owner's policy is optional but inexpensive relative to what it covers.",
      "Title insurance prices vary by state and provider. In some states the rates are heavily regulated and identical across companies; in others, shopping can yield meaningful savings on identical coverage.",
    ],
    related: ["lien", "settlement-fees", "closing-costs", "closing"],
    category: "Process & Closing",
  },
  {
    slug: "fannie-mae",
    term: "Fannie Mae",
    shortDef:
      "The Federal National Mortgage Association, a government-sponsored enterprise that buys conventional loans from lenders.",
    longDef: [
      "Fannie Mae was chartered by Congress to provide liquidity, stability, and affordability to the US housing market. It doesn't lend directly to consumers; instead it buys conforming loans from primary-market lenders, packages them into mortgage-backed securities, and sells those securities to investors.",
      "By buying loans in volume, Fannie Mae frees up lender capital to make more loans, which keeps the mortgage market flowing. Its underwriting guidelines, through the Desktop Underwriter system, define what a conforming loan looks like and effectively set the standards for most of the conventional market.",
      "Along with Freddie Mac, Fannie has been in federal conservatorship since 2008. Its long-term structure remains a topic of ongoing policy debate, but its role as the largest buyer of US residential mortgages has been continuous.",
    ],
    related: ["freddie-mac", "conforming-mortgage", "conventional-loans", "underwriting"],
    category: "Programs & Agencies",
  },
  {
    slug: "freddie-mac",
    term: "Freddie Mac",
    shortDef:
      "The Federal Home Loan Mortgage Corporation, a government-sponsored enterprise that buys conventional loans from lenders, complementing Fannie Mae.",
    longDef: [
      "Freddie Mac was created in 1970 to expand the secondary mortgage market and provide a competitor to Fannie Mae. Like Fannie, it buys conforming loans from lenders, securitizes them, and sells the resulting mortgage-backed securities to investors.",
      "Freddie's underwriting automated system is Loan Product Advisor (LPA). It applies similar but not identical guidelines to Fannie's Desktop Underwriter, and loans that get suspended through one system sometimes get approved through the other, a real benefit of having two parallel agencies.",
      "Both Fannie and Freddie share the same broad mission and currently operate under federal conservatorship, but each has its own product nuances and program preferences that experienced loan officers learn to navigate to get individual files approved.",
    ],
    related: ["fannie-mae", "conforming-mortgage", "conventional-loans", "underwriting"],
    category: "Programs & Agencies",
  },
  {
    slug: "ginnie-mae",
    term: "Ginnie Mae",
    shortDef:
      "The Government National Mortgage Association, guarantees mortgage-backed securities composed of government-insured loans.",
    longDef: [
      "Ginnie Mae sits under HUD and operates differently from Fannie Mae and Freddie Mac. Ginnie doesn't buy loans directly. Instead, it guarantees mortgage-backed securities backed by FHA, VA, and USDA loans, providing the full faith and credit of the US government to the timely payment of principal and interest to investors.",
      "This guarantee makes Ginnie securities especially attractive to investors, which keeps the cost of capital low for government loan programs. The result is that FHA, VA, and USDA rates are typically competitive with conventional rates despite the higher risk profile of the underlying borrowers.",
      "For borrowers, Ginnie Mae operates entirely in the background, most people never hear the name. Its role is invisible but structural: it's the reason government-backed mortgage programs can offer the rates and terms they do.",
    ],
    related: ["fha-loan", "va-loans", "usda-loans", "fannie-mae"],
    category: "Programs & Agencies",
  },
  {
    slug: "homeowners-insurance",
    term: "Homeowner's Insurance",
    shortDef:
      "Property insurance that covers losses to the dwelling, personal belongings, and liability, required by mortgage lenders.",
    longDef: [
      "Lenders require homeowner's insurance to protect their collateral. A standard policy (often called HO-3) covers the dwelling against named perils like fire, wind, hail, and theft, plus liability if someone is injured on the property. Personal property coverage is included, usually at a percentage of the dwelling limit.",
      "Common exclusions include flood and earthquake, which require separate policies in affected areas. Lenders in flood-prone areas require flood insurance through the National Flood Insurance Program or a private carrier.",
      "Premiums depend on location, dwelling replacement cost, deductible level, claim history, and credit (in most states). Shopping multiple carriers at the same coverage levels can yield significant savings, and bundling with auto insurance often unlocks further discounts.",
    ],
    related: ["escrow-account", "prepaids", "piti", "property-tax"],
    category: "Costs & Fees",
  },
  {
    slug: "hoa-dues",
    term: "HOA Dues",
    shortDef:
      "Recurring fees paid by homeowners in a community with a homeowners association, funding shared maintenance and amenities.",
    longDef: [
      "HOA dues fund the operating budget of the homeowners association: landscaping common areas, maintaining shared amenities, paying for insurance on common elements, building reserves for major future projects. Dues are typically billed monthly or quarterly.",
      "Lenders include HOA dues in your PITI calculation for qualification purposes, the dues count against your housing ratio and DTI just like principal, interest, taxes, and insurance. A high HOA payment can meaningfully reduce the loan amount you qualify for.",
      "Beyond regular dues, HOAs can levy special assessments for unexpected major expenses, a roof failure, a lawsuit, a deferred maintenance project. Reviewing the HOA's recent meeting minutes, reserves balance, and special-assessment history before buying into a community is essential homework.",
    ],
    related: ["piti", "housing-ratio", "planned-unit-development", "debt-to-income"],
    category: "Costs & Fees",
  },
  {
    slug: "property-tax",
    term: "Property Tax",
    shortDef:
      "An annual tax levied by local governments on real estate, based on the property's assessed value.",
    longDef: [
      "Property taxes fund schools, local infrastructure, public safety, and other municipal services. They're calculated by multiplying the assessed value of the property by the local tax rate, often called a mill rate or millage. Both assessment methodology and rates vary widely by state and county.",
      "Lenders escrow property taxes by default, they collect 1/12 of the annual amount with each mortgage payment and pay the tax bill when due. This protects the lender (unpaid taxes become a senior lien) and smooths the lumpy annual bill into manageable monthly amounts for the borrower.",
      "Property tax assessments change periodically. Many jurisdictions reassess at sale, which can mean a notable bump in the year after purchase if the prior owner had owned for a long time. Always research the assessment policy in your target area before buying so you can budget accurately.",
    ],
    related: ["escrow-account", "piti", "market-value", "homeowners-insurance"],
    category: "Costs & Fees",
  },
  {
    slug: "amortization",
    term: "Amortization",
    shortDef:
      "The schedule by which a loan balance is paid down over time through regular payments of principal and interest.",
    longDef: [
      "On a fully amortizing loan, each payment is calculated so the balance reaches zero exactly at the end of the loan term. The composition of each payment shifts over time, early payments are mostly interest, later payments are mostly principal, but the total payment stays constant on a fixed-rate loan.",
      "An amortization schedule is a table showing every payment over the life of the loan, broken down by principal, interest, and remaining balance. It's a powerful planning tool: you can see exactly when you'll cross 80% LTV (and become PMI-eligible for cancellation), or how much faster a payoff comes with even modest extra principal payments.",
      "Some loans are non-amortizing (interest-only periods, balloon structures, negative amortization) and require careful planning around the eventual full-payment requirement. Most residential mortgages today are fully amortizing for the borrower's protection.",
    ],
    related: ["principal", "principal-reduction", "fixed-rate-mortgage", "mortgage-recast"],
    category: "Process & Closing",
  },
  {
    slug: "promissory-note",
    term: "Promissory Note",
    shortDef:
      "The signed legal instrument in which a borrower promises to repay a specified sum under defined terms.",
    longDef: [
      "In a mortgage transaction, the promissory note is the borrower's actual promise to repay, separate from the mortgage or deed of trust, which is the lien instrument that secures the note. The note governs the financial relationship; the mortgage governs the collateral relationship.",
      "Notes are negotiable instruments, they can be transferred from one holder to another, which is exactly what happens when a loan is sold in the secondary market. The party that holds the original note is the entity legally entitled to enforce its terms.",
      "When a loan is paid off, the original note is marked paid in full and returned to the borrower along with a release of the lien recorded at the county. Keeping these documents permanently is wise even though digital records are now the standard.",
    ],
    related: ["mortgage-note", "lien", "collateral", "servicer"],
    category: "Process & Closing",
  },
  {
    slug: "bridge-loan",
    term: "Bridge Loan",
    shortDef:
      "Short-term financing that helps a buyer purchase a new home before selling their existing one.",
    longDef: [
      "Bridge loans solve a classic timing problem: you want to buy your next home but most of your down payment is locked in equity in your current home, which hasn't sold yet. A bridge loan unlocks that equity for a short period, typically six to twelve months, to fund the new purchase.",
      "Rates and fees on bridge loans run higher than standard mortgages because of the short term and the underwriting around two simultaneous properties. Most are structured to require interest-only payments during the bridge period and a balloon payoff when the original home sells.",
      "Bridge loans aren't the only solution to this problem. Contingent purchase offers, HELOCs on the existing home, or simply buying after selling are all alternatives. A bridge makes most sense in competitive markets where a contingent offer wouldn't compete and the borrower has high confidence the existing home will sell quickly.",
    ],
    related: ["home-equity-line-of-credit", "cash-out-refinance", "equity", "loan-to-value"],
    category: "Loan Types",
  },
  {
    slug: "reverse-mortgage",
    term: "Reverse Mortgage",
    shortDef:
      "A loan available to older homeowners that converts home equity into cash without requiring monthly payments during the borrower's tenure.",
    longDef: [
      "Reverse mortgages, most commonly Home Equity Conversion Mortgages (HECMs) insured by FHA, let homeowners aged 62 or older borrow against their home equity. The loan doesn't require monthly payments; instead the balance grows over time and is repaid when the home is sold, the borrower moves out, or the borrower passes away.",
      "Funds can be distributed as a lump sum, monthly payments for a set term or for life, a line of credit, or some combination. Borrowers remain responsible for property taxes, homeowner's insurance, HOA dues if any, and maintaining the home, failure on these can trigger default.",
      "Reverse mortgages have meaningful upfront and ongoing costs, and they reduce the equity heirs will inherit. They're a powerful tool for retirees with substantial home equity and limited cash flow, but the decision deserves careful analysis against alternatives like downsizing or a HELOC.",
    ],
    related: ["home-equity-line-of-credit", "equity", "fha-loan", "loan-to-value"],
    category: "Loan Types",
  },
  {
    slug: "title-search",
    term: "Title Search",
    shortDef:
      "An examination of public records to verify the legal ownership of a property and identify any claims against it.",
    longDef: [
      "Before issuing title insurance, the title company traces the property's ownership history back through deeds, mortgages, liens, judgments, and other recorded instruments. The goal is to confirm the seller has the right to transfer ownership and that the buyer will receive clear title.",
      "Common issues that surface in a title search include unreleased prior mortgages, mechanic's liens from contractors, judgments from creditors, easement disputes, or title transfers within the family that weren't properly documented. Most are easily resolved before closing once identified.",
      "The title search is generally fast, most clear titles are confirmed within a few days. Properties with complex histories, multiple recent owners, or recorded disputes can take longer. The title commitment that results lists exactly what the title insurance will and won't cover.",
    ],
    related: ["title-insurance", "lien", "settlement-fees", "closing"],
    category: "Process & Closing",
  },
  {
    slug: "default",
    term: "Default",
    shortDef:
      "Failure to meet the legal obligations of a loan, most commonly by missing scheduled payments.",
    longDef: [
      "Default doesn't usually happen on a single missed payment, most mortgage documents define default after a specified number of consecutive missed payments, typically three. But the path to default starts with the first missed payment, and the longer it goes uncured the harder recovery becomes.",
      "Once a loan is in default, the servicer can begin acceleration, declaring the entire balance immediately due. From there, foreclosure proceedings can start, governed by state law and the procedures spelled out in the loan documents.",
      "Default also covers non-payment defaults: failure to maintain required insurance, failure to pay property taxes (if not escrowed), or transferring the property in violation of a due-on-sale clause. These are less common but real triggers in specific situations.",
    ],
    related: ["foreclosure", "forbearance", "modifications", "servicer"],
    category: "Servicing",
  },
];

export type GlossaryLetterGroup = {
  letter: string;
  terms: GlossaryTerm[];
};

export function getGlossaryByLetter(): GlossaryLetterGroup[] {
  const groups = new Map<string, GlossaryTerm[]>();
  for (const term of glossaryTerms) {
    const letter = term.term.charAt(0).toUpperCase();
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(term);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, terms]) => ({
      letter,
      terms: terms.sort((a, b) => a.term.localeCompare(b.term)),
    }));
}

export function getTermBySlug(slug: string): GlossaryTerm | undefined {
  return glossaryTerms.find((t) => t.slug === slug);
}

export function getRelatedTerms(term: GlossaryTerm): GlossaryTerm[] {
  return term.related
    .map((slug) => glossaryTerms.find((t) => t.slug === slug))
    .filter((t): t is GlossaryTerm => Boolean(t));
}
