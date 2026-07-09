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
