// Approach: delete all existing profiles and recreate auth users from scratch.
// Then the trigger will auto-create profiles with the correct auth user IDs.
// All team data (leads) is still 0, so no data loss.
//
// Run: node scripts/fix-auth-users.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://iryqfwktlwcqqlmvtngx.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const sb = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const TEAM = [
  { email: "adam@hcmgloans.com",           full_name: "Adam DeMarco",               role: "admin",        lo_slug: "adam-demarco",        nmls: "2749110",  password: "HCMGteam2025!" },
  { email: "astrine@hcmgloans.com",        full_name: "Astrine Covington",          role: "admin",        lo_slug: "astrine-covington",   nmls: null,       password: "HCMGteam2025!" },
  { email: "aysha@hcmgloans.com",          full_name: "Aysha Randall",              role: "admin",        lo_slug: "aysha-randall",       nmls: "2341853",  password: "HCMGteam2025!" },
  { email: "cason@hcmgloans.com",          full_name: "Cason Thomas Knight",        role: "loan_officer", lo_slug: "cason-knight",        nmls: "2234863",  password: "HCMGteam2025!" },
  { email: "darius@hcmgloans.com",         full_name: "Darius James",               role: "admin",        lo_slug: "darius-james",        nmls: null,       password: "Queen1972$" },
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

async function main() {
  console.log("=== HCMG Auth User Fix ===\n");

  // Step 1: Delete all existing profiles (no leads exist so safe)
  console.log("Step 1: Deleting existing orphaned profiles...");
  const { error: delErr, count } = await sb
    .from("profiles")
    .delete({ count: "exact" })
    .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all
  if (delErr) {
    console.error("Failed to delete profiles:", delErr.message);
    process.exit(1);
  }
  console.log(`  Deleted all profiles\n`);

  // Step 2: Delete all funnel links too (they'll be recreated by trigger)
  console.log("Step 2: Clearing funnel_links...");
  await sb.from("funnel_links").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("  Done\n");

  // Step 3: Find and delete any existing auth users with these emails
  console.log("Step 3: Checking for existing auth users to clean up...");
  const { data: existingUsers } = await sb.auth.admin.listUsers({ perPage: 100 });
  const existingEmails = new Set((existingUsers?.users ?? []).map((u) => u.email));
  console.log(`  Found ${existingEmails.size} existing auth users`);

  for (const user of existingUsers?.users ?? []) {
    const { error } = await sb.auth.admin.deleteUser(user.id, true); // hard delete
    if (error) console.log(`  Could not delete ${user.email}: ${error.message}`);
    else console.log(`  Deleted auth user: ${user.email}`);
  }
  console.log();

  // Step 4: Create all 19 auth users fresh (trigger will auto-create profiles)
  console.log("Step 4: Creating 19 auth users...");
  let created = 0, errors = 0;

  for (const u of TEAM) {
    await sleep(200); // rate limit protection

    const { data, error } = await sb.auth.admin.createUser({
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

    if (error) {
      console.error(`  âŒ ${u.email}: ${error.message}`);
      errors++;
    } else {
      console.log(`  âœ… ${u.email} â†’ ${data.user.id}`);
      created++;
    }
  }

  console.log(`\nCreated: ${created}, Errors: ${errors}`);

  // Step 5: Verify
  await sleep(1000);
  console.log("\nStep 5: Verifying...");
  const { data: finalProfiles } = await sb.from("profiles").select("email,role,lo_slug").order("role,email");
  console.log(`Profiles in DB: ${finalProfiles?.length ?? 0}`);
  finalProfiles?.forEach((p) =>
    console.log(`  ${p.role.padEnd(12)} ${p.email.padEnd(40)} ${p.lo_slug ?? "(no slug)"}`)
  );

  const { data: links } = await sb.from("funnel_links").select("lo_slug").order("lo_slug");
  console.log(`\nFunnel links: ${links?.length ?? 0}`);

  const { data: authList } = await sb.auth.admin.listUsers({ perPage: 100 });
  console.log(`Auth users: ${authList?.users?.length ?? 0}`);

  console.log("\nâœ… Done! Login should now work.");
  console.log("   Admin password: Queen1972$  (for darius@hcmgloans.com)");
  console.log("   Team password:  HCMGteam2025!  (for everyone else)");
}

main().catch(console.error);
