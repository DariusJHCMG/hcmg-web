const { createClient } = require("@supabase/supabase-js");

const sb = createClient(
  "process.env.NEXT_PUBLIC_SUPABASE_URL",
  "process.env.SUPABASE_SERVICE_ROLE_KEY",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const SLUG  = "harry-capital";
const EMAIL = "harry@hcmgloans.com";
const PASS  = "HCMGdemo2024!";
const SITE  = "https://hcmgloans.com";

const LEAD_NAMES = [
  ["James","Walker"],["Maria","Rodriguez"],["DeShawn","Thompson"],
  ["Ashley","Martinez"],["Kevin","Chen"],["Tamika","Brown"],
  ["Chris","Johnson"],["Rachel","Davis"],["Mike","Wilson"],
  ["Sandra","Lee"],["Tyler","Anderson"],["Priya","Patel"],
  ["Marcus","Jackson"],["Jennifer","White"],["Brandon","Harris"],
];
const GOALS    = ["buy","refinance","buy","buy","refinance","buy","buy","buy","refinance","buy","buy","buy","refinance","buy","buy"];
const SOURCES  = ["instagram","facebook","google","instagram","direct","tiktok","referral","facebook","google","instagram","direct","referral","facebook","google","instagram"];
const MEDIUMS  = ["social","social","organic","social","direct","social","referral","social","organic","social","direct","referral","social","organic","social"];
const CAMPAIGNS= ["spring-buyers","spring-buyers",null,"va-buyers",null,"fha-first-time","referral-program","spring-buyers","seo-organic","tiktok-va",null,"referral-program","spring-buyers","seo-organic","instagram-reels"];
const CREDITS  = ["760-plus","700-759","640-699","760-plus","700-759","below-640","760-plus","700-759","640-699","760-plus","700-759","760-plus","640-699","700-759","760-plus"];
const PRICES   = ["400-600","250-400","250-400","600-plus","400-600","under-250","400-600","250-400","under-250","600-plus","400-600","600-plus","250-400","400-600","600-plus"];
const INCOMES  = ["125-200","75-125","75-125","200-plus","125-200","under-75","125-200","75-125","under-75","200-plus","125-200","200-plus","75-125","125-200","200-plus"];
const STATUSES = ["closed","qualified","new","contacted","qualified","new","closed","new","lost","qualified","new","closed","contacted","new","qualified"];
const DEVICES  = ["mobile","desktop","mobile","mobile","desktop","mobile","desktop","mobile","mobile","desktop","mobile","desktop","mobile","mobile","desktop"];
const FUNNELS  = ["va-buyer","fha-first-time",null,"va-buyer","rate-refinance","fha-first-time",null,"first-time-buyer","cash-out-refi","va-buyer",null,null,"fha-first-time","first-time-buyer","va-buyer"];
const PAYMENTS = [2847,1923,1654,3912,2100,1412,2650,1875,1540,4200,2050,3750,1820,1970,4100];

async function run() {
  // ── 1. Auth user ──────────────────────────────────────────────
  console.log("Creating auth user...");
  const { data: authData, error: authErr } = await sb.auth.admin.createUser({
    email: EMAIL,
    password: PASS,
    email_confirm: true,
    user_metadata: { full_name: "Harry Capital", role: "loan_officer", lo_slug: SLUG },
  });
  if (authErr) { console.error("Auth error:", authErr.message); process.exit(1); }
  const uid = authData.user.id;
  console.log("Auth user:", uid);

  await new Promise(r => setTimeout(r, 400));

  // ── 2. Profile ────────────────────────────────────────────────
  const { error: profErr } = await sb.from("profiles").upsert({
    id:               uid,
    email:            EMAIL,
    full_name:        "Harry Capital",
    role:             "loan_officer",
    lo_slug:          SLUG,
    title:            "Senior Loan Officer",
    nmls:             "9998877",
    phone:            "(702) 555-0199",
    notify_email:     EMAIL,
    is_active:        true,
    show_on_website:  true,
    short_bio:        "Licensed mortgage loan originator at HCMG with a passion for helping first-time buyers and veterans achieve homeownership. Serving clients across Nevada, Texas, Florida, and beyond.",
    hero_bio:         "I'm Harry Capital, a licensed loan officer at Harris Capital Mortgage Group. Whether you're buying your first home, upgrading, or tapping into your equity — I'll shop dozens of lenders to find the rate that fits your life, not just any bank's best offer.",
    about_headline:   "A loan officer who shops the market so you don't have to.",
    long_bio:         [
      "Harry Capital is a licensed mortgage loan originator (NMLS# 9998877) at Harris Capital Mortgage Group, serving clients from HCMG offices in Las Vegas and Houston.",
      "With access to dozens of lenders and hundreds of loan programs, Harry shops the market to find the deal that actually fits each client's situation — FHA, VA, Conventional, Jumbo, and more.",
      "Harry's approach is simple: no call centers, no runarounds, no surprises at closing. Just honest guidance and the best rate available for your scenario."
    ],
    specialties:      ["Purchase Loans", "FHA / VA", "First-Time Buyers", "Refinance", "Conventional"],
    offices:          ["Las Vegas, NV", "Houston, TX"],
    years_experience: 7,
    updated_at:       new Date().toISOString(),
  }, { onConflict: "id" });
  if (profErr) { console.error("Profile error:", profErr.message); process.exit(1); }
  console.log("Profile created");

  // ── 3. Funnel link ────────────────────────────────────────────
  const { error: flErr } = await sb.from("funnel_links").upsert({
    lo_slug:   SLUG,
    lo_name:   "Harry Capital",
    url:       `${SITE}/go/${SLUG}`,
    is_active: true,
    clicks:    247,
  }, { onConflict: "lo_slug" });
  if (flErr) console.error("Funnel link error:", flErr.message);
  else console.log("Funnel link created (247 clicks)");

  // ── 4. Leads ──────────────────────────────────────────────────
  console.log("Seeding leads...");
  const now = Date.now();
  const leads = LEAD_NAMES.map((n, i) => ({
    first_name:       n[0],
    last_name:        n[1],
    email:            `${n[0].toLowerCase()}.${n[1].toLowerCase()}@example.com`,
    phone:            `(702) 555-0${100 + i}`,
    sms_consent:      true,
    source:           FUNNELS[i] ? "funnel" : "direct",
    funnel_type:      FUNNELS[i],
    goal:             GOALS[i],
    credit_range:     CREDITS[i],
    price_range:      PRICES[i],
    income_range:     INCOMES[i],
    lo_slug:          SLUG,
    lo_name:          "Harry Capital",
    lo_nmls:          "9998877",
    status:           STATUSES[i],
    utm_source:       SOURCES[i],
    utm_medium:       MEDIUMS[i],
    utm_campaign:     CAMPAIGNS[i],
    device:           DEVICES[i],
    estimated_monthly_payment: PAYMENTS[i],
    entry_page:       FUNNELS[i] ? `/go/harry-capital/${FUNNELS[i]}` : "/go/harry-capital",
    // Spread across last 60 days
    created_at:       new Date(now - (i * 3.5 + Math.random() * 3) * 86400000).toISOString(),
  }));

  const { error: leadsErr } = await sb.from("leads").insert(leads);
  if (leadsErr) console.error("Leads error:", leadsErr.message);
  else console.log("15 leads seeded");

  // ── 5. Funnel step events for analytics ───────────────────────
  console.log("Seeding funnel events...");
  // Simulate drop-off: step 1=80, 2=65, 3=50, 4=38, 5=28, 6=18
  const stepCounts = [80, 65, 50, 38, 28, 18];
  const sessionBase = `demo-session-harry-`;
  const events = [];
  for (let step = 1; step <= 6; step++) {
    for (let j = 0; j < stepCounts[step - 1]; j++) {
      events.push({
        session_id:  `${sessionBase}${step}-${j}`,
        event_type:  "funnel_step",
        pathname:    `/go/harry-capital`,
        data:        {
          step,
          choice: ["buy a home","$400k–$600k","700–759","$125k–$200k","saw estimate","submitted contact"][step - 1],
          duration_ms: 8000 + Math.floor(Math.random() * 15000),
        },
        ts:          new Date(now - Math.random() * 60 * 86400000).toISOString(),
      });
    }
  }
  // Insert in batches of 100
  for (let i = 0; i < events.length; i += 100) {
    const { error: evErr } = await sb.from("lead_events").insert(events.slice(i, i + 100));
    if (evErr) { console.error("Events batch error:", evErr.message); break; }
  }
  console.log(`${events.length} funnel events seeded`);

  console.log("\n=== DEMO ACCOUNT READY ===");
  console.log("Email:    " + EMAIL);
  console.log("Password: " + PASS);
  console.log("Portal:   " + SITE + "/portal");
  console.log("Team page:" + SITE + "/team/harry-capital");
  console.log("Funnel:   " + SITE + "/go/harry-capital");
}

run().catch(console.error);
