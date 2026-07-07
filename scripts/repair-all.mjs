// Straight-to-create: skip the nuke check, just try to create all 19 users.
// If emails are still blocked, it will tell us exactly which ones.
// Run: node --env-file=.env.local scripts/repair-all.mjs

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TEAM = [
  { email: "adam@hcmgloans.com",           full_name: "Adam DeMarco",               role: "admin",        lo_slug: "adam-demarco",        nmls: "2749110",  password: "HCMGteam2025!" },
  { email: "astrine@hcmgloans.com",        full_name: "Astrine Covington",          role: "admin",        lo_slug: "astrine-covington",   nmls: null,       password: "HCMGteam2025!" },
  { email: "aysha@hcmgloans.com",          full_name: "Aysha Randall",              role: "admin",        lo_slug: "aysha-randall",       nmls: "2341853",  password: "HCMGteam2025!" },
  { email: "cason@hcmgloans.com",          full_name: "Cason Thomas Knight",        role: "loan_officer", lo_slug: "cason-knight",        nmls: "2234863",  password: "HCMGteam2025!" },
  { email: "darius@hcmgloans.com",         full_name: "Darius James",               role: "admin",        lo_slug: "darius-james",        nmls: null,       password: "Queen1972$"    },
  { email: "don@hcmgloans.com",            full_name: "Don Ray Earl",               role: "loan_officer", lo_slug: "don-earl",            nmls: "896069",   password: "HCMGteam2025!" },
  { email: "glenda@hcmgloans.com",         full_name: "Glenda Adesmiler Medina",    role: "loan_officer", lo_slug: "glenda-medina",       nmls: "2247461",  password: "HCMGteam2025!" },
  { email: "james.pasquale@hcmgloans.com", full_name: "James Michael Pasquale",     role: "loan_officer", lo_slug: "james-pasquale",      nmls: "2410580",  password: "HCMGteam2025!" },
  { email: "james.sadowski@hcmgloans.com", full_name: "James Carl Sadowski Jr",     role: "loan_officer", lo_slug: "james-sadowski",      nmls: "2711950",  password: "HCMGteam2025!" },
  { email: "jason@hcmgloans.com",          full_name: "Jason Matthew Kelly",        role: "loan_officer", lo_slug: "jason-kelly",         nmls: "2000016",  password: "HCMGteam2025!" },
  { email: "jimmy@hcmgloans.com",          full_name: "Jimmy Flores Castillo",      role: "loan_officer", lo_slug: "jimmy-castillo",      nmls: "2140847",  password: "HCMGteam2025!" },
  { email: "lamont@hcmgloans.com",         full_name: "Lamont Harris Jr.",          role: "admin",        lo_slug: "lamont-harris-jr",    nmls: null,       password: "HCMGteam2025!" },
  { email: "latonya@hcmgloans.com",        full_name: "LaTonya Matrice Jordan-Odom",role: "loan_officer", lo_slug: "latonya-jordan-odom", nmls: "1798502",  password: "HCMGteam2025!" },
  { email: "liudmila@hcmgloans.com",       full_name: "Liudmila Paliankova",        role: "loan_officer", lo_slug: "liudmila-paliankova", nmls: "1979184",  password: "HCMGteam2025!" },
  { email: "mesia@hcmgloans.com",          full_name: "Mesia Crews",                role: "admin",        lo_slug: "mesia-crews",         nmls: null,       password: "HCMGteam2025!" },
  { email: "philbert@hcmgloans.com",       full_name: "Philbert Wilson",            role: "loan_officer", lo_slug: "philbert-wilson",     nmls: "1053787",  password: "HCMGteam2025!" },
  { email: "rafael@hcmgloans.com",         full_name: "Rafael Espinoza",            role: "loan_officer", lo_slug: "rafael-espinoza",     nmls: "2083843",  password: "HCMGteam2025!" },
  { email: "ranada@hcmgloans.com",         full_name: "Ranada Harris",              role: "admin",        lo_slug: "ranada-harris",       nmls: null,       password: "HCMGteam2025!" },
  { email: "tamara@hcmgloans.com",         full_name: "Tamara Hodges-Brown",        role: "loan_officer", lo_slug: "tamara-hodges-brown", nmls: "2465567",  password: "HCMGteam2025!" },
];

const h = { "Authorization": `Bearer ${serviceKey}`, "apikey": serviceKey, "Content-Type": "application/json" };

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log("=== HCMG Auth Setup ===\n");

  // Step 1: Check current state
  const listR = await fetch(`${url}/auth/v1/admin/users?per_page=200`, { headers: h });
  const listD = await listR.json();
  const existing = listD.users || [];
  console.log(`Existing auth users: ${existing.length}`);

  // Step 2: Delete any visible auth users first
  if (existing.length > 0) {
    console.log("Cleaning up existing users...");
    for (const u of existing) {
      await fetch(`${url}/auth/v1/admin/users/${u.id}`, { method: "DELETE", headers: h });
    }
  }

  // Step 3: Create all 19
  console.log("\nCreating 19 auth users...");
  let ok = 0, fail = 0, blocked = [];

  for (const u of TEAM) {
    await sleep(150);
    const r = await fetch(`${url}/auth/v1/admin/users`, {
      method: "POST", headers: h,
      body: JSON.stringify({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: {
          full_name: u.full_name, role: u.role,
          lo_slug: u.lo_slug, nmls: u.nmls,
          notify_email: u.email,
        },
      }),
    });
    const d = await r.json();
    if (r.status === 200) {
      process.stdout.write(`  ✅ ${u.email}\n`);
      ok++;
    } else {
      const msg = d.message || d.msg || JSON.stringify(d);
      process.stdout.write(`  ❌ ${u.email}: ${msg}\n`);
      if (msg.includes("duplicate")) blocked.push(u.email);
      fail++;
    }
  }

  console.log(`\nDone — Created: ${ok}, Failed: ${fail}`);

  // Step 4: Verify login
  await sleep(1000);
  console.log("\nTesting login (darius)...");
  const loginR = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: serviceKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "darius@hcmgloans.com", password: "Queen1972$" }),
  });
  const loginD = await loginR.json();
  if (loginD.access_token) {
    console.log("✅ LOGIN WORKS — darius@hcmgloans.com signed in successfully!");
  } else {
    console.log("❌ Login still failing:", loginD.error_code || loginD.msg);
  }

  // Step 5: Verify profiles
  const pr = await fetch(`${url}/rest/v1/profiles?select=email,role&order=role.asc,email.asc`, { headers: h });
  const profiles = await pr.json();
  console.log(`\nProfiles in DB: ${Array.isArray(profiles) ? profiles.length : "error — " + JSON.stringify(profiles).substring(0, 100)}`);

  if (blocked.length > 0) {
    console.log(`\n⚠️  ${blocked.length} emails still blocked by duplicate constraint.`);
    console.log("The Supabase SQL wipe may not have completed fully.");
    console.log("Go to: https://supabase.com/dashboard/project/iryqfwktlwcqqlmvtngx/sql/new");
    console.log("Run:\n  DELETE FROM auth.users;\n  SELECT count(*) FROM auth.users;");
    console.log("Then run this script again.");
  }
}

main().catch(console.error);
