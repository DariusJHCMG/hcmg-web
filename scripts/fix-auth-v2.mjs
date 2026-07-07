// Uses raw fetch (which we confirmed works) to create auth users
// Run: node scripts/fix-auth-v2.mjs

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://iryqfwktlwcqqlmvtngx.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const TEAM = [
  { email: "adam@hcmgloans.com",           full_name: "Adam DeMarco",               role: "admin",        lo_slug: "adam-demarco",        nmls: "2749110",  password: "HCMGteam2025!" },
  { email: "astrine@hcmgloans.com",        full_name: "Astrine Covington",          role: "admin",        lo_slug: "astrine-covington",   nmls: null,       password: "HCMGteam2025!" },
  { email: "aysha@hcmgloans.com",          full_name: "Aysha Randall",              role: "admin",        lo_slug: "aysha-randall",       nmls: "2341853",  password: "HCMGteam2025!" },
  { email: "cason@hcmgloans.com",          full_name: "Cason Thomas Knight",        role: "loan_officer", lo_slug: "cason-knight",        nmls: "2234863",  password: "HCMGteam2025!" },
  { email: "darius@hcmgloans.com",         full_name: "Darius James",               role: "admin",        lo_slug: "darius-james",        nmls: null,       password: "Queen1972$",    },
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

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function adminPost(path, body) {
  const r = await fetch(`${url}/auth/v1/admin/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return { status: r.status, data: await r.json() };
}

async function adminDelete(id) {
  const r = await fetch(`${url}/auth/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
  });
  return r.status;
}

async function listUsers() {
  const r = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=100`, {
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
  });
  const d = await r.json();
  return d.users || [];
}

async function deleteProfile(email) {
  const r = await fetch(
    `${url}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        Prefer: "return=minimal",
      },
    }
  );
  return r.status;
}

async function main() {
  console.log("=== HCMG Auth Fix v2 (raw fetch) ===\n");

  // Step 1: List and delete existing auth users
  console.log("Step 1: Clearing existing auth users...");
  const existing = await listUsers();
  console.log(`  Found ${existing.length} users`);
  for (const u of existing) {
    const s = await adminDelete(u.id);
    console.log(`  Deleted ${u.email}: HTTP ${s}`);
  }

  // Step 2: Delete all profiles and funnel_links
  // PostgREST requires a filter for DELETE â€” use id != impossible UUID to match all rows
  console.log("\nStep 2: Deleting all profiles...");
  const rp = await fetch(`${url}/rest/v1/profiles?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      Prefer: "return=minimal",
    },
  });
  console.log(`  profiles DELETE: HTTP ${rp.status}`);

  const rf = await fetch(`${url}/rest/v1/funnel_links?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      Prefer: "return=minimal",
    },
  });
  console.log(`  funnel_links DELETE: HTTP ${rf.status}`);

  // Step 3: Create all 19 auth users
  console.log("\nStep 3: Creating auth users...");
  let created = 0;
  let errors = 0;

  for (const u of TEAM) {
    const { status, data } = await adminPost("users", {
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: {
        full_name: u.full_name,
        role: u.role,
        lo_slug: u.lo_slug,
        nmls: u.nmls,
        notify_email: u.email,
      },
    });

    if (status === 200 || status === 201) {
      console.log(`  âœ… ${u.email} â†’ ${data.id}`);
      created++;
    } else {
      console.log(`  âŒ ${u.email}: HTTP ${status} â†’ ${data.message || data.msg || JSON.stringify(data)}`);
      errors++;
    }

    await sleep(150);
  }

  console.log(`\nCreated: ${created}, Errors: ${errors}`);

  // Step 4: Verify
  await sleep(2000);
  console.log("\nStep 4: Final verification...");

  const authUsers = await listUsers();
  console.log(`Auth users: ${authUsers.length}`);

  const pr = await fetch(`${url}/rest/v1/profiles?select=email,role,lo_slug&order=role.asc,email.asc`, {
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
  });
  const profiles = await pr.json();
  console.log(`Profiles: ${profiles.length}`);
  profiles.forEach((p) => console.log(`  ${p.role?.padEnd(12)} ${p.email?.padEnd(40)} ${p.lo_slug || "(no slug)"}`));

  const fl = await fetch(`${url}/rest/v1/funnel_links?select=lo_slug&order=lo_slug.asc`, {
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
  });
  const funnels = await fl.json();
  console.log(`\nFunnel links: ${funnels.length}`);
}

main().catch(console.error);
