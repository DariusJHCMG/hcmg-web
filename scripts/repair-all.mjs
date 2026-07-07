// Nuclear option: create a pg function via REST DDL, use it to nuke auth.users,
// then re-create all 19 users properly via GoTrue admin API.
// Run: node scripts/repair-all.mjs

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://iryqfwktlwcqqlmvtngx.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

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
  { email: "mesia@hcmgloans.com",          full_name: "Mesia Crews",               role: "admin",        lo_slug: "mesia-crews",         nmls: null,       password: "HCMGteam2025!" },
  { email: "philbert@hcmgloans.com",       full_name: "Philbert Wilson",            role: "loan_officer", lo_slug: "philbert-wilson",     nmls: "1053787",  password: "HCMGteam2025!" },
  { email: "rafael@hcmgloans.com",         full_name: "Rafael Espinoza",            role: "loan_officer", lo_slug: "rafael-espinoza",     nmls: "2083843",  password: "HCMGteam2025!" },
  { email: "ranada@hcmgloans.com",         full_name: "Ranada Harris",              role: "admin",        lo_slug: "ranada-harris",       nmls: null,       password: "HCMGteam2025!" },
  { email: "tamara@hcmgloans.com",         full_name: "Tamara Hodges-Brown",        role: "loan_officer", lo_slug: "tamara-hodges-brown", nmls: "2465567",  password: "HCMGteam2025!" },
];

const headers = {
  "Authorization": `Bearer ${serviceKey}`,
  "apikey": serviceKey,
  "Content-Type": "application/json",
};

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function rpcPost(fn, body = {}) {
  const r = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST", headers,
    body: JSON.stringify(body),
  });
  return { status: r.status, data: await r.json() };
}

async function createUser(u) {
  const r = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST", headers,
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
  return { status: r.status, data: await r.json() };
}

async function listUsers() {
  const r = await fetch(`${url}/auth/v1/admin/users?per_page=200`, { headers });
  const d = await r.json();
  return d.users || [];
}

async function deleteUser(id) {
  const r = await fetch(`${url}/auth/v1/admin/users/${id}`, { method: "DELETE", headers });
  return r.status;
}

async function main() {
  console.log("=== HCMG Auth Repair ===\n");

  // â”€â”€ Step 1: Create the nuke function via RPC (if it doesn't already exist) â”€â”€
  console.log("Step 1: Installing helper SQL functions...");

  // First try calling it to see if it already exists
  const existsCheck = await rpcPost("hcmg_nuke_auth");
  if (existsCheck.status === 200) {
    console.log("  nuke function already ran â€” auth.users cleared");
  } else if (existsCheck.data?.code === "PGRST202") {
    // Function doesn't exist â€” we need to create it
    // We'll use a workaround: call a function that creates other functions
    // Since we can't run DDL directly, we'll use the pg_query extension if available
    const pgQuery = await fetch(`${url}/rest/v1/rpc/pg_query`, {
      method: "POST", headers,
      body: JSON.stringify({ query: "SELECT 1" }),
    });
    console.log("  pg_query available:", pgQuery.status === 200);

    // Try the Supabase internal SQL endpoint
    const sqlResult = await fetch(`${url}/rest/v1/`, {
      headers: { ...headers, "Accept": "application/vnd.pgrst.object+json" },
    });

    console.log("\n  âš ï¸  Cannot auto-create the SQL function via REST API.");
    console.log("  You must run this SQL in Supabase Dashboard â†’ SQL Editor:");
    console.log("\n" + "=".repeat(60));
    console.log(`
-- Paste this entire block into Supabase Dashboard > SQL Editor > Run

DELETE FROM public.profiles;
DELETE FROM public.funnel_links;
DELETE FROM public.audit_log;
DELETE FROM auth.identities;
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.users;

SELECT count(*) AS remaining_auth_users FROM auth.users;
`);
    console.log("=".repeat(60));
    console.log("\nAfter running the above SQL, run this script again.\n");
    process.exit(0);
  } else {
    console.log("  Unexpected response:", existsCheck.status, JSON.stringify(existsCheck.data).substring(0, 100));
  }

  // â”€â”€ Step 2: Delete remaining visible auth users â”€â”€
  console.log("\nStep 2: Deleting visible auth users...");
  const visible = await listUsers();
  for (const u of visible) {
    const s = await deleteUser(u.id);
    console.log(`  Deleted ${u.email}: HTTP ${s}`);
  }

  // â”€â”€ Step 3: Wipe profiles and funnel_links â”€â”€
  console.log("\nStep 3: Wiping profiles + funnel_links...");
  const dp = await fetch(`${url}/rest/v1/profiles?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: "DELETE", headers: { ...headers, Prefer: "return=minimal" },
  });
  console.log(`  profiles: HTTP ${dp.status}`);
  const df = await fetch(`${url}/rest/v1/funnel_links?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: "DELETE", headers: { ...headers, Prefer: "return=minimal" },
  });
  console.log(`  funnel_links: HTTP ${df.status}`);

  // â”€â”€ Step 4: Create all 19 users via GoTrue â”€â”€
  console.log("\nStep 4: Creating auth users...");
  let ok = 0, fail = 0;
  for (const u of TEAM) {
    await sleep(200);
    const { status, data } = await createUser(u);
    if (status === 200) {
      console.log(`  âœ… ${u.email} â†’ ${data.id}`);
      ok++;
    } else {
      console.log(`  âŒ ${u.email}: ${data.message || data.msg || JSON.stringify(data).substring(0, 80)}`);
      fail++;
    }
  }
  console.log(`\n  Created: ${ok}, Failed: ${fail}`);

  // â”€â”€ Step 5: Verify â”€â”€
  await sleep(1500);
  console.log("\nStep 5: Verification...");
  const authUsers = await listUsers();
  console.log(`  Auth users: ${authUsers.length}`);

  const pr = await fetch(`${url}/rest/v1/profiles?select=email,role,lo_slug&order=role.asc,email.asc`, { headers });
  const profiles = await pr.json();
  console.log(`  Profiles: ${profiles.length}`);

  const fl = await fetch(`${url}/rest/v1/funnel_links?select=lo_slug`, { headers });
  const funnels = await fl.json();
  console.log(`  Funnel links: ${funnels.length}`);

  if (ok === 19 && profiles.length === 19) {
    console.log("\nâœ… All done! Login is ready.");
    console.log("   darius@hcmgloans.com  â†’  Queen1972$");
    console.log("   everyone else         â†’  HCMGteam2025!");
  } else {
    console.log("\nâš ï¸  Something is still off. Run supabase/repair-auth.sql in the Supabase Dashboard first, then re-run this script.");
  }
}

main().catch(console.error);
