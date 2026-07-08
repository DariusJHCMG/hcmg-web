const { createClient } = require("@supabase/supabase-js");
const sb = createClient(
  "process.env.NEXT_PUBLIC_SUPABASE_URL",
  "process.env.SUPABASE_SERVICE_ROLE_KEY",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const SLUG = "harry-capital";
const now  = Date.now();

const NAMES    = [["James","Walker"],["Maria","Rodriguez"],["DeShawn","Thompson"],["Ashley","Martinez"],["Kevin","Chen"],["Tamika","Brown"],["Chris","Johnson"],["Rachel","Davis"],["Mike","Wilson"],["Sandra","Lee"],["Tyler","Anderson"],["Priya","Patel"],["Marcus","Jackson"],["Jennifer","White"],["Brandon","Harris"]];
const GOALS    = ["buy","refinance","buy","buy","refinance","buy","buy","buy","refinance","buy","buy","buy","refinance","buy","buy"];
const SOURCES  = ["instagram","facebook","google","instagram","direct","tiktok","referral","facebook","google","instagram","direct","referral","facebook","google","instagram"];
const MEDIUMS  = ["social","social","organic","social","direct","social","referral","social","organic","social","direct","referral","social","organic","social"];
const CAMPAIGNS= ["spring-buyers","spring-buyers",null,"va-buyers",null,"fha-first-time","referral-program","spring-buyers","seo-organic","tiktok-va",null,"referral-program","spring-buyers","seo-organic","instagram-reels"];
const CREDITS  = ["760-plus","700-759","640-699","760-plus","700-759","below-640","760-plus","700-759","640-699","760-plus","700-759","760-plus","640-699","700-759","760-plus"];
const PRICES   = ["$400k–$600k","$250k–$400k","$250k–$400k","$600k+","$400k–$600k","Under $250k","$400k–$600k","$250k–$400k","Under $250k","$600k+","$400k–$600k","$600k+","$250k–$400k","$400k–$600k","$600k+"];
const INCOMES  = ["$125k–$200k","$75k–$125k","$75k–$125k","$200k+","$125k–$200k","Under $75k","$125k–$200k","$75k–$125k","Under $75k","$200k+","$125k–$200k","$200k+","$75k–$125k","$125k–$200k","$200k+"];
const STATUSES = ["closed","qualified","new","contacted","qualified","new","closed","new","lost","qualified","new","closed","contacted","new","qualified"];
const DEVICES  = ["mobile","desktop","mobile","mobile","desktop","mobile","desktop","mobile","mobile","desktop","mobile","desktop","mobile","mobile","desktop"];
const PAYMENTS = [2847,1923,1654,3912,2100,1412,2650,1875,1540,4200,2050,3750,1820,1970,4100];
const ENTRIES  = ["/go/harry-capital/va-buyer","/go/harry-capital/fha-first-time","/go/harry-capital","/go/harry-capital/va-buyer","/go/harry-capital/rate-refinance","/go/harry-capital/fha-first-time","/go/harry-capital","/go/harry-capital/first-time-buyer","/go/harry-capital/cash-out-refi","/go/harry-capital/va-buyer","/go/harry-capital","/go/harry-capital","/go/harry-capital/fha-first-time","/go/harry-capital/first-time-buyer","/go/harry-capital/va-buyer"];

const leads = NAMES.map((n, i) => ({
  first_name:   n[0],
  last_name:    n[1],
  email:        `${n[0].toLowerCase()}.${n[1].toLowerCase()}@example.com`,
  phone:        `7025550${(100 + i).toString()}`,
  sms_consent:  true,
  source:       "funnel",
  goal:         GOALS[i],
  credit_range: CREDITS[i],
  price_range:  PRICES[i],
  income_range: INCOMES[i],
  lo_slug:      SLUG,
  lo_name:      "Harry Capital",
  lo_nmls:      "9998877",
  status:       STATUSES[i],
  utm_source:   SOURCES[i],
  utm_medium:   MEDIUMS[i],
  utm_campaign: CAMPAIGNS[i],
  device:       DEVICES[i],
  estimated_monthly_payment: PAYMENTS[i],
  entry_page:   ENTRIES[i],
  created_at:   new Date(now - (i * 3.5 + Math.random() * 3) * 86400000).toISOString(),
}));

sb.from("leads").insert(leads).then(r => {
  if (r.error) console.error("Error:", r.error.message);
  else console.log("15 leads seeded successfully");
});
