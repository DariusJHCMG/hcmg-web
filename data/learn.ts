export type LearnArticle = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  readTime: number; // minutes
  publishedAt: string; // ISO date
  headline: string;
  intro: string;
  sections: {
    heading: string;
    body: string[];
  }[];
  faqs: { q: string; a: string }[];
  relatedSlugs: string[];
  /** SEO loan type to link to local pages */
  loanType?: string;
};

export const learnArticles: LearnArticle[] = [
  {
    slug: "fha-loan-requirements",
    title: "FHA Loan Requirements",
    metaTitle: "FHA Loan Requirements 2024 — Credit Score, Down Payment & Income | HCMG",
    metaDescription:
      "Everything you need to qualify for an FHA loan: minimum credit score (580), down payment (3.5%), debt-to-income limits, property standards, and mortgage insurance. Plain-English guide from Harris Capital Mortgage Group.",
    category: "FHA Loans",
    readTime: 7,
    publishedAt: "2024-09-01",
    headline: "FHA Loan Requirements — Everything You Need to Qualify",
    intro:
      "FHA loans are insured by the Federal Housing Administration and designed to make homeownership accessible for buyers with lower credit scores or limited savings. They're one of the most popular loan programs in the country — and one of the most misunderstood. This guide covers every requirement so you know exactly where you stand before you apply.",
    sections: [
      {
        heading: "Credit Score Requirements",
        body: [
          "FHA loans accept lower credit scores than most conventional programs. The minimum depends on your down payment:",
          "580 or higher: You qualify for the minimum 3.5% down payment. This is the most common FHA scenario.",
          "500–579: You can still apply, but the required down payment rises to 10%. Lenders may also have stricter conditions.",
          "Below 500: Not eligible for FHA financing. Focus on credit repair before applying.",
          "Important: these are the FHA program minimums. Individual lenders (including HCMG) may have their own overlays — meaning their internal minimum may be slightly higher. Your loan officer will tell you the exact threshold for your file.",
        ],
      },
      {
        heading: "Down Payment Requirements",
        body: [
          "The FHA's 3.5% minimum down payment is one of its biggest attractions. On a $300,000 home, that's $10,500 — significantly less than the $15,000–$60,000 required by most conventional programs.",
          "The down payment can come from your own savings, a gift from a family member, a down payment assistance grant, or a combination. Unlike some conventional loans, FHA allows 100% of the down payment to be gifted — as long as the gift is properly documented.",
          "If your credit score is between 500 and 579, the minimum rises to 10%. In this case, down payment gift funds are still allowed.",
        ],
      },
      {
        heading: "Debt-to-Income (DTI) Ratio",
        body: [
          "Your debt-to-income ratio compares your monthly debt payments to your gross monthly income. FHA guidelines allow:",
          "Front-end DTI (housing expenses only): up to 31% of gross income",
          "Back-end DTI (all monthly debts): up to 43% of gross income",
          "With compensating factors — strong reserves, a large down payment, or excellent credit — FHA can approve DTIs up to 50% or slightly higher through automated underwriting. Your loan officer will run your specific scenario.",
        ],
      },
      {
        heading: "Employment & Income Requirements",
        body: [
          "FHA does not set a minimum income. What matters is that your income is sufficient to support the payment and is likely to continue.",
          "You'll need two years of employment history. This doesn't have to be the same job — a history of stable employment in the same field qualifies. Self-employed borrowers need two years of tax returns showing consistent income.",
          "Part-time income, overtime, bonus income, and rental income can all count, but lenders generally require a 2-year history of receiving it before it can be included in your qualifying income.",
        ],
      },
      {
        heading: "FHA Mortgage Insurance (MIP)",
        body: [
          "All FHA loans require mortgage insurance — this is how the FHA program funds itself. There are two components:",
          "Upfront MIP (UFMIP): 1.75% of the loan amount, due at closing. It can be rolled into the loan balance instead of paid out of pocket.",
          "Annual MIP: Ranges from 0.45% to 1.05% of the loan balance per year, divided into 12 monthly payments added to your mortgage payment.",
          "For most FHA loans originated today with less than 10% down, the annual MIP lasts for the life of the loan. If you put 10% or more down, MIP cancels after 11 years.",
          "This is the primary drawback of FHA vs. conventional financing. Once you build 20% equity, refinancing into a conventional loan eliminates MIP entirely.",
        ],
      },
      {
        heading: "Property Requirements",
        body: [
          "The property you're buying must meet FHA standards. The most important rules:",
          "It must be your primary residence — FHA is not available for investment properties or vacation homes.",
          "The home must pass an FHA appraisal. The appraiser checks not only value but also safety and livability — things like peeling paint, broken windows, and structural issues can require repairs before the loan closes.",
          "Condominiums must be on the FHA-approved condo list. Your loan officer can check this instantly.",
          "Manufactured homes have additional requirements around permanent foundation and age.",
        ],
      },
      {
        heading: "FHA Loan Limits",
        body: [
          "The FHA sets county-level loan limits each year. For 2024, the baseline limit for a single-family home is $498,257 in most of the country, rising to $1,149,825 in high-cost areas like Los Angeles, San Francisco, and parts of Maryland and Virginia.",
          "If the home you want exceeds the FHA limit in your county, you'll need a conventional or jumbo loan instead. Your loan officer can pull the exact limit for any zip code.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I use an FHA loan to buy a duplex or small investment property?",
        a: "Yes — FHA allows 2-4 unit properties as long as you live in one of the units as your primary residence. You can collect rent on the other units, and that rental income may help you qualify.",
      },
      {
        q: "How long do I have to wait after bankruptcy to get an FHA loan?",
        a: "Chapter 7 bankruptcy: 2-year waiting period from discharge. Chapter 13: You may be eligible after 12 months of on-time plan payments with court approval. Your loan officer will review the specifics of your situation.",
      },
      {
        q: "Can I roll closing costs into an FHA loan?",
        a: "Not directly — FHA doesn't allow financing closing costs. However, you can ask the seller to cover up to 6% of the purchase price in concessions, which can offset closing costs. You can also negotiate with the lender for a higher rate in exchange for a lender credit.",
      },
      {
        q: "What's the difference between FHA and conventional?",
        a: "FHA allows lower credit scores and smaller down payments but requires mortgage insurance for the life of the loan in most cases. Conventional loans require stronger credit (620+) and higher down payments but let you cancel PMI once you reach 20% equity. The right choice depends on your specific profile.",
      },
    ],
    relatedSlugs: ["va-loan-eligibility-requirements", "first-time-homebuyer-programs", "what-is-pmi"],
    loanType: "FHA Loan",
  },

  {
    slug: "how-much-mortgage-can-i-afford",
    title: "How Much Mortgage Can I Afford?",
    metaTitle: "How Much Mortgage Can I Afford? — 2024 Calculator Guide | HCMG",
    metaDescription:
      "Learn the real rules lenders use to decide how much home you can afford: DTI limits, the 28/36 rule, down payment, and how income affects your buying power. HCMG.",
    category: "Buying a Home",
    readTime: 6,
    publishedAt: "2024-09-01",
    headline: "How Much Mortgage Can I Afford? The Rules Lenders Actually Use",
    intro:
      "The most common homebuying mistake is shopping for homes before knowing the real number. Not the number a mortgage calculator gives you — the number a lender will actually approve. Here's exactly how lenders calculate affordability, and how to use that math to find the right purchase price for your situation.",
    sections: [
      {
        heading: "The 28/36 Rule — The Classic Guideline",
        body: [
          "The traditional affordability rule says your housing costs should not exceed 28% of your gross monthly income, and your total debt payments should not exceed 36%.",
          "Example: If you earn $7,500/month gross: 28% = $2,100 max housing payment. 36% = $2,700 max total debt.",
          "This is a conservative rule of thumb. Modern lending programs — especially FHA — allow higher ratios. But it's a useful starting point for planning.",
        ],
      },
      {
        heading: "How Lenders Actually Calculate It: DTI",
        body: [
          "Lenders don't use the 28/36 rule — they use Debt-to-Income ratio (DTI). Your back-end DTI is the number that matters most:",
          "Back-end DTI = (All monthly debt payments + proposed housing payment) ÷ Gross monthly income",
          "Conventional loans: generally allow up to 45–50% DTI",
          "FHA loans: up to 43–50% DTI with compensating factors",
          "VA loans: no official DTI cap, but most lenders want 41% or below",
          "Run the math backward: if your gross income is $8,000/month and you have $500 in existing debt payments, the maximum housing payment at 45% DTI is: (8,000 × 0.45) − 500 = $3,100.",
        ],
      },
      {
        heading: "How Down Payment Changes What You Can Afford",
        body: [
          "A larger down payment reduces your loan balance, which lowers your monthly payment and can bring you within DTI limits on a more expensive home.",
          "It also eliminates or reduces mortgage insurance. On a conventional loan, 20% down means no PMI — saving $100–$200/month on a $300,000 loan.",
          "Example: Home price $400,000. With 5% down ($20,000), your loan is $380,000. With 20% down ($80,000), your loan is $320,000 — reducing your monthly payment by roughly $360 at a 7% rate.",
        ],
      },
      {
        heading: "Credit Score's Effect on Your Payment",
        body: [
          "Your credit score directly affects your interest rate, which affects your payment more than almost anything else.",
          "On a $350,000 30-year loan: a 760+ score might get 6.75%, a 680 score might get 7.50%. That difference is ~$165/month — or roughly $59,000 over 30 years.",
          "Improving your score before you apply can meaningfully change what you can afford. Even 30–60 days of credit optimization can shift your score enough to hit a better rate tier.",
        ],
      },
      {
        heading: "Property Taxes, Insurance & HOA — The Hidden Payment",
        body: [
          "Your mortgage payment (PITI) includes more than principal and interest. For budgeting purposes, add:",
          "Property taxes: vary wildly by state and county. Texas and New Jersey are among the highest (1.5–2.5%+). Alabama and Nevada are among the lowest (0.3–0.6%).",
          "Homeowner's insurance: typically $1,000–$2,500/year depending on location, home value, and coverage.",
          "HOA fees: $0 in most single-family neighborhoods, $200–$600/month in many condos and planned communities.",
          "These additions can add $500–$1,500/month to your payment. Always budget for PITI, not just principal and interest.",
        ],
      },
      {
        heading: "The Fast Rule of Thumb",
        body: [
          "A rough rule used by many loan officers: multiply your gross annual income by 3 to 4.5 to get an approximate purchase price range.",
          "Income $75,000/year → price range $225,000–$337,500",
          "Income $120,000/year → price range $360,000–$540,000",
          "This range widens or narrows based on your debt load, down payment, and local tax rates. Use it as a ballpark, then get a real pre-qualification to find the precise number.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does the lender's maximum mean I should borrow that much?",
        a: "No. Lenders tell you the maximum they'll approve — not the number that's right for your life. Many financial advisors suggest keeping your housing payment at 25–28% of take-home pay (not gross income) to leave room for savings, emergencies, and other goals.",
      },
      {
        q: "Does my spouse's income count if they're on the loan?",
        a: "Yes. If both of you are on the loan, both incomes are included. Both credit scores are also reviewed — the lender typically uses the lower of the two middle scores for qualification purposes.",
      },
      {
        q: "Can rental income help me qualify?",
        a: "Yes, with documentation. Future rental income (on a multi-unit purchase) or existing rental income (from investment properties) can be used, but lenders typically require a 2-year history for existing properties and apply a vacancy factor to the income.",
      },
    ],
    relatedSlugs: ["fha-loan-requirements", "mortgage-pre-approval-vs-pre-qualification", "what-is-pmi"],
    loanType: "Conventional Loan",
  },

  {
    slug: "first-time-homebuyer-programs",
    title: "First-Time Homebuyer Programs",
    metaTitle: "First-Time Homebuyer Programs 2024 — Down Payment Help by State | HCMG",
    metaDescription:
      "State-by-state guide to first-time homebuyer programs including down payment assistance grants, below-market rate loans, and tax credits. FL, TX, GA, NV, CO, VA, MD, CA, MS covered.",
    category: "Buying a Home",
    readTime: 8,
    publishedAt: "2024-09-01",
    headline: "First-Time Homebuyer Programs — Down Payment Help in Every State We Serve",
    intro:
      "Down payment assistance, below-market rates, and tax credits for first-time buyers aren't marketing gimmicks — they're real programs funded by state housing finance agencies and the federal government. Billions of dollars go unclaimed every year because buyers don't know they qualify. Here's what's available in every state HCMG serves.",
    sections: [
      {
        heading: "Who Counts as a First-Time Buyer?",
        body: [
          "The definition is more forgiving than it sounds. You're considered a first-time buyer if you haven't owned a primary residence in the past three years. That means previous homeowners who rented for a few years may qualify again.",
          "Divorced individuals who owned jointly with a spouse and haven't owned since may also qualify. Some programs have no first-time buyer requirement at all — they're based purely on income and purchase price.",
        ],
      },
      {
        heading: "Florida — Florida Housing Finance Corporation",
        body: [
          "The Florida Housing Finance Corporation (FHFC) offers the Florida First and HFA Preferred programs with below-market 30-year fixed rates for eligible buyers.",
          "Florida Assist (FL Assist): A deferred second mortgage of up to $10,000 for down payment and closing costs. No monthly payments, no interest — repayment only when you sell, refinance, or move.",
          "Florida Homeownership Loan Program (HLP): A $10,000 second mortgage at 3% simple interest with monthly payments of ~$43.",
          "Income limits and purchase price limits apply and vary by county. HCMG loan officers can check your eligibility in minutes.",
        ],
      },
      {
        heading: "Texas — TSAHC and TDHCA Programs",
        body: [
          "Texas offers two main agencies for first-time buyers:",
          "TSAHC (Texas State Affordable Housing Corporation): Offers down payment assistance grants of up to 5% of the loan amount — no repayment required. Also offers a My Choice Texas Home program with no first-time buyer requirement.",
          "TDHCA (Texas Department of Housing and Community Affairs): The My First Texas Home program provides 30-year fixed-rate loans with a 5% down payment assistance loan at 0% interest, deferred until sale or refinance.",
          "Both programs work with FHA, VA, USDA, and conventional loans.",
        ],
      },
      {
        heading: "Georgia — Georgia Dream",
        body: [
          "Georgia Dream is administered by GAHFA (Georgia Housing and Finance Authority) and provides:",
          "Standard DPA: Up to $10,000 in down payment assistance as a 0%, deferred loan.",
          "Choice DPA: Up to $12,500 for buyers who are public protectors, educators, healthcare workers, or active military.",
          "Pen DPA: Up to $12,500 for buyers with a family member with a disability.",
          "Income limits are based on household size and county. Buyers must complete an approved homebuyer education course.",
        ],
      },
      {
        heading: "Nevada — Home Is Possible",
        body: [
          "Nevada Housing Division runs the Home Is Possible (HIP) program, which offers a 4% grant toward down payment and closing costs — money that does not have to be repaid.",
          "For first-time buyers, the HIP For First-Time Homebuyers program pairs the grant with a below-market rate first mortgage.",
          "Income limits: Generally up to $105,000 for a household of 1–2, higher for larger households.",
        ],
      },
      {
        heading: "Colorado — CHFA",
        body: [
          "The Colorado Housing and Finance Authority (CHFA) offers first mortgage loans at below-market rates plus down payment assistance:",
          "CHFA SmartStep: A deferred second loan for down payment assistance. No monthly payments until you sell or refinance.",
          "CHFA Salary Second: A second mortgage at 3.5% interest to cover down payment and some closing costs.",
          "Income limits vary by county. CHFA-approved lenders (including HCMG) can tell you the exact limit for your area.",
        ],
      },
      {
        heading: "Virginia & Maryland — VHDA and MMP",
        body: [
          "Virginia: The Virginia Housing Development Authority (VHDA) offers the Granting Freedom and Down Payment Assistance Grant programs. The DPA Grant provides up to 2.5% of the purchase price — no repayment required.",
          "Maryland: The Maryland Mortgage Program (MMP) offers competitive rates plus Partner Match grants, where the state matches local government or employer contributions to down payment assistance dollar for dollar.",
          "Both states also offer mortgage credit certificates (MCCs) — federal tax credits worth 20–25% of annual mortgage interest paid.",
        ],
      },
      {
        heading: "California — CalHFA",
        body: [
          "The California Housing Finance Agency (CalHFA) offers several programs for first-time buyers:",
          "MyHome Assistance Program: A deferred-payment junior loan up to 3.5% of the purchase price or appraised value for down payment and closing costs.",
          "Dream For All: Shared appreciation loan for down payment — CalHFA provides up to 20% of the purchase price and shares in the appreciation when you sell. This program is highly competitive and opens in limited rounds.",
          "CalHFA Zero Interest Program (ZIP): For closing cost assistance with zero interest and no monthly payments.",
        ],
      },
      {
        heading: "Mississippi — MHC Programs",
        body: [
          "The Mississippi Home Corporation (MHC) offers the Smart Solution program — a 30-year fixed rate first mortgage with down payment assistance of 3–4% of the loan amount.",
          "Mississippi consistently has some of the most affordable home prices in the Southeast, meaning down payment requirements are often the most accessible in the country.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I combine down payment assistance with an FHA loan?",
        a: "Yes. Most state DPA programs are specifically designed to layer on top of FHA loans. The DPA covers the required 3.5% down payment, which means some buyers purchase a home with effectively zero out-of-pocket for the down payment (closing costs still apply).",
      },
      {
        q: "Do I have to repay down payment assistance?",
        a: "It depends on the program. Grants are free money — no repayment. Deferred loans must be repaid when you sell or refinance, but require no monthly payments. Some programs forgive the loan entirely after you've lived in the home for a set period (usually 5–10 years).",
      },
      {
        q: "Is there an income limit for these programs?",
        a: "Yes. Almost all DPA programs have household income limits, typically set at 80–120% of area median income (AMI). The limit varies by county and household size. Your HCMG loan officer will check your eligibility for every program available in your area.",
      },
    ],
    relatedSlugs: ["fha-loan-requirements", "how-much-mortgage-can-i-afford", "mortgage-pre-approval-vs-pre-qualification"],
    loanType: "Down Payment Assistance",
  },

  {
    slug: "va-loan-eligibility-requirements",
    title: "VA Loan Eligibility Requirements",
    metaTitle: "VA Loan Eligibility Requirements 2024 — Service, Certificate & Benefits | HCMG",
    metaDescription:
      "Complete guide to VA loan eligibility: service requirements, Certificate of Eligibility, 0% down benefit, VA funding fee, and how to apply. Harris Capital Mortgage Group — licensed in FL, TX, GA, NV, CO, VA, MD, CA & MS.",
    category: "VA Loans",
    readTime: 6,
    publishedAt: "2024-09-01",
    headline: "VA Loan Eligibility — Who Qualifies and How to Use Your Benefit",
    intro:
      "The VA home loan benefit is one of the most powerful financial tools available to those who've served — zero down payment, no private mortgage insurance, and competitive interest rates. Yet fewer than 1 in 3 eligible veterans use it. This guide covers exactly who qualifies, what the benefit includes, and how to get started.",
    sections: [
      {
        heading: "Who Is Eligible?",
        body: [
          "VA loans are available to:",
          "Active duty service members: After 90 consecutive days of active service during wartime, or 181 days during peacetime.",
          "Veterans: With at least 90 days active duty during wartime, or 181 days peacetime. Honorable discharge required for most; General Under Honorable Conditions discharge may still qualify.",
          "National Guard and Reserves: After 6 years of service, or 90 days of active duty orders under Title 10 or Title 32.",
          "Surviving spouses: Of veterans who died in service or from a service-connected disability, or who are listed as MIA/POW. The surviving spouse must not have remarried (with limited exceptions).",
          "Cadets and midshipmen: Of the US military academies under certain conditions.",
        ],
      },
      {
        heading: "Certificate of Eligibility (COE)",
        body: [
          "The Certificate of Eligibility (COE) is the VA's official document confirming your entitlement. You'll need it to get a VA loan.",
          "How to get it: Your HCMG loan officer can pull your COE through the VA's automated system in most cases — no action required from you. Alternatively, you can apply through the VA's eBenefits portal or by mail using VA Form 26-1880.",
          "Remaining entitlement: If you've used your VA benefit before and still have an outstanding VA loan, you may have remaining (or 'bonus') entitlement that allows you to take out another VA loan — even on a second property in some cases.",
        ],
      },
      {
        heading: "Key Benefits of VA Loans",
        body: [
          "Zero down payment: No down payment required for any purchase price within VA loan limits (which were eliminated for most borrowers in 2020).",
          "No private mortgage insurance (PMI): Conventional loans require PMI when down payment is under 20%. VA loans never require PMI, saving $100–$300/month on a typical loan.",
          "Competitive rates: VA-backed loans typically carry rates 0.25–0.5% below conventional rates for comparable borrowers.",
          "Limits on closing costs: The VA restricts which fees lenders can charge veterans, capping certain costs.",
          "Assumable: VA loans are assumable by qualified buyers — a significant selling advantage when your rate is below market.",
          "No prepayment penalty: You can pay off your VA loan at any time with no fees.",
        ],
      },
      {
        heading: "VA Funding Fee",
        body: [
          "Most VA loans include a funding fee — a one-time charge that helps fund the VA loan program and reduces its cost to taxpayers.",
          "For first-time use with 0% down: 2.3% of the loan amount. For subsequent use: 3.6%. With 5–10% down: 1.65%. With 10%+ down: 1.4%.",
          "The funding fee can be rolled into the loan amount. You don't need to bring it to closing.",
          "Who is exempt: Veterans receiving VA disability compensation, surviving spouses of veterans who died in service or from a service-connected disability, and active-duty Purple Heart recipients are all exempt from the funding fee.",
        ],
      },
      {
        heading: "Other Qualification Requirements",
        body: [
          "VA loans still require meeting the lender's credit and income standards (the VA guarantees the loan, but the lender sets credit requirements).",
          "Credit score: No VA minimum, but most lenders require 580–620. HCMG will review your specific situation.",
          "DTI: The VA uses a 41% DTI benchmark but allows exceptions with compensating factors (significant residual income, large down payment, excellent credit).",
          "Residual income: The VA's residual income requirement checks that you have enough take-home pay left after housing and other debt payments to cover living expenses. This varies by loan size and family size.",
          "Occupancy: VA loans require the property to be your primary residence. You must move in within 60 days of closing in most cases.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I use my VA benefit more than once?",
        a: "Yes. Your VA entitlement can be used multiple times. If you've paid off a previous VA loan (or sold the home and paid it off), your full entitlement is restored. You can also have two VA loans simultaneously if you have sufficient remaining entitlement — common for active duty members who buy at one duty station and then receive PCS orders.",
      },
      {
        q: "Can I use a VA loan to buy a rental property or investment property?",
        a: "Not directly — VA loans require owner-occupancy as the primary residence. However, you can buy a 2-4 unit property with a VA loan and rent out the other units as long as you live in one of them.",
      },
      {
        q: "How long does a VA loan take to close?",
        a: "A VA loan with a prepared borrower typically closes in 30–45 days — comparable to conventional. The VA appraisal (called a VA appraisal, performed by a VA-approved appraiser) is sometimes cited as the bottleneck in competitive markets, but most close on the same timeline.",
      },
    ],
    relatedSlugs: ["fha-loan-requirements", "how-much-mortgage-can-i-afford", "when-to-refinance-your-mortgage"],
    loanType: "VA Loan",
  },

  {
    slug: "when-to-refinance-your-mortgage",
    title: "When to Refinance Your Mortgage",
    metaTitle: "When to Refinance Your Mortgage — Break-Even, Rate Drop & Cash-Out Guide | HCMG",
    metaDescription:
      "How to know when refinancing makes financial sense: the break-even rule, how much rates need to drop, cash-out vs. rate/term, and when NOT to refinance. HCMG.",
    category: "Refinance",
    readTime: 6,
    publishedAt: "2024-09-01",
    headline: "When to Refinance Your Mortgage — The Break-Even Analysis You Need",
    intro:
      "Refinancing can save tens of thousands of dollars — or cost you money, depending on the timing. The difference between a smart refinance and a bad one often comes down to one calculation: the break-even point. Here's exactly how to decide if refinancing is right for your situation.",
    sections: [
      {
        heading: "The Break-Even Rule",
        body: [
          "Refinancing costs money upfront — typically $3,000–$6,000 in closing costs. Whether it makes sense depends on how long it takes your monthly savings to recover those costs.",
          "Break-even formula: Closing costs ÷ Monthly savings = Break-even months",
          "Example: $4,500 closing costs ÷ $180/month savings = 25 months to break even.",
          "If you plan to stay in the home longer than your break-even point, the refinance saves you money. If you might move or refinance again before that point, you're likely better off waiting.",
        ],
      },
      {
        heading: "How Much Should Rates Drop?",
        body: [
          "The old rule of thumb was 'refinance when rates drop 1%.' That's outdated — the right threshold depends on your loan balance and how long you'll stay.",
          "On a $500,000 loan: Even a 0.5% rate drop can save $140–$160/month — worth refinancing for anyone staying 3+ years.",
          "On a $150,000 loan: A 1% rate drop saves ~$80/month. With $4,000 in closing costs, break-even is 50 months.",
          "Run the numbers on your actual balance. Don't let the '1% rule' stop you from refinancing a large loan when rates drop 0.5–0.75%.",
        ],
      },
      {
        heading: "Rate/Term Refinance vs. Cash-Out Refinance",
        body: [
          "Rate/term refinance: You're refinancing to change the rate, the term (30→15 year), or both. No cash comes out. This is a 'pure' refinance — the goal is lowering your payment or paying off faster.",
          "Cash-out refinance: You borrow more than you currently owe and take the difference as cash. Rates are typically 0.125–0.5% higher than a rate/term refi. Common uses: home renovations, debt consolidation, college tuition, large purchases.",
          "Cash-out considerations: You're resetting your amortization. If you're 10 years into a 30-year loan and cash-out into a new 30-year, you've extended your repayment by a decade. Run the long-term cost carefully.",
        ],
      },
      {
        heading: "When NOT to Refinance",
        body: [
          "You're close to payoff: If you're 20+ years into a 30-year mortgage, most of your payment is now principal. Refinancing into a new 30-year resets the amortization and dramatically increases total interest paid.",
          "You're moving soon: If you'll sell within 2–3 years, you'll rarely break even on closing costs.",
          "Your credit has deteriorated: Refinancing with a lower credit score than your original loan can result in a higher rate, not a lower one.",
          "You're close to 20% equity on a conventional loan: If you're about to eliminate PMI naturally, refinancing now might not be worth the closing costs — you'll lose PMI soon regardless.",
        ],
      },
      {
        heading: "The 15-Year Refinance",
        body: [
          "Refinancing a 30-year loan into a 15-year loan is a powerful wealth-building move — but only if the payment is comfortable.",
          "15-year rates are typically 0.5–0.75% lower than 30-year rates. On a $350,000 balance at 7% (30-year) vs. 6.25% (15-year): the 15-year payment is about $700 higher per month but you save roughly $235,000 in total interest.",
          "Don't stretch into a 15-year if it puts your DTI uncomfortably high. A cash reserve is more valuable than maximum equity accumulation.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I refinance if I just bought the home?",
        a: "Yes — there's no mandatory waiting period for a conventional refinance. FHA streamline refinances require 6 months of payments. VA IRRRL requires 6 months of payments. Practically speaking, most lenders want to see that you've made at least a few on-time payments, and you'll need to pay closing costs again.",
      },
      {
        q: "What documents do I need to refinance?",
        a: "Generally: last 2 years of tax returns, last 2 months of pay stubs, last 2 months of bank statements, current mortgage statement, homeowner's insurance declarations page, and government-issued ID. Your loan officer will provide a precise checklist.",
      },
      {
        q: "Does refinancing hurt my credit score?",
        a: "A hard inquiry from a refinance application will temporarily lower your score by a few points. Multiple mortgage inquiries within a 14–45 day window (depending on the scoring model) count as a single inquiry — so rate shopping multiple lenders in a short period doesn't compound the impact.",
      },
    ],
    relatedSlugs: ["how-much-mortgage-can-i-afford", "what-is-pmi", "va-loan-eligibility-requirements"],
    loanType: "Refinance",
  },

  {
    slug: "what-is-pmi",
    title: "What Is PMI? Private Mortgage Insurance Explained",
    metaTitle: "What Is PMI? Private Mortgage Insurance Explained — When You Need It & How to Cancel | HCMG",
    metaDescription:
      "PMI explained: what private mortgage insurance costs, when it's required, how it differs from FHA MIP, and the 4 ways to get rid of it. Harris Capital Mortgage Group.",
    category: "Buying a Home",
    readTime: 5,
    publishedAt: "2024-09-01",
    headline: "What Is PMI? Private Mortgage Insurance, Explained",
    intro:
      "PMI — private mortgage insurance — is one of the most misunderstood costs of buying a home. Some buyers are blindsided by it; others avoid it unnecessarily by making a larger down payment than they need to. This guide explains what it is, what it costs, when it's actually required, and how to eliminate it.",
    sections: [
      {
        heading: "What Is PMI?",
        body: [
          "PMI is insurance that protects the lender — not the borrower — if the borrower defaults on the loan. Despite paying for it, the buyer has no direct benefit from the policy.",
          "Lenders require PMI when the borrower puts down less than 20% on a conventional loan. The rationale: loans with less equity have a statistically higher default rate, so the lender offsets the risk by requiring insurance coverage.",
          "PMI is specific to conventional loans. FHA loans have their own version — called Mortgage Insurance Premium (MIP) — which works differently and costs more in most scenarios.",
        ],
      },
      {
        heading: "How Much Does PMI Cost?",
        body: [
          "PMI typically costs 0.2% to 2% of the original loan amount per year, divided into monthly payments added to your mortgage.",
          "The exact rate depends on: loan-to-value ratio (lower LTV = lower PMI), credit score (higher score = lower PMI), loan term, and the specific PMI provider.",
          "Example: On a $350,000 loan with 5% down and a 720 credit score, PMI might be ~0.6% annually = $2,100/year = $175/month added to your payment.",
          "PMI rates improve significantly as your down payment increases from 5% toward 20%.",
        ],
      },
      {
        heading: "PMI vs. FHA MIP — Key Differences",
        body: [
          "This comparison matters because the right loan choice for borderline borrowers often hinges on it:",
          "PMI (conventional): Cancellable once you reach 20% equity. Rate improves with better credit. Not required at all with 20%+ down.",
          "FHA MIP: Required regardless of down payment. For loans originated since 2013 with less than 10% down, MIP lasts for the life of the loan — the only exit is refinancing into a conventional loan.",
          "For a borrower with a 680 credit score and 5% down: FHA MIP will likely be more expensive long-term because it doesn't cancel. A conventional loan with PMI may be cheaper within 5–7 years even if the initial rate is slightly higher.",
        ],
      },
      {
        heading: "4 Ways to Get Rid of PMI",
        body: [
          "1. Wait for automatic cancellation: Federal law (the Homeowners Protection Act) requires lenders to automatically cancel PMI when your loan balance reaches 78% of the original purchase price — based on the original amortization schedule. You don't have to do anything.",
          "2. Request cancellation at 80% LTV: Once your balance reaches 80% of the original purchase price (not current market value), you can request cancellation in writing. The lender must comply if you're current on payments and meet lender requirements.",
          "3. Reappraisal based on appreciation: If your home has appreciated significantly, you may be able to request a new appraisal and cancel PMI based on the current LTV. Most lenders require being at least 2 years into the loan and may charge an appraisal fee.",
          "4. Refinance into a conventional loan with 20%+ equity: Refinancing eliminates the old loan entirely. If your current value supports a new loan at 80% LTV or below, the new loan will have no PMI.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is PMI tax-deductible?",
        a: "The PMI tax deduction expired and has had an inconsistent history in Congress. Check current tax law or consult a tax advisor for the status in the current tax year. Mortgage interest deductions are separate and generally available if you itemize deductions.",
      },
      {
        q: "Can I pay PMI upfront instead of monthly?",
        a: "Yes — some lenders offer single-premium PMI, where you pay the full PMI cost at closing in exchange for no monthly PMI payment. It can make sense if you have closing cost assistance from the seller but expect to keep the loan long-term. Ask your loan officer to compare both options.",
      },
      {
        q: "Does PMI protect me if I lose my job?",
        a: "No. PMI protects the lender, not the borrower. It covers the lender's loss if you default and the foreclosure sale doesn't recover the full loan balance. It provides you no benefit or coverage for job loss, disability, or death.",
      },
    ],
    relatedSlugs: ["fha-loan-requirements", "how-much-mortgage-can-i-afford", "when-to-refinance-your-mortgage"],
    loanType: "Conventional Loan",
  },

  {
    slug: "mortgage-pre-approval-vs-pre-qualification",
    title: "Pre-Approval vs. Pre-Qualification",
    metaTitle: "Mortgage Pre-Approval vs. Pre-Qualification — What's the Difference? | HCMG",
    metaDescription:
      "Pre-approval and pre-qualification are not the same thing. Learn what each means, which one sellers actually respect, and why getting the right one first saves weeks in a competitive market.",
    category: "Buying a Home",
    readTime: 5,
    publishedAt: "2024-09-01",
    headline: "Pre-Approval vs. Pre-Qualification — Why the Difference Matters in a Competitive Market",
    intro:
      "In a competitive housing market, the gap between a pre-qualification and a pre-approval isn't just semantic — it can mean the difference between having your offer accepted and watching the home go to someone else. Here's exactly what each means, what documentation is required, and which one you need before making an offer.",
    sections: [
      {
        heading: "What Is Pre-Qualification?",
        body: [
          "A pre-qualification is an informal estimate of how much you might be able to borrow, based on information you self-report — income, assets, debts — with no verification.",
          "It typically involves no hard credit pull, no document review, and no underwriting. A lender (or a calculator) takes your numbers at face value and estimates a range.",
          "What it's good for: Early planning. Getting a ballpark before you start seriously shopping. Understanding where you might stand.",
          "What it is not: A commitment from the lender. Sellers and listing agents see pre-qualification letters as weak — they know nothing has been verified.",
        ],
      },
      {
        heading: "What Is Pre-Approval?",
        body: [
          "A pre-approval is a formal credit decision based on verified documentation. The lender has reviewed your credit report (hard pull), income documents, bank statements, and employment history.",
          "After that review, the lender issues a pre-approval letter stating they are willing to lend up to a specific amount — subject to property appraisal and final underwriting.",
          "What makes it credible: The heavy lifting has been done. Sellers and agents know that a buyer with a lender-verified pre-approval is far less likely to fall through than one with just a pre-qual.",
          "Time to get it: Usually 1–3 business days if you have your documents ready.",
        ],
      },
      {
        heading: "What Documents Do You Need?",
        body: [
          "For pre-approval, prepare:",
          "Income: Last 2 years of W-2s or 1099s, last 2 years of tax returns (especially for self-employed), last 30 days of pay stubs",
          "Assets: Last 2–3 months of bank statements (all accounts), investment and retirement account statements",
          "Identity: Government-issued ID, Social Security number",
          "Debts: Your lender will pull a credit report showing your debts — you don't need to gather these separately",
          "Having these ready before you start the process cuts turnaround time significantly.",
        ],
      },
      {
        heading: "Fully Underwritten Pre-Approval",
        body: [
          "Some lenders offer a step beyond standard pre-approval: a fully underwritten pre-approval (sometimes called a credit approval or TBD approval). In this scenario, an actual underwriter reviews your file — the only remaining condition is the specific property.",
          "This is the strongest possible pre-approval. In a multiple-offer situation, a fully underwritten pre-approval can carry as much weight as a cash offer.",
          "Ask your HCMG loan officer about this option if you're shopping in a competitive market.",
        ],
      },
      {
        heading: "Does Pre-Approval Affect My Credit Score?",
        body: [
          "A single mortgage pre-approval generates one hard inquiry — typically a 5–10 point temporary dip in your credit score.",
          "If you shop multiple lenders, credit scoring models (FICO and VantageScore) treat multiple mortgage inquiries within a 14–45 day window as a single inquiry. You won't be penalized for getting quotes from 3–4 lenders if you do it within that window.",
          "This is important: comparing rates across lenders is the single best way to reduce your borrowing cost. Don't let fear of a credit impact stop you from shopping.",
        ],
      },
    ],
    faqs: [
      {
        q: "How long is a pre-approval valid?",
        a: "Most lenders issue pre-approvals valid for 60–90 days. After that, your income and credit may need to be re-verified. If you haven't found a home within that window, contact your loan officer to refresh the letter — it's usually quick since your file is already on record.",
      },
      {
        q: "Will I definitely get the loan after pre-approval?",
        a: "Pre-approval is conditional — the final loan is subject to the property appraisal, title search, and a final review of your financial situation at closing. Don't make any major financial changes after pre-approval (new debt, job change, large withdrawals) without checking with your loan officer first.",
      },
      {
        q: "Can I make an offer without pre-approval?",
        a: "You can, but sellers in most markets won't take you seriously without it — particularly if they have competing offers. In hot markets, some sellers won't even allow showings without proof of pre-approval. Getting pre-approved before you start touring homes is almost always the right move.",
      },
    ],
    relatedSlugs: ["how-much-mortgage-can-i-afford", "fha-loan-requirements", "first-time-homebuyer-programs"],
    loanType: "Conventional Loan",
  },

  // ── Article 8 ──────────────────────────────────────────────────────────────
  {
    slug: "how-to-calculate-mortgage-payment",
    title: "How to Calculate a Mortgage Payment",
    metaTitle: "How to Calculate a Mortgage Payment — Formula, Examples & Calculator | HCMG",
    metaDescription:
      "Learn exactly how to calculate a mortgage payment — the formula, step-by-step examples for different loan types, and a free calculator. Includes PITI, FHA MIP, and PMI. Harris Capital Mortgage Group.",
    category: "Buying a Home",
    readTime: 6,
    publishedAt: "2024-10-01",
    headline: "How to Calculate a Mortgage Payment — Formula, Examples & Free Calculator",
    intro:
      "Knowing how to calculate a mortgage payment before you apply puts you in control. You'll understand exactly what drives your monthly cost, how the math changes with different loan types, and where a lender can make a difference. This guide walks through the formula, shows worked examples, and explains every line item in your payment.",
    sections: [
      {
        heading: "The Basic Mortgage Payment Formula (P&I Only)",
        body: [
          "The principal and interest portion of your mortgage payment uses the standard amortization formula:",
          "M = P × [r(1+r)^n] ÷ [(1+r)^n − 1]",
          "Where: M = monthly payment, P = loan amount (principal), r = monthly interest rate (annual rate ÷ 12), n = total number of payments (loan term in years × 12)",
          "Example: $340,000 loan, 6.5% rate, 30-year term. r = 6.5% ÷ 12 = 0.5417%. n = 360 payments. M = $2,149/month for principal and interest.",
          "This formula gives you the P&I only — your actual monthly payment will be higher once you add taxes, insurance, and mortgage insurance.",
        ],
      },
      {
        heading: "Full PITI Payment — What Gets Added",
        body: [
          "Your real monthly payment includes four components, which is why lenders use the acronym PITI:",
          "P — Principal: The portion that reduces your loan balance. In early years, this is the smallest slice.",
          "I — Interest: The cost of borrowing. In early years, this is the largest slice — over time the ratio flips as you build equity.",
          "T — Taxes: Property taxes, typically divided by 12 and collected monthly into an escrow account. Varies by county — commonly 0.5% to 2% of home value per year.",
          "I — Insurance: Homeowner's insurance, also escrowed monthly. Roughly 0.25% to 0.5% of home value per year.",
          "Example: $340,000 loan at 6.5% for 30 years. P&I = $2,149. Taxes = $354/mo. Insurance = $142/mo. Total PITI = $2,645/month.",
        ],
      },
      {
        heading: "FHA Loan Payment Calculation",
        body: [
          "FHA loans add a monthly Mortgage Insurance Premium (MIP) to the PITI calculation.",
          "FHA MIP = (Loan amount × 0.55%) ÷ 12 for most 30-year loans with less than 10% down.",
          "Example: $325,000 FHA loan (3.5% down on $337,000 home) at 6.75% for 30 years. P&I = $2,108. Taxes = $337/mo. Insurance = $126/mo. MIP = $149/mo. Total = $2,720/month.",
          "Unlike PMI on conventional loans, FHA MIP cannot be cancelled if your down payment was less than 10% — it lasts for the life of the loan. This is why many buyers with improving credit scores refinance out of FHA once they reach 20% equity.",
        ],
      },
      {
        heading: "Conventional Loan with PMI",
        body: [
          "Conventional loans with less than 20% down require Private Mortgage Insurance (PMI).",
          "PMI rates typically range from 0.2% to 1.5% of the loan amount per year depending on credit score and LTV ratio.",
          "Example: $360,000 conventional loan (10% down on $400,000 home) at 6.875% for 30 years. P&I = $2,364. Taxes = $400/mo. Insurance = $150/mo. PMI (~0.8%) = $240/mo. Total = $3,154/month.",
          "PMI cancels automatically when your loan balance reaches 78% of the original purchase price. Unlike FHA MIP, you can also request cancellation at 80% LTV.",
        ],
      },
      {
        heading: "How Loan Term Affects Your Payment",
        body: [
          "The loan term has a dramatic effect on your monthly payment and total interest paid:",
          "30-year loan: Lower monthly payment, more total interest. Best for: buyers maximizing monthly cash flow.",
          "15-year loan: Higher monthly payment (roughly 40–50% more), but dramatically less total interest. Best for: buyers who want to build equity faster and pay less overall.",
          "Example on $300,000 at 6.5%: 30-year = $1,896/mo, total interest = $382,600. 15-year = $2,613/mo, total interest = $170,250. The 15-year saves $212,350 in interest — but costs $717 more per month.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much is a mortgage payment on a $300,000 house?",
        a: "On a $300,000 home with 20% down ($60,000), a 30-year loan at 7% gives a P&I payment of about $1,596/month. Add estimated taxes ($300/mo) and insurance ($113/mo) for a total PITI of roughly $2,009/month. With 3.5% FHA down and 6.75% rate, the payment would be higher due to a larger loan and MIP.",
      },
      {
        q: "What is the monthly payment on a $400,000 mortgage?",
        a: "A $400,000 mortgage at 7% for 30 years has a principal and interest payment of $2,661/month. Total PITI including taxes and insurance runs approximately $3,200–$3,400/month depending on your location and insurance costs.",
      },
      {
        q: "How do I lower my monthly mortgage payment?",
        a: "The four ways to lower your payment: (1) Make a larger down payment to reduce the loan amount. (2) Buy at a lower price point. (3) Secure a lower interest rate through better credit or by shopping lenders. (4) Extend the loan term — though this increases total interest paid. Refinancing can also lower your payment if rates have dropped since you originated.",
      },
    ],
    relatedSlugs: ["how-much-mortgage-can-i-afford", "what-is-pmi", "mortgage-pre-approval-vs-pre-qualification"],
    loanType: "Conventional Loan",
  },

  // ── Article 9 ──────────────────────────────────────────────────────────────
  {
    slug: "how-much-down-payment-do-i-need",
    title: "How Much Down Payment Do I Need?",
    metaTitle: "How Much Down Payment Do I Need to Buy a House? | HCMG",
    metaDescription:
      "Down payment requirements by loan type: FHA (3.5%), conventional (3–20%), VA (0%), USDA (0%). Learn how your down payment affects your rate, PMI, and monthly payment. Free down payment calculator.",
    category: "Buying a Home",
    readTime: 6,
    publishedAt: "2024-10-01",
    headline: "How Much Down Payment Do I Need to Buy a House?",
    intro:
      "The down payment is one of the biggest decisions in a home purchase — and one of the most misunderstood. You don't always need 20%. In many cases, waiting to save 20% costs you more in rent than you'd save on PMI. Here's the real breakdown by loan type, what your down payment actually affects, and how to choose the right amount for your situation.",
    sections: [
      {
        heading: "Down Payment Requirements by Loan Type",
        body: [
          "FHA Loan: 3.5% minimum with 580+ credit score. 10% minimum with 500–579 credit score. This is the most accessible option for buyers with lower scores or limited savings.",
          "Conventional Loan: As low as 3% for first-time buyers through programs like Fannie Mae HomeReady and Freddie Mac Home Possible. Standard minimum is 5%. Below 20% triggers PMI.",
          "VA Loan: 0% down for eligible veterans, active-duty service members, and surviving spouses. No monthly mortgage insurance. One of the best loan programs available.",
          "USDA Loan: 0% down for eligible rural and suburban properties. Income limits apply. The geographic eligibility map covers more areas than most buyers expect.",
          "Jumbo Loan: Typically 10–20% minimum, depending on lender and loan amount. No government backing means lenders set their own standards.",
          "Down Payment Assistance (DPA): Many state and local programs offer grants or forgivable second loans to cover the down payment for income-qualifying buyers. These stack on top of FHA or conventional loans.",
        ],
      },
      {
        heading: "What Your Down Payment Actually Affects",
        body: [
          "Loan amount: Higher down payment = smaller loan = lower monthly payment and less total interest.",
          "PMI: Conventional loans with less than 20% down require PMI, typically $50–$250/month. Reach 20% equity and PMI cancels.",
          "Interest rate: Larger down payments often qualify for slightly better rates. The difference is usually 0.125%–0.5%.",
          "Cash reserves: Many lenders require 2–6 months of mortgage payments in reserves after closing. Tying up all your cash in the down payment can be a problem.",
          "Monthly payment: On a $400,000 home at 7%, the difference between 3% down and 20% down is roughly $500/month (before PMI savings).",
        ],
      },
      {
        heading: "The '20% Myth' — Should You Wait?",
        body: [
          "The idea that you must put 20% down to buy a home is a myth. It originated when 20% was the standard to avoid mortgage insurance. Today, multiple loan programs allow 0–5% down.",
          "The math on waiting: If you're paying $2,000/month in rent and it would take 3 years to save an additional 10% down on a $400,000 home ($40,000), that's $72,000 in rent paid to avoid perhaps $150/month in PMI. The break-even is never.",
          "When 20% down makes sense: If you can save it quickly without significantly delaying purchase, if your local market is cooling so appreciation isn't urgent, or if you have high income and want to minimize long-term interest costs.",
          "For most first-time buyers, buying sooner with 3.5% or 5% down and eliminating PMI through equity gains or refinancing is the smarter financial move.",
        ],
      },
      {
        heading: "Down Payment Assistance Programs",
        body: [
          "Every licensed state HCMG serves — FL, TX, GA, NV, CO, VA, DC, MD, CA, MS — has state-administered DPA programs for eligible buyers.",
          "Common structures: Forgivable second mortgage (after 3–5 years it's forgiven), deferred payment second mortgage (no payment until sale/refinance), grant (free money, no repayment).",
          "Typical benefit: $7,500–$25,000 toward down payment or closing costs.",
          "Income limits: Usually 80–120% of Area Median Income (AMI). Many programs also require completion of a homebuyer education course.",
          "HCMG loan officers are trained in DPA programs in every state we serve. Ask us about what's available in your county.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I use gift money for a down payment?",
        a: "Yes — all major loan programs allow gift funds for the down payment with proper documentation. FHA allows 100% gift funds. Conventional loans allow gift funds from family members. The gift must be documented with a gift letter stating it is not a loan. There must be no expectation of repayment.",
      },
      {
        q: "What is the minimum down payment for a first-time buyer?",
        a: "First-time buyers have access to the lowest down payment requirements: 0% with VA or USDA loans if eligible, 3% with Fannie Mae HomeReady or Freddie Mac Home Possible conventional programs, and 3.5% with FHA. Down payment assistance can further reduce or eliminate the out-of-pocket amount.",
      },
      {
        q: "Does a bigger down payment always make sense?",
        a: "Not always. A larger down payment reduces your loan balance and can eliminate PMI, but it also reduces your liquid savings. If putting more down would deplete your emergency fund, a smaller down payment and paying PMI until you build equity may be the smarter financial choice. Your loan officer can run the numbers both ways.",
      },
    ],
    relatedSlugs: ["fha-loan-requirements", "first-time-homebuyer-programs", "how-to-calculate-mortgage-payment"],
    loanType: "Down Payment Assistance",
  },

  // ── Article 10 ─────────────────────────────────────────────────────────────
  {
    slug: "mortgage-amortization-explained",
    title: "Mortgage Amortization Explained",
    metaTitle: "Mortgage Amortization Explained — Schedule, Calculator & How It Works | HCMG",
    metaDescription:
      "What is mortgage amortization? How your payment splits between principal and interest, how to read an amortization schedule, and how to pay off your mortgage faster. Free amortization calculator included.",
    category: "Buying a Home",
    readTime: 6,
    publishedAt: "2024-10-01",
    headline: "Mortgage Amortization Explained — How Your Payment Splits Over Time",
    intro:
      "Every mortgage payment you make is split between paying down your loan balance (principal) and paying the lender for the use of their money (interest). But the ratio is not constant — it changes every single month over the life of the loan. Understanding amortization helps you make smarter decisions about prepayments, refinancing, and when to sell.",
    sections: [
      {
        heading: "What Is Amortization?",
        body: [
          "Amortization is the process of paying off a loan through regular, fixed payments over time. With a fully amortizing mortgage, every payment is identical — but the internal split between principal and interest shifts gradually.",
          "In the early months of a 30-year mortgage, roughly 80–85% of each payment goes to interest. By the final years, 95%+ goes to principal. The midpoint — where you're paying equal principal and interest — typically doesn't arrive until year 20 of a 30-year loan.",
          "This front-loading of interest is not a lender trick — it's the mathematical consequence of how compound interest works on a large balance.",
        ],
      },
      {
        heading: "How to Read an Amortization Schedule",
        body: [
          "An amortization schedule is a complete month-by-month table showing every payment over the life of your loan. Our mortgage calculator above has an interactive amortization schedule you can expand.",
          "Each row contains: Payment number, Payment amount (constant), Principal portion (increases each month), Interest portion (decreases each month), Remaining balance (decreases each month).",
          "Example: $300,000 loan at 6.5% for 30 years. Monthly P&I = $1,896. Payment 1: $1,321 interest / $575 principal / Balance $299,425. Payment 180 (year 15): $988 interest / $908 principal. Payment 360 (final): $10 interest / $1,886 principal.",
        ],
      },
      {
        heading: "Total Interest Cost — What You Actually Pay",
        body: [
          "The amortization schedule reveals a number that surprises most buyers: the total cost of a 30-year loan.",
          "Example: $300,000 at 6.5% for 30 years. Total payments = $682,560. Total interest paid = $382,560 — more than the original loan amount.",
          "At 7%: Total interest = $418,527. At 5%: Total interest = $279,767. This is why the interest rate matters so much — a 1% difference on a $300,000 loan costs or saves ~$60,000 over 30 years.",
          "The 15-year loan cuts total interest dramatically: Same $300,000 at 6.5% for 15 years pays ~$169,000 in interest — saving $213,000 vs. the 30-year.",
        ],
      },
      {
        heading: "How to Pay Off Your Mortgage Faster",
        body: [
          "Extra principal payments are applied directly to your balance and permanently reduce total interest. Even small prepayments have outsized long-term impact due to compounding.",
          "One extra payment per year: On a 30-year loan, this typically reduces the term by 4–5 years and saves tens of thousands in interest.",
          "Bi-weekly payments: Instead of 12 monthly payments, you make 26 half-payments — equivalent to 13 full payments per year. This alone typically cuts 4–6 years off a 30-year loan.",
          "Round up your payment: If your payment is $1,847, rounding up to $2,000 adds $153/month to principal — saving years of payments with no formal change to your loan terms.",
          "Important: Confirm with your lender that extra payments are applied to principal and not just credited as advance payments.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is negative amortization?",
        a: "Negative amortization occurs when your monthly payment is less than the interest owed, causing your loan balance to grow instead of shrink. This was common in adjustable-rate mortgages before 2008. Modern qualified mortgages generally cannot negatively amortize. If you hear this term, be cautious about that loan product.",
      },
      {
        q: "Does refinancing reset amortization?",
        a: "Yes. When you refinance, you take out a new loan — typically for the remaining balance at a new rate and term. Your amortization starts over. If you refinance a 30-year loan after 10 years into another 30-year loan, you're extending your payoff date by 10 years. Many homeowners refinance into a 15 or 20-year term specifically to avoid this.",
      },
      {
        q: "How does extra principal payment affect amortization?",
        a: "Any extra principal payment reduces your outstanding balance, which reduces the interest charged in every subsequent month, which increases the principal portion of every future payment. The effect compounds — a $200 extra payment in month 1 saves more than $200 in total interest because the benefit compounds across the remaining term.",
      },
    ],
    relatedSlugs: ["how-to-calculate-mortgage-payment", "when-to-refinance-your-mortgage", "how-much-mortgage-can-i-afford"],
  },

  // ── Article 11 ─────────────────────────────────────────────────────────────
  {
    slug: "how-to-apply-for-a-mortgage-online",
    title: "How to Apply for a Mortgage Online",
    metaTitle: "How to Apply for a Mortgage Online — Step-by-Step Guide | HCMG",
    metaDescription:
      "Step-by-step guide to applying for a mortgage online: documents needed, what to expect, how long it takes, and how to avoid common mistakes. Apply for an FHA, VA, or conventional loan with HCMG.",
    category: "Buying a Home",
    readTime: 5,
    publishedAt: "2024-10-01",
    headline: "How to Apply for a Mortgage Online — Step-by-Step",
    intro:
      "Applying for a mortgage online has become the norm — most buyers can go from application to pre-approval in under 48 hours without ever visiting a branch. Here's exactly what the online mortgage application process looks like, what documents you'll need to have ready, and what happens after you submit.",
    sections: [
      {
        heading: "Step 1 — Get Pre-Approved Before You Shop",
        body: [
          "Before applying for a mortgage on a specific property, get pre-approved. A pre-approval tells you how much you can borrow, shows sellers you're a serious buyer, and identifies any issues before you're under contract.",
          "The pre-approval application asks for: income (employment type, employer, salary), assets (bank accounts, retirement accounts), debts (car loans, student loans, credit cards), and permission to pull your credit.",
          "A hard credit inquiry is required for pre-approval. It will cause a small, temporary dip in your score — typically 5–10 points. Multiple mortgage inquiries within a 45-day window count as a single inquiry for scoring purposes, so shopping multiple lenders doesn't hurt you.",
        ],
      },
      {
        heading: "Step 2 — Gather Your Documents First",
        body: [
          "Having documents ready before you start dramatically speeds up the process. Standard requirements:",
          "Income documents: Last 2 years of W-2s or 1099s, 2 years of federal tax returns (required for self-employed, rental income, or commission income over 25% of total income), last 30 days of pay stubs, 2 years of business tax returns if self-employed.",
          "Asset documents: 2–3 months of bank statements for all accounts, retirement and investment account statements, documentation of any large deposits (lenders must verify the source).",
          "Identity: Government-issued photo ID, Social Security number.",
          "Property documents (after you're under contract): Purchase contract, homeowner's association documents if applicable, contact info for the listing agent.",
        ],
      },
      {
        heading: "Step 3 — Complete the Online Application",
        body: [
          "The standard mortgage application is the Uniform Residential Loan Application (URLA), also called the 1003 form. Most online lenders present this as a guided digital form taking 15–30 minutes to complete.",
          "You'll provide: personal information, employment history (2 years), income details, asset information, property information (if you have a specific home in mind), and loan preferences (loan type, down payment, term).",
          "With HCMG, you can start your application at hcmgloans.com/get-started and a licensed loan officer will follow up within one business day to complete the process and answer any questions.",
        ],
      },
      {
        heading: "What Happens After You Apply",
        body: [
          "Within 3 business days of receiving your application, your lender must provide a Loan Estimate — a standardized three-page document showing your estimated rate, monthly payment, closing costs, and loan terms.",
          "Processing (1–2 weeks): Your loan officer assembles your file. Underwriting (1–3 weeks): An underwriter reviews your complete file and issues an approval, conditional approval, or denial.",
          "Conditional approval is the most common outcome — it means you're approved subject to satisfying specific conditions (additional documentation, letters of explanation, appraisal, etc.).",
          "Clear to close: Once all conditions are met, your loan is cleared to close. Closing is scheduled — typically 30–45 days from application for a purchase, 15–30 days for a refinance.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I apply for a mortgage online and get same-day approval?",
        a: "Some lenders advertise instant or same-day approvals using automated underwriting systems. What you'll typically get same-day is an automated pre-approval — not a full underwriting approval. A complete verified approval still requires document review, which takes 1–3 business days at minimum. Be skeptical of any lender claiming full approval without document verification.",
      },
      {
        q: "Does applying for a mortgage hurt your credit score?",
        a: "Yes, but minimally. A hard credit inquiry for a mortgage typically reduces your score by 5–10 points temporarily. More importantly, multiple mortgage inquiries within a 45-day window are treated as a single inquiry under FICO scoring — so you can shop multiple lenders without stacking hard pulls.",
      },
      {
        q: "What credit score do I need to apply for a mortgage?",
        a: "Minimum credit scores by loan type: FHA loans — 580 for 3.5% down, 500 for 10% down. Conventional loans — typically 620 minimum, best rates at 740+. VA loans — no official minimum, but most lenders require 580–620. USDA loans — typically 640. A higher credit score means better rates, lower PMI, and more options.",
      },
    ],
    relatedSlugs: ["mortgage-pre-approval-vs-pre-qualification", "fha-loan-requirements", "how-much-down-payment-do-i-need"],
    loanType: "FHA Loan",
  },

  // ── Article 12 ─────────────────────────────────────────────────────────────
  {
    slug: "conventional-loan-requirements",
    title: "Conventional Loan Requirements",
    metaTitle: "Conventional Loan Requirements 2024 — Credit Score, Down Payment & DTI | HCMG",
    metaDescription:
      "Complete guide to conventional loan requirements: minimum credit score (620), down payment (3–20%), debt-to-income ratio, income documentation, and how conventional compares to FHA. HCMG · NMLS# 1918223.",
    category: "Buying a Home",
    readTime: 7,
    publishedAt: "2024-10-01",
    headline: "Conventional Loan Requirements — Credit, Down Payment, DTI & More",
    intro:
      "Conventional loans are the most common mortgage in America — and for good reason. They offer flexibility in property types, no upfront mortgage insurance, and cancellable PMI. But they do have stricter qualification standards than government-backed loans. This guide covers everything you need to qualify.",
    sections: [
      {
        heading: "Credit Score Requirements",
        body: [
          "Minimum credit score: 620 for most conventional lenders. Best rates typically require 740+.",
          "Score ranges and what they mean: 620–639: Marginal — you may qualify but expect higher rates and stricter scrutiny. 640–679: Fair — qualified but rates will be above average. 680–739: Good — competitive rates, normal documentation. 740+: Excellent — best available rates, smoothest process.",
          "Conventional loans are credit-score-sensitive in a way FHA loans are not. A 760 score versus a 680 score can result in a rate difference of 0.5–0.75%, which on a $400,000 loan is roughly $120–$180/month.",
          "Multiple borrowers: If applying with a co-borrower, the lender typically uses the lower middle score of both borrowers for qualification purposes.",
        ],
      },
      {
        heading: "Down Payment Requirements",
        body: [
          "Minimum down payment: 3% for first-time buyers through Fannie Mae HomeReady and Freddie Mac Home Possible programs. 5% for standard conventional with no income limits. 20% to avoid PMI entirely.",
          "Below 20% down triggers PMI: Typically 0.2%–1.5% of the loan amount per year, added to your monthly payment. PMI cancels when your balance reaches 80% of the original purchase price — automatically at 78%.",
          "Investment properties: 15–25% down required. No HomeReady/Home Possible eligibility.",
          "Second homes: 10% minimum down payment.",
        ],
      },
      {
        heading: "Debt-to-Income (DTI) Ratio",
        body: [
          "DTI ratio is your total monthly debt payments divided by your gross monthly income. Conventional loans allow up to 45% DTI in most cases, with strong compensating factors allowing up to 50%.",
          "Front-end DTI (housing only): Your proposed monthly PITI payment ÷ gross monthly income. Generally should be below 28%.",
          "Back-end DTI (all debts): All monthly minimum debt payments (mortgage, car, student loans, credit cards, etc.) ÷ gross monthly income. Max 45–50%.",
          "Example: $8,000/mo gross income. Max total debt payments at 45% = $3,600/mo. If your proposed mortgage PITI is $2,400 and you have $600 in other debts = $3,000 total = 37.5% DTI. Well within range.",
        ],
      },
      {
        heading: "Income and Employment Requirements",
        body: [
          "Employment history: 2 years of continuous employment in the same field preferred. Job changes within the same industry are generally acceptable. Gaps of more than 30 days require explanation.",
          "Self-employed borrowers: Must provide 2 years of business and personal tax returns. Income is calculated based on net income after deductions — not gross revenue.",
          "Other income sources accepted: Rental income (with 2-year history and current lease), investment income (dividends, interest), Social Security/disability, retirement/pension, alimony/child support (if ongoing).",
          "Income documentation: Most recent 30 days of pay stubs, 2 years of W-2s, 2 years of federal tax returns for self-employed or complex income situations.",
        ],
      },
      {
        heading: "Conventional vs. FHA — How to Choose",
        body: [
          "Choose conventional if: You have a 680+ credit score and can put at least 5–10% down. PMI will be lower than FHA MIP for good-credit borrowers. And PMI cancels — FHA MIP doesn't (for most loans).",
          "Choose FHA if: Credit score is below 660, you're putting down less than 5%, or you have higher debt levels. FHA is more forgiving on these fronts.",
          "Break-even analysis: For a borrower with 5% down and a 680 score, FHA MIP vs. conventional PMI: FHA MIP is often higher per month but FHA rates may be lower. Run both scenarios with your loan officer — the 5-year total cost is what matters.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the debt-to-income ratio for a conventional loan?",
        a: "The maximum DTI for a conventional loan is typically 45%, with strong compensating factors allowing up to 50%. This means your total monthly debt payments (including the proposed mortgage) cannot exceed 45% of your gross monthly income. Front-end DTI (housing costs alone) should ideally be below 28%.",
      },
      {
        q: "Can I get a conventional loan with a 580 credit score?",
        a: "Generally no. Conventional loans require a minimum 620 credit score. Below 620, FHA is the primary option for buyers who want to buy now. If you're at 580–619, working with a credit counselor to improve your score by 40 points before applying for a conventional loan is often worth the wait — you'll get a significantly better rate.",
      },
      {
        q: "Is a conventional loan better than FHA?",
        a: "It depends on your profile. For buyers with 680+ credit and 5%+ down payment, conventional is usually better long-term because PMI cancels. For buyers with lower credit or smaller down payments, FHA may be the only or best option. There is no universally 'better' option — it's always borrower-specific.",
      },
    ],
    relatedSlugs: ["fha-loan-requirements", "what-is-pmi", "how-much-down-payment-do-i-need"],
    loanType: "Conventional Loan",
  },

  // ── Article 13 ─────────────────────────────────────────────────────────────
  {
    slug: "how-long-does-mortgage-approval-take",
    title: "How Long Does Mortgage Approval Take?",
    metaTitle: "How Long Does Mortgage Approval Take? Timeline & What Speeds It Up | HCMG",
    metaDescription:
      "From application to closing, how long does mortgage approval take? Typical timelines for pre-approval (1–3 days), full approval (2–4 weeks), and closing (30–45 days). What slows it down — and how to speed it up.",
    category: "Buying a Home",
    readTime: 5,
    publishedAt: "2024-10-01",
    headline: "How Long Does Mortgage Approval Take? Timelines, Stages & Tips to Speed It Up",
    intro:
      "One of the most common questions from first-time buyers: how long does the mortgage process actually take? The short answer is 30–45 days from application to closing for a purchase, but there are several stages — and your actions at each stage can either accelerate or delay the process significantly.",
    sections: [
      {
        heading: "Stage 1 — Pre-Approval (1–3 Business Days)",
        body: [
          "Pre-approval is the fastest stage if you have your documents ready. You submit your application, provide income and asset documents, and the lender pulls your credit. An automated underwriting system runs your file within minutes.",
          "Typical turnaround: 24–72 hours. Faster if you use an online lender with automated document processing, slower if you're self-employed or have complex income.",
          "What can slow this down: Missing documents, unverifiable income, significant credit issues that require manual review.",
          "What you get: A pre-approval letter stating the maximum loan amount you're approved for. This is what you show sellers when making an offer.",
        ],
      },
      {
        heading: "Stage 2 — Under Contract to Clear to Close (21–30 Days)",
        body: [
          "Once you're under contract on a specific property, the full approval process begins. This has several sub-stages:",
          "Loan processing (3–7 days): Your loan officer compiles a complete file — all documents, the purchase contract, and orders an appraisal.",
          "Appraisal (7–14 days): An independent appraiser visits the property and prepares a report. This is usually the longest single step. In busy markets, appraisers are backed up.",
          "Underwriting (3–7 days): The underwriter reviews everything. They either approve, conditionally approve (most common), or deny the loan.",
          "Satisfying conditions (3–7 days): You respond to the underwriter's requests — letters of explanation, additional documents, etc. Back-and-forth rounds add time.",
          "Clear to close: The final approval. Closing can be scheduled.",
        ],
      },
      {
        heading: "Stage 3 — Closing (1–3 Days After CTC)",
        body: [
          "After Clear to Close, the closing attorney or title company prepares the Closing Disclosure — a final itemized list of all closing costs and loan terms. You must receive this at least 3 business days before closing.",
          "Closing itself takes 1–2 hours. You sign a stack of documents, pay closing costs and any remaining down payment, and receive the keys.",
          "Total typical timeline: 30–45 days from application to closing. Some lenders advertise 21-day closings — possible but requires perfect documentation and no surprises.",
        ],
      },
      {
        heading: "What Slows Down Mortgage Approval",
        body: [
          "Missing or incomplete documents: The #1 cause of delays. Respond to lender requests the same day.",
          "Appraisal issues: Low appraisal requires renegotiation with the seller. Appraisal backlogs in busy markets add 1–2 weeks.",
          "Credit issues discovered during processing: Recent collections, late payments, or a score drop (from a new inquiry or account) can trigger underwriting delays.",
          "Large unverified deposits: Any significant deposit in your bank statements will require a paper trail. Avoid moving money around in the 60–90 days before and during your application.",
          "Title issues: Cloud on title, liens, unpermitted additions — these are seller issues but can add 1–4 weeks to resolve.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can a mortgage be approved in 1 week?",
        a: "Pre-approval can happen in 1–3 days. Full approval from application to clear-to-close in 1 week is rare but possible in ideal circumstances: clean file, all documents ready, no appraisal needed (refinance), and expedited underwriting. Most purchases cannot close in under 21 days due to the appraisal timeline alone.",
      },
      {
        q: "What happens after mortgage approval?",
        a: "After final approval (Clear to Close), the closing is scheduled. You'll receive a Closing Disclosure at least 3 business days before closing showing final numbers. At closing, you sign loan documents, pay your down payment and closing costs, and receive the keys (for a purchase) or funds (for a refinance).",
      },
      {
        q: "Can my mortgage be denied after approval?",
        a: "Yes, though it's uncommon. A lender can reverse an approval if something material changes between approval and closing: you take on new debt (like financing a car), your employment changes, a credit issue surfaces, the property appraises below purchase price, or title issues are found. Avoid major financial changes — new credit, job changes, large purchases — between approval and closing.",
      },
    ],
    relatedSlugs: ["mortgage-pre-approval-vs-pre-qualification", "how-to-apply-for-a-mortgage-online", "conventional-loan-requirements"],
  },

  // ── Article 14 ─────────────────────────────────────────────────────────────
  {
    slug: "closing-costs-explained",
    title: "Closing Costs Explained",
    metaTitle: "Closing Costs Explained — What You'll Pay and How to Reduce Them | HCMG",
    metaDescription:
      "What are closing costs on a house? Typical closing costs are 2–5% of the loan amount. This guide breaks down every fee, which are negotiable, who pays what, and how to reduce your closing costs.",
    category: "Buying a Home",
    readTime: 7,
    publishedAt: "2024-10-01",
    headline: "Closing Costs Explained — Every Fee, Who Pays, and How to Reduce Them",
    intro:
      "Closing costs are the fees and expenses you pay to finalize a mortgage, on top of your down payment. Most buyers are surprised by the total — typically 2–5% of the loan amount. On a $400,000 purchase, that's $8,000–$20,000. This guide breaks down every line item, explains who is required to pay what, and shows you which costs can be negotiated or eliminated.",
    sections: [
      {
        heading: "How Much Are Closing Costs?",
        body: [
          "Closing costs for a purchase typically run 2–5% of the loan amount, not the purchase price. The exact amount depends on your loan type, lender, state, and whether you roll costs into the loan or pay upfront.",
          "Example: $380,000 loan. At 3% = $11,400 in closing costs. At 4% = $15,200. At 5% = $19,000.",
          "Cash to close: The total you bring to closing includes both your down payment AND closing costs. For an FHA loan with 3.5% down on a $380,000 home, expect total cash to close of $19,000–$27,000 (down payment + closing costs).",
          "Refinances typically have lower closing costs than purchases: no title insurance on the seller side, no real estate commissions, and lower documentation costs.",
        ],
      },
      {
        heading: "Lender Fees (Your Lender Charges These)",
        body: [
          "Origination fee: The lender's charge for processing the loan. Typically 0–1% of the loan amount. Some lenders charge no origination fee but offer a slightly higher rate instead.",
          "Discount points: Optional prepaid interest to buy down your rate. 1 point = 1% of loan amount and typically reduces your rate by 0.25%. Only worth it if you keep the loan long-term.",
          "Underwriting fee: Lender's internal processing cost, typically $500–$1,000.",
          "Application fee: Some lenders charge $0–$500 upfront. Common with banks, less common with mortgage companies.",
        ],
      },
      {
        heading: "Third-Party Fees (Set by Service Providers)",
        body: [
          "Appraisal: $400–$700 for a single-family home. Required by the lender to verify property value. Paid upfront, not refundable if the deal falls through.",
          "Title search and title insurance: Title search (examining public records) typically $200–$400. Owner's title insurance (one-time premium protecting your ownership) typically $500–$1,500. Lender's title insurance (required, protects the lender) typically $300–$800.",
          "Attorney or escrow fee: In some states, a real estate attorney must oversee closing. $500–$1,500.",
          "Survey: Some states require a property survey. $300–$700.",
          "Home inspection: Not technically a closing cost (paid before going under contract), but typically $300–$600.",
        ],
      },
      {
        heading: "Prepaid Items and Escrow Setup",
        body: [
          "Prepaid items are not fees — they're costs you pay in advance at closing. They're often confused with closing costs.",
          "Prepaid homeowner's insurance: Typically 12 months paid upfront at closing.",
          "Prepaid mortgage interest: Interest from your closing date to the end of the month. If you close on the 15th, you prepay about 15 days of interest.",
          "Escrow impounds: 2–3 months of property taxes and insurance deposited into your escrow account at closing to fund the account.",
          "Total prepaids on a $400,000 purchase: Typically $4,000–$7,000.",
        ],
      },
      {
        heading: "How to Reduce Closing Costs",
        body: [
          "Seller concessions: Negotiate for the seller to cover some or all of your closing costs. In a buyer's market, this is common. FHA allows up to 6% seller concessions. Conventional allows 3–6% depending on down payment.",
          "Lender credits: Take a slightly higher rate in exchange for lender paying your closing costs. Effective if you plan to sell or refinance within 5 years before the rate cost outweighs the credit.",
          "Shop title and settlement services: The Loan Estimate lists services you can shop for. Getting competing quotes on title insurance and settlement services can save $500–$1,500.",
          "Time your closing: Closing at the end of the month minimizes prepaid interest (fewer days of interest to prepay).",
          "DPA programs: Down payment assistance programs often also cover closing costs for eligible buyers.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can closing costs be rolled into the loan?",
        a: "Yes, in some cases. For refinances, closing costs can typically be rolled into the new loan balance. For purchases, you can't directly roll costs in, but you can finance them indirectly via a lender credit (higher rate in exchange for the lender paying costs) or by negotiating seller concessions. Note that rolling costs in means you pay interest on them over the life of the loan.",
      },
      {
        q: "Who pays closing costs — buyer or seller?",
        a: "Both typically pay closing costs, but different ones. Buyers pay lender fees, their own title insurance, appraisal, and prepaid items. Sellers typically pay real estate agent commissions (the largest expense at 5–6% of sale price), transfer taxes, and the seller's title insurance policy. Sellers can also agree to pay some of the buyer's closing costs as a concession in the purchase contract.",
      },
      {
        q: "What is a Closing Disclosure?",
        a: "A Closing Disclosure (CD) is a federally required five-page document your lender must provide at least 3 business days before closing. It shows all final loan terms, monthly payment, and a complete itemized list of closing costs. Compare it carefully to your Loan Estimate — any significant changes should be questioned.",
      },
    ],
    relatedSlugs: ["how-much-down-payment-do-i-need", "how-to-apply-for-a-mortgage-online", "mortgage-pre-approval-vs-pre-qualification"],
    loanType: "Conventional Loan",
  },

  // ── Article 15 ─────────────────────────────────────────────────────────────
  {
    slug: "debt-to-income-ratio-mortgage",
    title: "Debt-to-Income Ratio for a Mortgage",
    metaTitle: "Debt-to-Income Ratio for a Mortgage — What Is DTI & How to Calculate It | HCMG",
    metaDescription:
      "What is debt-to-income ratio (DTI) for a mortgage? How to calculate your front-end and back-end DTI, maximum DTI by loan type, and how to lower your DTI before applying. Free DTI calculator.",
    category: "Buying a Home",
    readTime: 6,
    publishedAt: "2024-10-01",
    headline: "Debt-to-Income Ratio (DTI) for a Mortgage — How It Works and How to Improve Yours",
    intro:
      "Your debt-to-income ratio (DTI) is one of the most important numbers in your mortgage application — arguably more important than your credit score for determining how much you can borrow. Lenders use it to verify that you have enough income to comfortably handle a new mortgage payment. Here's how it works, what the limits are, and how to improve yours before you apply.",
    sections: [
      {
        heading: "What Is Debt-to-Income Ratio?",
        body: [
          "DTI is a simple ratio: your total monthly debt payments divided by your gross monthly income, expressed as a percentage.",
          "DTI = Total Monthly Debt Payments ÷ Gross Monthly Income × 100",
          "Example: $6,000/month gross income. Monthly debts: proposed mortgage PITI $1,800 + car loan $450 + student loan $200 + credit card minimums $150 = $2,600 total. DTI = $2,600 ÷ $6,000 = 43.3%.",
          "There are two types lenders evaluate: Front-end DTI (housing ratio) — just your proposed housing payment ÷ income. Back-end DTI (total ratio) — all monthly debts including housing ÷ income. Back-end DTI is the more important number for qualification.",
        ],
      },
      {
        heading: "Maximum DTI by Loan Type",
        body: [
          "Conventional: Maximum 45% back-end DTI. Up to 50% with strong compensating factors (high credit score, significant reserves).",
          "FHA: Maximum 43% back-end DTI by guideline, but most lenders allow up to 50% with automated approval. FHA is more flexible on DTI than conventional.",
          "VA: No official maximum DTI, but most lenders target below 41%. Higher DTI can be approved with sufficient residual income (a VA-specific calculation based on income remaining after all debts).",
          "USDA: Maximum 41% back-end DTI as a standard guideline, though exceptions exist.",
          "Front-end DTI guideline: While not always enforced, 28% is the traditional upper limit for housing costs alone. Exceeding 36–40% front-end DTI is a flag in manual underwriting.",
        ],
      },
      {
        heading: "What Counts as Debt in DTI Calculation",
        body: [
          "Lenders use the minimum monthly payment on each debt — not the balance.",
          "Included: Mortgage payments (including taxes and insurance), car loans, student loans (even deferred — typically 0.5–1% of balance per month), credit card minimum payments, personal loans, alimony and child support, co-signed loans (if you're the co-signer).",
          "Not included: Utilities, cell phone, insurance premiums, subscriptions, groceries — only contractual debt obligations appearing on your credit report.",
          "Student loans in deferment: Lenders are required to count a payment for deferred student loans, typically 0.5–1% of the outstanding balance per month, even if no payments are currently due.",
        ],
      },
      {
        heading: "How to Lower Your DTI Before Applying",
        body: [
          "Pay off or pay down small debts: Eliminating a $200/month car payment drops your DTI by $200 ÷ gross income. If your income is $7,000/month, that's a 2.9% DTI improvement.",
          "Avoid taking on new debt: No new car loans, no new credit cards, no co-signing anything in the 12 months before your mortgage application.",
          "Increase income: Document all income sources — overtime, part-time work, rental income (with a 2-year history), investment income. Ask for a raise or document a recent raise with an offer letter.",
          "Choose a less expensive property: A lower purchase price means a lower proposed monthly payment and a lower front-end DTI.",
          "Add a co-borrower: Adding a co-borrower with income and manageable debt can dramatically improve the combined DTI.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a good debt-to-income ratio for a mortgage?",
        a: "Below 36% is considered excellent — you'll qualify for virtually any loan at the best terms. 36–43% is good — qualifying for most loan programs. 43–50% is the upper range — possible with FHA or with strong compensating factors. Above 50% DTI is very difficult to get approved and requires exceptional circumstances.",
      },
      {
        q: "Does student loan debt affect buying a home?",
        a: "Yes. Student loans are counted in your DTI even if they're in deferment or income-based repayment. Lenders typically count 0.5–1% of your outstanding student loan balance as a monthly payment for DTI purposes. A $60,000 student loan balance adds $300–$600/month to your calculated debts. If your income supports it despite the student loans, you can still qualify.",
      },
      {
        q: "Can I get a mortgage with 50% DTI?",
        a: "It's possible but difficult. FHA loans can sometimes be approved at up to 50% DTI with automated underwriting system approval. Conventional loans max out at 50% with strong compensating factors (720+ credit score, significant asset reserves, large down payment). VA loans may allow higher DTI if residual income is sufficient. At 50% DTI, you'll have fewer lender options and will pay a premium in rate or fees.",
      },
    ],
    relatedSlugs: ["conventional-loan-requirements", "fha-loan-requirements", "how-much-mortgage-can-i-afford"],
  },

  // ── Article 16 ─────────────────────────────────────────────────────────────
  {
    slug: "what-credit-score-do-you-need-to-buy-a-house",
    title: "What Credit Score Do You Need to Buy a House?",
    metaTitle: "What Credit Score Do You Need to Buy a House? 2024 Guide | HCMG",
    metaDescription:
      "Minimum credit scores by loan type — FHA, VA, USDA, and conventional — plus how to improve your score before applying. Harris Capital Mortgage Group · NMLS# 1918223.",
    category: "Buying a Home",
    readTime: 5,
    publishedAt: "2024-10-15",
    headline: "What Credit Score Do You Need to Buy a House?",
    intro:
      "Your credit score is one of the biggest levers in the mortgage process — it determines which loan programs you qualify for, what interest rate you'll receive, and how much you'll pay over the life of the loan. Here is exactly what you need to know before you apply.",
    sections: [
      {
        heading: "Minimum Credit Scores by Loan Type",
        body: [
          "Different loan programs have different minimum score requirements. FHA loans: 580 for 3.5% down, 500 for 10% down. Conventional loans: 620 minimum; best rates start at 740+. VA loans: No official minimum set by the VA, but most lenders require 580–620. USDA loans: Typically 640, though some lenders go lower with manual underwriting. Jumbo loans: Usually 700–720 minimum.",
          "These are the minimums to qualify — not the targets that get you the best outcome. Every 20-point improvement in your score can mean a noticeably lower rate and lower PMI cost on a conventional loan.",
        ],
      },
      {
        heading: "How Your Credit Score Affects Your Rate",
        body: [
          "On a conventional loan, credit score tiers directly set your Loan-Level Price Adjustment (LLPA) — a fee built into your rate. The difference between a 680 and a 740 score can be 0.5%+ in rate, translating to hundreds of dollars per month on a $400,000 loan.",
          "FHA loans are less sensitive to credit score than conventional at the qualify/not-qualify line, but scores still affect your mortgage insurance premium tier with some lenders. VA loans offer the least credit-score sensitivity for eligible borrowers — the rate variation is narrower.",
        ],
      },
      {
        heading: "What Makes Up Your Credit Score",
        body: [
          "FICO scores (used by mortgage lenders) are calculated from five factors: Payment history (35%) — on-time vs. late payments. Amounts owed (30%) — credit utilization, total balances. Length of credit history (15%) — average age of accounts. Credit mix (10%) — types of credit (cards, installment, auto). New credit (10%) — recent hard inquiries and new accounts.",
          "Mortgage lenders pull all three bureaus (Equifax, Experian, TransUnion) and use the middle score. If you're applying jointly, they use the lower middle score of the two borrowers.",
        ],
      },
      {
        heading: "How to Improve Your Score Before Applying",
        body: [
          "Pay down revolving credit balances to below 30% utilization — ideally below 10%. This single change can move scores 20–50 points within 30–60 days. Do not close old credit card accounts — account age matters. Do not open new credit accounts for 6–12 months before applying. Dispute any errors on your credit report at annualcreditreport.com. Ask a family member with strong credit to add you as an authorized user on an old, well-managed card.",
          "Rapid rescore is an option through your lender: after you pay down balances or correct errors, a rapid rescore updates your file within 3–5 business days rather than waiting for the normal 30-day cycle. This is useful when you're close to a qualifying threshold.",
        ],
      },
      {
        heading: "What If Your Score Is Below the Minimum?",
        body: [
          "If you're below 580, your most effective path is 6–12 months of credit repair: pay down balances, make every payment on time, and avoid new credit. At 580, FHA becomes available. At 620, conventional opens up. At 640+, you're eligible for the broadest range of programs.",
          "Your loan officer can pull a tri-merge credit report and run a 'what-if' simulation showing exactly which actions would move your score to the next threshold. This targeted approach is far more efficient than guessing.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I buy a house with a 580 credit score?",
        a: "Yes, with an FHA loan. A 580 score qualifies you for FHA's minimum 3.5% down payment program. Scores 500–579 require 10% down. Conventional loans require a minimum of 620. Your loan officer will identify the best available program for your current score.",
      },
      {
        q: "Does checking my credit score hurt my mortgage application?",
        a: "Checking your own score (a soft inquiry) has zero impact. When a lender pulls your credit as part of an application, that is a hard inquiry and may reduce your score by 5–10 points temporarily. Multiple mortgage lenders pulling your credit within a 45-day window count as a single inquiry under FICO scoring rules.",
      },
      {
        q: "How fast can I improve my credit score to buy a house?",
        a: "Quick wins (1–3 months): pay down credit card balances below 30%, correct errors via rapid rescore. Medium-term (6–12 months): establish a pattern of on-time payments, reduce total debt. Sustained improvement above 720+ typically takes 12–24 months of consistent behavior. Ask your loan officer to run a simulator on your specific file — they can show you the exact actions and timelines for your situation.",
      },
    ],
    relatedSlugs: ["fha-loan-requirements", "conventional-loan-requirements", "mortgage-pre-approval-vs-pre-qualification"],
    loanType: "Conventional Loan",
  },

  // ── Article 17 ─────────────────────────────────────────────────────────────
  {
    slug: "how-to-buy-a-house-step-by-step",
    title: "How to Buy a House — Step by Step",
    metaTitle: "How to Buy a House Step by Step — Complete 2024 Guide | HCMG",
    metaDescription:
      "A plain-English step-by-step guide to buying a house — from checking your credit to getting your keys. Harris Capital Mortgage Group · NMLS# 1918223.",
    category: "Buying a Home",
    readTime: 7,
    publishedAt: "2024-10-15",
    headline: "How to Buy a House — A Complete Step-by-Step Guide",
    intro:
      "Buying a house is a multi-step process that takes 30–90 days once you're under contract. This guide walks through every stage in order so you know what to expect, what to prepare, and where delays typically happen.",
    sections: [
      {
        heading: "Step 1 — Check Your Credit and Finances",
        body: [
          "Before you look at a single listing, pull your free credit reports at annualcreditreport.com and review them for errors. Identify your credit scores (all three bureaus), your total monthly debt payments, and your gross monthly income. These three numbers determine your loan options before anything else.",
          "Calculate your debt-to-income ratio: add up all monthly minimum debt payments (student loans, car payment, credit cards), divide by gross monthly income. Below 43% is the typical qualifying threshold; below 36% opens the most programs at the best rates.",
        ],
      },
      {
        heading: "Step 2 — Get Pre-Approved",
        body: [
          "Pre-approval is a written commitment from a lender stating the loan amount, rate range, and loan type you qualify for based on a full application with documentation. In most markets, sellers will not accept an offer without it.",
          "To get pre-approved, you'll submit: W-2s and tax returns (last 2 years), recent pay stubs (last 30 days), bank statements (last 2–3 months), photo ID. The process takes 1–3 business days at most lenders. Your pre-approval letter is typically valid 60–90 days.",
        ],
      },
      {
        heading: "Step 3 — Find a Real Estate Agent and Start Shopping",
        body: [
          "A buyer's agent represents your interests, schedules showings, analyzes comparable sales, and writes your offer. Their commission is typically paid from the seller's proceeds (though this is evolving). Interview 2–3 agents and choose someone who does at least 10–15 deals per year in your target market.",
          "Know your must-haves vs. nice-to-haves before you start. In competitive markets, be ready to move quickly — pre-approved buyers who can make a clean offer within 24–48 hours of a listing have a major advantage.",
        ],
      },
      {
        heading: "Step 4 — Make an Offer and Negotiate",
        body: [
          "Your offer includes the price, earnest money deposit (typically 1–3% of purchase price), contingencies (financing, inspection, appraisal), and proposed closing date. Your agent will advise on price based on comparable sales and current market conditions.",
          "Contingencies protect you: the inspection contingency lets you renegotiate or exit if the inspection reveals problems; the financing contingency lets you exit if your loan falls through; the appraisal contingency protects you if the home appraises below purchase price.",
        ],
      },
      {
        heading: "Step 5 — Under Contract: Inspections, Appraisal, and Underwriting",
        body: [
          "Once your offer is accepted you're 'under contract.' You now have three parallel tracks running simultaneously. Inspection (Days 1–10): hire a licensed inspector to examine the home. Appraisal (Days 5–15): ordered by your lender to confirm the home is worth the purchase price. Underwriting (Days 1–30): your lender verifies all your documents and issues a decision.",
          "The most common delays come from the appraisal timeline and responding slowly to underwriter requests. Be available to provide any additional documents your loan officer requests within 24 hours.",
        ],
      },
      {
        heading: "Step 6 — Clear to Close and Closing Day",
        body: [
          "Clear to Close (CTC) means the underwriter has approved your loan and all conditions are satisfied. At least 3 business days before closing, you'll receive your Closing Disclosure — a five-page document showing your exact final loan terms and all closing costs. Review it carefully and compare it to your Loan Estimate.",
          "At closing, you'll sign the loan documents, bring a cashier's check or wire your cash-to-close amount, and receive the keys. The whole signing appointment typically takes 60–90 minutes. After recording (same day or next day), the home is yours.",
        ],
      },
    ],
    faqs: [
      {
        q: "How long does it take to buy a house?",
        a: "From offer acceptance to closing typically takes 30–45 days. Add 1–4 weeks of house-hunting before that and 1–3 days to get pre-approved. The total timeline from 'deciding to buy' to 'holding the keys' is usually 2–4 months in a normal market.",
      },
      {
        q: "How much money do I need to buy a house?",
        a: "Plan for: down payment (3–20% of purchase price depending on loan type), closing costs (2–3% of loan amount), prepaid items like insurance and tax reserves (~1–2% of purchase price), and moving costs. Down payment assistance programs can significantly reduce the upfront cash required.",
      },
      {
        q: "Should I buy or rent right now?",
        a: "The buy-vs-rent decision depends on how long you plan to stay (generally need 3+ years to break even on buying), your local market's price-to-rent ratio, your savings for upfront costs, and your financial stability. Your HCMG loan officer can build a real buy-vs-rent comparison for your specific situation.",
      },
    ],
    relatedSlugs: ["mortgage-pre-approval-vs-pre-qualification", "how-much-down-payment-do-i-need", "closing-costs-explained"],
    loanType: "Conventional Loan",
  },

  // ── Article 18 ─────────────────────────────────────────────────────────────
  {
    slug: "what-is-an-escrow-account",
    title: "What Is an Escrow Account?",
    metaTitle: "What Is an Escrow Account? Mortgage Escrow Explained | HCMG",
    metaDescription:
      "Learn how mortgage escrow accounts work — what they collect, why lenders require them, how your monthly payment is calculated, and how to avoid escrow shortages. HCMG · NMLS# 1918223.",
    category: "Buying a Home",
    readTime: 4,
    publishedAt: "2024-10-15",
    headline: "What Is an Escrow Account? How Mortgage Escrow Works",
    intro:
      "An escrow account is a holding account managed by your mortgage servicer that collects a portion of your monthly payment to cover property taxes and homeowner's insurance when they come due. Here's how it works and what to watch for.",
    sections: [
      {
        heading: "What an Escrow Account Collects",
        body: [
          "Each month, your mortgage payment includes a portion for principal and interest (P&I) plus an escrow contribution. The escrow portion covers: annual property taxes (divided by 12 and collected monthly), homeowner's insurance premium (annual premium ÷ 12), and — if required — flood insurance or mortgage insurance premiums.",
          "When your tax bill or insurance renewal comes due, your servicer pays it directly from the escrow account. You never write a separate check for these items.",
        ],
      },
      {
        heading: "Why Lenders Require Escrow",
        body: [
          "Lenders require escrow to protect their collateral. If property taxes go unpaid, the county can place a tax lien that takes priority over the mortgage — potentially allowing the government to seize the property. Unpaid homeowner's insurance would leave the lender's collateral unprotected in the event of fire or disaster.",
          "Conventional loans with 20%+ down payment sometimes allow borrowers to opt out of escrow — this is called 'waiving escrow.' Most FHA and VA loans require escrow regardless of down payment.",
        ],
      },
      {
        heading: "Escrow Shortages and Surpluses",
        body: [
          "Your servicer performs an annual escrow analysis each year. If property taxes or insurance increased, your account may have a shortage — meaning there isn't enough to cover the coming year. You'll receive a notice offering two options: pay the shortage in a lump sum, or have it spread across 12 months by increasing your monthly payment.",
          "If taxes or insurance decreased, you may have a surplus. Surpluses above a threshold are typically refunded to you, and your monthly payment may decrease.",
        ],
      },
      {
        heading: "How Your Escrow Payment Is Calculated",
        body: [
          "At loan setup, your lender estimates the annual property tax and insurance cost and divides by 12. They also collect a 2-month cushion (required by RESPA) to ensure the account never goes negative. This is why your cash-to-close includes prepaid escrow items.",
          "Example: $400,000 home with 1.2% annual property tax = $4,800/year = $400/month. Homeowner's insurance of $1,800/year = $150/month. Total escrow contribution: $550/month added to your P&I payment.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I remove escrow from my mortgage?",
        a: "Possibly. On conventional loans, once you have 20%+ equity, you may be able to waive escrow by contacting your servicer. There is sometimes a small fee. FHA and VA loans generally require escrow for the life of the loan. Check your loan documents or call your servicer.",
      },
      {
        q: "Why did my mortgage payment go up?",
        a: "The most common reason is an escrow shortage due to rising property taxes or insurance premiums. Your servicer is required to send you an escrow analysis statement explaining the change. Review it to understand which component increased.",
      },
      {
        q: "What happens to my escrow account if I sell my house?",
        a: "When you sell, your mortgage is paid off at closing. Any remaining balance in your escrow account is refunded to you — typically within 30 days of payoff. The refund appears as a check from your servicer.",
      },
    ],
    relatedSlugs: ["closing-costs-explained", "how-to-calculate-mortgage-payment", "how-to-buy-a-house-step-by-step"],
    loanType: "Conventional Loan",
  },

  // ── Article 19 ─────────────────────────────────────────────────────────────
  {
    slug: "usda-loan-requirements",
    title: "USDA Loan Requirements",
    metaTitle: "USDA Loan Requirements 2024 — Eligibility, Income Limits & Property | HCMG",
    metaDescription:
      "Complete guide to USDA loan requirements — eligible areas, income limits, credit score minimums, and how to apply. 0% down payment for eligible rural and suburban buyers. HCMG · NMLS# 1918223.",
    category: "Buying a Home",
    readTime: 5,
    publishedAt: "2024-10-15",
    headline: "USDA Loan Requirements — Eligibility, Income Limits & 0% Down",
    intro:
      "USDA loans offer 100% financing — zero down payment — for buyers purchasing in eligible areas. The program is broader than most people realize: many suburban neighborhoods qualify, not just rural farms. Here's what you need to know.",
    sections: [
      {
        heading: "What Is a USDA Loan?",
        body: [
          "A USDA loan (officially the USDA Single Family Housing Guaranteed Loan Program) is a government-backed mortgage offered by approved lenders and guaranteed by the U.S. Department of Agriculture. It was created to encourage homeownership in non-urban areas by eliminating the down payment barrier.",
          "The program guarantees up to 90% of the loan — meaning if you default, USDA repays the lender. This guarantee is what allows lenders to offer 0% down without requiring PMI (though there is a guarantee fee in its place).",
        ],
      },
      {
        heading: "Property Eligibility — What Areas Qualify?",
        body: [
          "USDA eligibility is based on the USDA's property eligibility map, not a subjective definition of 'rural.' Most towns under 20,000–35,000 population qualify. Many suburban areas within commuting distance of major cities also qualify — check any address at the USDA's eligibility tool at eligibility.sc.egov.usda.gov.",
          "The property must be a primary residence (not investment or vacation home), must be a single-family dwelling, and must meet USDA's minimum property condition standards. Condos and manufactured homes may qualify under certain conditions.",
        ],
      },
      {
        heading: "Income Limits",
        body: [
          "USDA loans have household income limits set at 115% of the area median income (AMI). Income limits vary by county and household size — a family of 4 in a rural county may have a different limit than a family of 4 in a suburban area. Standard limits for a 1–4 person household typically range from $90,000–$130,000 in most markets.",
          "All household income counts — not just the borrowers on the loan. If an adult family member lives in the home and earns income, it's counted even if they're not on the mortgage. Your loan officer can calculate your exact qualifying income.",
        ],
      },
      {
        heading: "Credit Score and DTI Requirements",
        body: [
          "The USDA has no official minimum credit score, but most lenders require 640+ for automated underwriting approval. Scores between 580–639 may qualify through manual underwriting with a strong file. DTI requirements are typically 29% housing expense ratio and 41% total DTI, with some flexibility via compensating factors.",
          "USDA loans require the property to be your primary residence, you must be a U.S. citizen or permanent resident, and you cannot own another adequate home within commuting distance.",
        ],
      },
      {
        heading: "USDA Guarantee Fee vs. FHA MIP",
        body: [
          "Instead of mortgage insurance, USDA loans charge a guarantee fee: 1% upfront (can be rolled into the loan) and 0.35% annual fee paid monthly. Compared to FHA's 1.75% upfront MIP and 0.55% annual MIP, the USDA fee structure is typically cheaper for eligible borrowers.",
          "For buyers who qualify for both FHA and USDA, run the comparison: USDA's lower annual fee often makes it the better long-term choice, though FHA's looser property eligibility may be the deciding factor in urban or suburban markets.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I use a USDA loan to buy a house in a suburb?",
        a: "Yes. Many suburban areas qualify for USDA financing. The USDA eligibility map is based on census data — areas with populations under approximately 35,000 often qualify, even near larger cities. Check the specific address at eligibility.sc.egov.usda.gov or ask your loan officer.",
      },
      {
        q: "What is the income limit for a USDA loan?",
        a: "Income limits are set at 115% of the area median income and vary by county and household size. In most markets, 1–4 person households earning under $90,000–$130,000 qualify. All household members' income counts. Your loan officer can calculate your exact limit.",
      },
      {
        q: "Is USDA or FHA better?",
        a: "If you qualify for both: USDA is usually better for eligible properties because it offers 0% down vs. FHA's 3.5%, and the annual guarantee fee (0.35%) is lower than FHA's annual MIP (0.55%). However, USDA has geographic and income restrictions that FHA does not. For urban or higher-income buyers, FHA may be the only option.",
      },
    ],
    relatedSlugs: ["fha-loan-requirements", "how-much-down-payment-do-i-need", "first-time-homebuyer-programs"],
    loanType: "USDA Loan",
  },

  // ── Article 20 ─────────────────────────────────────────────────────────────
  {
    slug: "jumbo-loan-requirements",
    title: "Jumbo Loan Requirements",
    metaTitle: "Jumbo Loan Requirements 2024 — Credit Score, Down Payment & Limits | HCMG",
    metaDescription:
      "What you need to qualify for a jumbo loan — conforming loan limits, credit score requirements, down payment, and reserves. Harris Capital Mortgage Group · NMLS# 1918223.",
    category: "Buying a Home",
    readTime: 4,
    publishedAt: "2024-10-15",
    headline: "Jumbo Loan Requirements — What You Need to Qualify",
    intro:
      "A jumbo loan finances homes that exceed the conforming loan limits set by Fannie Mae and Freddie Mac. Because jumbo loans can't be sold to the agencies, lenders hold them in-portfolio and apply stricter underwriting standards. Here's what it takes to qualify.",
    sections: [
      {
        heading: "What Is the Jumbo Loan Limit?",
        body: [
          "For 2024, the conforming loan limit is $766,550 for a single-family home in most U.S. counties. In designated high-cost areas (much of California, New York City, and other expensive metros), the limit is higher — up to $1,149,825. Any loan amount above the applicable limit is a jumbo loan.",
          "Note: it's the loan amount that determines jumbo status, not the home price. If you're buying a $900,000 home with $200,000 down, your loan amount is $700,000 — which is below the 2024 conforming limit in most areas and qualifies as conventional.",
        ],
      },
      {
        heading: "Credit Score Requirements",
        body: [
          "Most jumbo programs require a minimum 700–720 credit score. Some lenders will go to 680 with additional compensating factors (large down payment, significant reserves). Scores below 680 make jumbo approval very difficult — FHA or conventional with a larger down payment would typically be a better path.",
          "Lenders pull all three bureau scores and use the middle score. Unlike conforming loans where the score affects your rate in tiers, jumbo pricing is often binary — you either qualify at the lender's minimum or you don't.",
        ],
      },
      {
        heading: "Down Payment Requirements",
        body: [
          "Standard jumbo down payment is 10–20%. Some programs allow 5–10% with strong compensating factors and higher rates. A 20%+ down payment typically unlocks the broadest set of lenders and the best rates, and eliminates any private mortgage insurance requirement.",
          "Reserves are scrutinized heavily on jumbo loans. Most lenders want to see 6–12 months of PITI (principal, interest, taxes, insurance) in liquid assets after closing. This is in addition to the down payment and closing costs.",
        ],
      },
      {
        heading: "Income and DTI Requirements",
        body: [
          "Jumbo underwriting involves more detailed income verification than conforming loans. Self-employed borrowers, business owners, and those with complex income structures (RSUs, K-1s, rental income) should expect thorough documentation requests. Some lenders use bank statement programs for self-employed jumbo borrowers.",
          "DTI limits are typically 43% maximum, with some lenders capping at 38–40% for larger loan amounts. A clean, well-documented file matters more on a jumbo than on any other loan type.",
        ],
      },
    ],
    faqs: [
      {
        q: "Do jumbo loans have higher interest rates?",
        a: "Historically yes, but the spread has narrowed. In recent years, jumbo rates have sometimes been at or below conforming rates for strong borrowers — because jumbo loans attract well-qualified buyers and lenders want their business. The rate you get depends heavily on your credit profile, down payment, and reserves.",
      },
      {
        q: "Can I get a jumbo loan with 10% down?",
        a: "Yes, some lenders offer jumbo loans with 10% down, typically requiring 720+ credit and 12 months reserves. The rate will be higher than at 20% down, and fewer lenders will compete for your business at 10% down. It's worth shopping multiple lenders.",
      },
      {
        q: "Is a jumbo loan harder to get approved for?",
        a: "Yes. Jumbo loans require higher credit scores, larger down payments, more reserves, and more thorough income documentation than conforming loans. However, for well-qualified borrowers buying a higher-priced home, the process is not dramatically different from a conventional loan.",
      },
    ],
    relatedSlugs: ["conventional-loan-requirements", "what-credit-score-do-you-need-to-buy-a-house", "how-much-down-payment-do-i-need"],
    loanType: "Jumbo Loan",
  },

  // ── Article 21 ─────────────────────────────────────────────────────────────
  {
    slug: "what-is-a-heloc",
    title: "What Is a HELOC? Home Equity Line of Credit Explained",
    metaTitle: "What Is a HELOC? Home Equity Line of Credit Explained | HCMG",
    metaDescription:
      "How HELOCs work, how much you can borrow, draw period vs. repayment period, rates, and how a HELOC compares to a cash-out refinance. HCMG · NMLS# 1918223.",
    category: "Buying a Home",
    readTime: 5,
    publishedAt: "2024-10-15",
    headline: "What Is a HELOC? Home Equity Line of Credit Explained",
    intro:
      "A HELOC (Home Equity Line of Credit) lets you borrow against the equity in your home — similar to a credit card secured by your house. You draw what you need, when you need it, and pay interest only on the outstanding balance. Here's how it works.",
    sections: [
      {
        heading: "How a HELOC Works",
        body: [
          "A HELOC has two phases: the draw period (typically 10 years) during which you can borrow, repay, and borrow again up to your credit limit; and the repayment period (typically 20 years) during which the line closes to new draws and you repay the outstanding balance.",
          "During the draw period, most HELOCs require interest-only payments on the balance you've drawn. During the repayment period, payments include both principal and interest. Monthly payments can jump significantly at the transition — this is called payment shock, and it's important to plan for it.",
        ],
      },
      {
        heading: "How Much Can You Borrow with a HELOC?",
        body: [
          "Most lenders allow you to borrow up to 85–90% of your home's appraised value, minus your first mortgage balance. The formula: (Home value × 85%) − First mortgage balance = Maximum HELOC credit line.",
          "Example: $500,000 home value × 85% = $425,000. Minus $300,000 first mortgage = $125,000 maximum HELOC. Your actual approval may be lower based on your credit score, income, and the lender's specific guidelines.",
        ],
      },
      {
        heading: "HELOC Interest Rates",
        body: [
          "HELOC rates are variable — they float with the prime rate (which moves with the federal funds rate). When the Fed raises rates, your HELOC rate goes up. When rates fall, it goes down. Most HELOCs are expressed as prime + a margin (e.g., prime + 0.5%).",
          "This variability is the primary risk of a HELOC. In a rising rate environment, your interest payments can increase significantly. Some lenders offer rate caps or a fixed-rate conversion option for outstanding balances.",
        ],
      },
      {
        heading: "HELOC vs. Cash-Out Refinance",
        body: [
          "A cash-out refinance replaces your first mortgage with a larger one and gives you the difference as cash — at a fixed rate, with a reset amortization clock. A HELOC is a second lien that doesn't touch your first mortgage — the rate is variable, and you only borrow what you need.",
          "Cash-out refinance is better when: rates are lower than your existing mortgage, you want a fixed rate, or you want a large lump sum. HELOC is better when: your existing mortgage rate is lower than current refinance rates (you don't want to touch it), you need flexibility to draw over time, or you need a smaller or uncertain amount.",
        ],
      },
    ],
    faqs: [
      {
        q: "How long does it take to get a HELOC?",
        a: "The HELOC application and approval process typically takes 2–6 weeks, similar to a mortgage. It requires an appraisal (sometimes a desktop or drive-by appraisal), income verification, and a title search. Some lenders offer faster turnaround for existing customers.",
      },
      {
        q: "Is HELOC interest tax deductible?",
        a: "HELOC interest is deductible only when the funds are used to buy, build, or substantially improve the home securing the HELOC. Using a HELOC for debt consolidation, education, or other purposes does not qualify for the deduction. Consult a tax advisor for your specific situation.",
      },
      {
        q: "What happens if I can't make my HELOC payments?",
        a: "A HELOC is a lien on your home. If you default, the lender can foreclose, just like your first mortgage. Because a HELOC is typically a second lien, the first mortgage lender would be paid first in a foreclosure, making HELOC lenders more cautious about extending credit at high combined loan-to-value ratios.",
      },
    ],
    relatedSlugs: ["when-to-refinance-your-mortgage", "what-is-pmi", "how-much-mortgage-can-i-afford"],
    loanType: "HELOC",
  },

  // ── Article 22 ─────────────────────────────────────────────────────────────
  {
    slug: "mortgage-points-explained",
    title: "Mortgage Points Explained — Should You Buy Down Your Rate?",
    metaTitle: "Mortgage Points Explained — Should You Buy Down Your Rate? | HCMG",
    metaDescription:
      "What are mortgage discount points? How much do they cost, how much do they save, and when does buying points make financial sense? HCMG · NMLS# 1918223.",
    category: "Buying a Home",
    readTime: 4,
    publishedAt: "2024-10-15",
    headline: "Mortgage Points Explained — Should You Buy Down Your Rate?",
    intro:
      "Mortgage discount points let you prepay interest upfront to secure a lower interest rate. Whether buying points makes sense depends entirely on how long you'll keep the loan. Here's how to do the math.",
    sections: [
      {
        heading: "What Are Mortgage Points?",
        body: [
          "One mortgage discount point equals 1% of your loan amount and typically reduces your interest rate by 0.125%–0.25% depending on the lender and market conditions. Points are paid at closing and appear on your Loan Estimate as 'Discount Points.'",
          "Points are separate from origination fees. Origination fees are lender compensation — you're paying for the service. Discount points are optional and purely about trading upfront cash for a lower rate.",
        ],
      },
      {
        heading: "How to Calculate Break-Even",
        body: [
          "The break-even calculation: (Cost of points) ÷ (Monthly payment savings) = Break-even months. If 1 point costs $4,000 and saves $55/month, your break-even is 72 months (6 years). If you keep the loan past 6 years, the points paid off. If you sell or refinance before then, you lost money.",
          "Example: $400,000 loan. 1 point = $4,000. Rate drops from 7.0% to 6.75%. Monthly P&I savings = $67. Break-even = 60 months (5 years). If you stay in the house 10+ years, buying the point is a clear win. If you move in 3 years, you wasted $4,000.",
        ],
      },
      {
        heading: "When Buying Points Makes Sense",
        body: [
          "Buy points when: you plan to stay in the home long-term (7+ years), you have excess cash after down payment and closing costs, you're rate-sensitive and want to lock in the lowest possible payment, or you're buying a forever home and want to minimize total interest paid.",
          "Don't buy points when: you expect to sell or refinance within 5 years, you're stretching to make the down payment and closing costs (never sacrifice emergency reserves for points), or you're not certain about your long-term plans.",
        ],
      },
      {
        heading: "Negative Points (Lender Credits)",
        body: [
          "The inverse of buying points is taking lender credits — you accept a slightly higher rate in exchange for the lender covering some or all of your closing costs. This is the 'no-closing-cost loan' structure. It works in reverse: higher rate, lower upfront cost, shorter break-even for moving.",
          "Lender credits make sense for the same reasons buying points does not: short expected hold period, limited cash reserves, or uncertainty about your timeline. Your loan officer can show you the full pricing grid — rate vs. points vs. lender credits — so you can choose the right tradeoff for your situation.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are mortgage points tax deductible?",
        a: "Discount points paid on a home purchase loan are generally deductible in the year you paid them, provided you meet IRS requirements (the loan is for your primary residence, points are computed as a percentage of the loan, and other conditions). Refinance points must be deducted over the life of the loan. Consult a tax advisor.",
      },
      {
        q: "How many points can you buy on a mortgage?",
        a: "Typically 0–4 points, though lenders vary. There are limits on how much a borrower can pay in points under qualified mortgage rules. Each additional point has diminishing returns — the first point usually saves the most per dollar spent.",
      },
      {
        q: "What is the difference between points and APR?",
        a: "Points are an upfront cash payment. APR (Annual Percentage Rate) is a calculated number that incorporates the interest rate plus most upfront costs (including points) to express the true annual cost of the loan. Two loans with the same rate but different points will have different APRs — the one with more points will have the higher APR.",
      },
    ],
    relatedSlugs: ["when-to-refinance-your-mortgage", "closing-costs-explained", "how-to-apply-for-a-mortgage-online"],
    loanType: "Conventional Loan",
  },

  // ── Article 23 ─────────────────────────────────────────────────────────────
  {
    slug: "arm-vs-fixed-rate-mortgage",
    title: "ARM vs. Fixed Rate Mortgage — Which Is Right for You?",
    metaTitle: "ARM vs. Fixed Rate Mortgage — Which Should You Choose? | HCMG",
    metaDescription:
      "Adjustable-rate vs. fixed-rate mortgage comparison — how each works, the real cost difference, and when an ARM makes financial sense. HCMG · NMLS# 1918223.",
    category: "Buying a Home",
    readTime: 5,
    publishedAt: "2024-10-15",
    headline: "ARM vs. Fixed Rate Mortgage — Which Is Right for You?",
    intro:
      "An adjustable-rate mortgage (ARM) starts with a lower rate that can change after an initial fixed period. A fixed-rate mortgage holds the same rate for the entire loan term. The right choice depends on how long you plan to keep the loan.",
    sections: [
      {
        heading: "How a Fixed-Rate Mortgage Works",
        body: [
          "A fixed-rate mortgage locks your interest rate for the entire loan term — typically 15 or 30 years. Your principal and interest payment never changes, giving you complete predictability. If rates rise after you close, you're protected. If rates fall significantly, you'd need to refinance to capture the lower rate.",
          "The 30-year fixed is the most popular mortgage in the U.S. because it offers the lowest monthly payment for a given loan amount and the most stability. The 15-year fixed has a higher monthly payment but significantly lower total interest — typically saving six figures on a $400,000 loan.",
        ],
      },
      {
        heading: "How an ARM Works",
        body: [
          "An ARM has two phases: the initial fixed period (5, 7, or 10 years for most modern ARMs) during which the rate is set and won't change, followed by the adjustment period during which the rate resets annually based on a market index (usually SOFR) plus a margin.",
          "ARM notation explained: a 7/6 ARM means 7 years fixed, then adjusts every 6 months. A 5/1 ARM means 5 years fixed, then adjusts every 1 year. Modern ARMs include adjustment caps (e.g., 2/2/5 means max 2% at first adjustment, max 2% each subsequent adjustment, max 5% over life of loan).",
        ],
      },
      {
        heading: "Rate and Payment Comparison",
        body: [
          "ARMs typically start 0.5%–1.5% below a comparable 30-year fixed rate. On a $400,000 loan, a 1% rate difference saves roughly $250–$280/month during the fixed ARM period. Over a 7-year fixed ARM period, that's $21,000+ in savings — if you sell or refinance before the rate adjusts.",
          "The risk: if you keep an ARM past the initial fixed period and rates have risen, your payment can increase significantly at the first adjustment. With a 5% lifetime cap on a $400,000 loan, your rate could theoretically increase from 5.5% to 10.5% — though hitting the lifetime cap would require an extreme rate environment.",
        ],
      },
      {
        heading: "When to Choose an ARM",
        body: [
          "ARMs make financial sense when you have a defined horizon shorter than the fixed period. Common scenarios: you're buying a starter home and plan to upsize in 5–7 years; you're relocating for work and expect to move within the fixed window; you're confident you'll refinance when the fixed period ends; or the initial ARM rate is dramatically lower and you have high payment sensitivity.",
          "Fixed rates make sense when you're buying your long-term or forever home, when you value predictability over optimization, or when ARM rates are not meaningfully lower than fixed (the spread matters — if a 30-year fixed is 7% and a 5/1 ARM is 6.875%, the ARM's upside doesn't justify the risk).",
        ],
      },
    ],
    faqs: [
      {
        q: "Are ARM loans risky?",
        a: "ARMs carry rate risk if held past the initial fixed period. They are not inherently risky for buyers who understand the product and have a plan — sell before the adjustment, refinance before the adjustment, or afford the worst-case payment if rates rise. The risk comes from buyers who take an ARM without understanding the adjustment mechanics and get surprised.",
      },
      {
        q: "Can I refinance out of an ARM before it adjusts?",
        a: "Yes. Refinancing from an ARM to a fixed-rate loan before the initial fixed period ends is a common and smart strategy if fixed rates are acceptable at that time. There is no prepayment penalty on modern qualified mortgages. The risk is that fixed rates may be higher when you go to refinance than when you originally closed.",
      },
      {
        q: "What index do ARM loans use?",
        a: "Most modern ARMs use SOFR (Secured Overnight Financing Rate), which replaced LIBOR. Some older ARMs may still use LIBOR-based indexes or the Treasury Constant Maturity Index. Your loan documents specify the index. The rate you pay equals the index value plus your lender's margin — e.g., SOFR + 2.5%.",
      },
    ],
    relatedSlugs: ["when-to-refinance-your-mortgage", "how-to-calculate-mortgage-payment", "conventional-loan-requirements"],
    loanType: "ARM Loan",
  },

  // ── Article 24 ─────────────────────────────────────────────────────────────
  {
    slug: "mortgage-pre-approval-checklist",
    title: "Mortgage Pre-Approval Checklist — Documents You Need",
    metaTitle: "Mortgage Pre-Approval Checklist 2024 — Documents You Need | HCMG",
    metaDescription:
      "The complete mortgage pre-approval document checklist — W-2s, tax returns, bank statements, and more. Get pre-approved faster by having these ready. HCMG · NMLS# 1918223.",
    category: "Buying a Home",
    readTime: 4,
    publishedAt: "2024-10-15",
    headline: "Mortgage Pre-Approval Checklist — Documents You Need",
    intro:
      "The fastest way to get pre-approved is to have your documents ready before you apply. This checklist covers everything a lender needs — organized by borrower type so you know exactly what applies to your situation.",
    sections: [
      {
        heading: "Income Documents (All Borrowers)",
        body: [
          "W-2 employees: Last 2 years of W-2 forms from all employers. Most recent 30 days of pay stubs. Federal tax returns — last 2 years (all pages, all schedules). If you had a gap in employment or job change in the last 2 years, be prepared to explain in writing.",
          "The lender is verifying consistency of income. Job changes in the same field are fine. Industry changes or gaps require explanation. If you started a new job recently, an offer letter and first pay stub may suffice — ask your loan officer.",
        ],
      },
      {
        heading: "Self-Employed / Business Owner Documents",
        body: [
          "If you own 25%+ of a business: Last 2 years of personal tax returns (all pages, all schedules including Schedule C, E, K-1). Last 2 years of business tax returns (S-Corp, Partnership, or Corporation — as applicable). Year-to-date profit and loss statement (P&L). Business bank statements (last 2–3 months).",
          "Self-employed borrowers often have lower taxable income than W-2 employees due to deductions — which lenders use to calculate qualifying income. The more deductions you take, the less qualifying income you may show. Your loan officer can run the analysis before you apply.",
        ],
      },
      {
        heading: "Asset Documents",
        body: [
          "Bank statements: last 2–3 months, all pages including blank pages. Investment accounts (brokerage, 401k, IRA): last 2 months of statements. Any source of down payment funds must be documented — a large deposit not from regular payroll will require explanation and source documentation.",
          "Gift funds: if receiving gift funds for down payment, your donor will need to sign a gift letter stating the funds are a gift with no expectation of repayment, along with bank statements showing the funds leaving their account.",
        ],
      },
      {
        heading: "Identity and Other Documents",
        body: [
          "Government-issued photo ID (driver's license or passport). Social Security number (for credit pull authorization). If applicable: divorce decree and separation agreement, bankruptcy discharge paperwork, child support or alimony documentation, rental income documentation (lease agreements + tax returns).",
          "VA borrowers add: Certificate of Eligibility (COE) — your loan officer can often pull this directly, DD-214 (Certificate of Release/Discharge from Active Duty), or current military orders if on active duty.",
        ],
      },
    ],
    faqs: [
      {
        q: "How long does pre-approval take?",
        a: "With a complete document package, most lenders issue a pre-approval decision within 1–3 business days. Incomplete files take longer — the biggest delay is always waiting for documents. Having everything on this checklist ready before you apply is the single biggest factor in speed.",
      },
      {
        q: "Does pre-approval guarantee a loan?",
        a: "No. Pre-approval is conditional. Final approval depends on the property appraisal, a final review of your finances at closing, and title clearance. Do not make major financial changes (new debt, job change, large withdrawals) after pre-approval.",
      },
      {
        q: "Can I get pre-approved at multiple lenders?",
        a: "Yes, and you should. Shopping multiple lenders within a 45-day window counts as a single credit inquiry under FICO scoring rules. Getting 2–3 pre-approvals lets you compare rate quotes apples-to-apples and negotiate the best deal.",
      },
    ],
    relatedSlugs: ["mortgage-pre-approval-vs-pre-qualification", "how-to-apply-for-a-mortgage-online", "how-to-buy-a-house-step-by-step"],
    loanType: "Conventional Loan",
  },

  // ── Article 25 ─────────────────────────────────────────────────────────────
  {
    slug: "how-to-improve-credit-score-for-mortgage",
    title: "How to Improve Your Credit Score Before Getting a Mortgage",
    metaTitle: "How to Improve Your Credit Score for a Mortgage — Fast & Proven Methods | HCMG",
    metaDescription:
      "Proven ways to improve your credit score before applying for a mortgage — including rapid rescore, utilization strategies, and what not to do. HCMG · NMLS# 1918223.",
    category: "Buying a Home",
    readTime: 5,
    publishedAt: "2024-10-15",
    headline: "How to Improve Your Credit Score Before Getting a Mortgage",
    intro:
      "Your credit score directly determines your mortgage rate, your loan options, and how much you pay over the life of your loan. A 40-point improvement from 660 to 700 can save you $50,000+ over 30 years. Here are the most effective actions, ranked by impact.",
    sections: [
      {
        heading: "The Fastest Fix: Pay Down Revolving Balances",
        body: [
          "Credit utilization — how much of your available revolving credit you're using — makes up 30% of your FICO score. Getting your utilization below 30% (ideally below 10%) on each card is typically the fastest way to improve your score.",
          "If you have a $5,000 credit card with a $4,500 balance, paying it down to $500 can move your score 30–60 points in the next billing cycle. This is the highest-ROI credit action available to most borrowers because it's both fast (next reporting cycle, 30–45 days) and significant.",
        ],
      },
      {
        heading: "Rapid Rescore — The Lender's Shortcut",
        body: [
          "Once you've paid down balances or resolved a dispute, you normally wait 30 days for the credit bureau to reflect the update. Through your lender, rapid rescore updates your file in 3–5 business days after your creditor confirms the change.",
          "Rapid rescore is only available through lenders and mortgage brokers — you can't order it yourself. If you're close to a credit score threshold (e.g., 618 trying to hit 620), ask your loan officer about rapid rescore after any balance paydown.",
        ],
      },
      {
        heading: "Dispute Errors — Check Your Reports First",
        body: [
          "One in five Americans has a material error on their credit report. Pull your free reports at annualcreditreport.com (all three bureaus) and review for: incorrect late payments, accounts that aren't yours, incorrect balances or credit limits, duplicate accounts, and debts that should have fallen off (most negative items drop off after 7 years).",
          "Dispute errors directly with each bureau online — Equifax, Experian, and TransUnion each have dispute portals. Document your disputes. Bureaus have 30 days to investigate. If the error is causing a meaningful score depression, rapid rescore after resolution can accelerate the correction.",
        ],
      },
      {
        heading: "What NOT to Do Before Applying",
        body: [
          "Do not open new credit cards or loans — new accounts lower your average account age and generate hard inquiries. Do not close old accounts — closing a card reduces your available credit and raises your utilization ratio. Do not finance a car, furniture, or appliances — new installment debt and hard inquiries can drop your score and affect your DTI.",
          "Do not make large deposits without documentation — unexplained large deposits require sourcing by your lender and can delay or complicate your file. Do not change jobs if avoidable — job stability is a key underwriting factor, especially in the 90 days before closing.",
        ],
      },
    ],
    faqs: [
      {
        q: "How many points can I realistically improve my credit score?",
        a: "For someone starting at 600–650 with high credit card utilization and a few errors, a 50–80 point improvement is realistic in 3–6 months with targeted effort. The biggest individual action is typically paying down credit card balances. Improvement above 740 tends to be slower — the gains come from time and consistent payment history.",
      },
      {
        q: "Does paying off collections improve my credit score?",
        a: "It depends. Under older FICO scoring (FICO 8), paying a collection may not improve the score because the collection still shows as a negative mark (even if paid). Under newer scoring models (FICO 9, VantageScore 4.0), paid collections are ignored entirely. Mortgage lenders typically use FICO 2, 4, and 5 — older models. Ask your loan officer which model their lender uses before paying a collection solely for score purposes.",
      },
      {
        q: "How long before applying should I start working on my credit?",
        a: "Start 6–12 months out for meaningful improvement. If you're making rapid changes (paying down balances, disputing errors), some improvement shows in 30–60 days. Major negative items like late payments and collections take years to fade. The sooner you start, the more time compounds the improvements.",
      },
    ],
    relatedSlugs: ["what-credit-score-do-you-need-to-buy-a-house", "mortgage-pre-approval-vs-pre-qualification", "conventional-loan-requirements"],
    loanType: "Conventional Loan",
  },
];

export function getArticleBySlug(slug: string): LearnArticle | undefined {
  return learnArticles.find((a) => a.slug === slug);
}

export function getRelatedArticles(article: LearnArticle): LearnArticle[] {
  return article.relatedSlugs
    .map((s) => learnArticles.find((a) => a.slug === s))
    .filter((a): a is LearnArticle => Boolean(a));
}

export const LEARN_CATEGORIES = [
  "Buying a Home",
  "FHA Loans",
  "VA Loans",
  "Refinance",
] as const;
