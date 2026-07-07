// Run with: node scripts/create-auth-users.mjs
// Creates all 19 HCMG auth.users with the exact UUIDs matching existing profiles
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://iryqfwktlwcqqlmvtngx.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const sb = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

// These IDs were read from the existing profiles table
const TEAM = [
  { id: "92d4ceed-09a9-4312-91a9-cd3ee674d0ab", email: "adam@hcmgloans.com",          full_name: "Adam DeMarco",              role: "admin",        lo_slug: "adam-demarco",        nmls: "2749110", password: "HCMGteam2025!" },
  { id: "0855364a-63b5-4485-88cb-e58370639a0c", email: "astrine@hcmgloans.com",       full_name: "Astrine Covington",         role: "admin",        lo_slug: "astrine-covington",   nmls: null,       password: "HCMGteam2025!" },
  { id: "8d3018b2-45a8-4332-bf0c-0867ee46fde0", email: "aysha@hcmgloans.com",         full_name: "Aysha Randall",             role: "admin",        lo_slug: "aysha-randall",       nmls: "2341853", password: "HCMGteam2025!" },
  { id: "cd3c4611-2c3e-418c-97d0-ba57de9e7b2a", email: "cason@hcmgloans.com",         full_name: "Cason Thomas Knight",       role: "loan_officer", lo_slug: "cason-knight",        nmls: "2234863", password: "HCMGteam2025!" },
  { id: "b58070e6-57d6-4e0c-a597-fec4f966ce7d", email: "darius@hcmgloans.com",        full_name: "Darius James",              role: "admin",        lo_slug: "darius-james",        nmls: null,       password: "Queen1972$" },
  { id: "99a0b131-35e1-46a0-b567-05a48e1c281c", email: "don@hcmgloans.com",           full_name: "Don Ray Earl",              role: "loan_officer", lo_slug: "don-earl",            nmls: "896069",  password: "HCMGteam2025!" },
  { id: "43378c62-c8ed-4888-8bbe-e1b6e906de9e", email: "glenda@hcmgloans.com",        full_name: "Glenda Adesmiler Medina",   role: "loan_officer", lo_slug: "glenda-medina",       nmls: "2247461", password: "HCMGteam2025!" },
  { id: "c58dce60-4d75-412e-8a0b-2b972c753cf6", email: "james.pasquale@hcmgloans.com",full_name: "James Michael Pasquale",    role: "loan_officer", lo_slug: "james-pasquale",      nmls: "2410580", password: "HCMGteam2025!" },
  { id: "eccb1d08-1243-4648-a1a1-a0a363a8b8a5", email: "james.sadowski@hcmgloans.com",full_name: "James Carl Sadowski Jr",   role: "loan_officer", lo_slug: "james-sadowski",      nmls: "2711950", password: "HCMGteam2025!" },
  { id: "a76c62e0-4f57-469f-ae22-b973d891f2d9", email: "jason@hcmgloans.com",         full_name: "Jason Matthew Kelly",       role: "loan_officer", lo_slug: "jason-kelly",         nmls: "2000016", password: "HCMGteam2025!" },
  { id: "0079eb33-f558-4108-b93b-1e857f9bc00a", email: "jimmy@hcmgloans.com",         full_name: "Jimmy Flores Castillo",     role: "loan_officer", lo_slug: "jimmy-castillo",      nmls: "2140847", password: "HCMGteam2025!" },
  { id: "66ab84f6-04a6-4d72-8668-4dd8e5e183d9", email: "lamont@hcmgloans.com",        full_name: "Lamont Harris Jr.",         role: "admin",        lo_slug: "lamont-harris-jr",    nmls: null,       password: "HCMGteam2025!" },
  { id: "488ecb63-7ef8-4649-90fc-96927fbd7d7d", email: "latonya@hcmgloans.com",       full_name: "LaTonya Matrice Jordan-Odom",role:"loan_officer", lo_slug: "latonya-jordan-odom", nmls: "1798502", password: "HCMGteam2025!" },
  { id: "48c8d180-f3aa-4943-99bb-290168af9f56", email: "liudmila@hcmgloans.com",      full_name: "Liudmila Paliankova",       role: "loan_officer", lo_slug: "liudmila-paliankova", nmls: "1979184", password: "HCMGteam2025!" },
  { id: "4a81b4da-5c78-4467-820e-9bbcad25a8c4", email: "mesia@hcmgloans.com",         full_name: "Mesia Crews",               role: "admin",        lo_slug: "mesia-crews",         nmls: null,       password: "HCMGteam2025!" },
  { id: "5db50922-efd7-44bb-8d33-4f78fe4a26cb", email: "philbert@hcmgloans.com",      full_name: "Philbert Wilson",           role: "loan_officer", lo_slug: "philbert-wilson",     nmls: "1053787", password: "HCMGteam2025!" },
  { id: "90892b75-d1bb-4729-b1c2-cc3cf5b62034", email: "rafael@hcmgloans.com",        full_name: "Rafael Espinoza",           role: "loan_officer", lo_slug: "rafael-espinoza",     nmls: "2083843", password: "HCMGteam2025!" },
  { id: "6d2dbecc-2acf-4112-9c22-98b2b0b16e88", email: "ranada@hcmgloans.com",        full_name: "Ranada Harris",             role: "admin",        lo_slug: "ranada-harris",       nmls: null,       password: "HCMGteam2025!" },
  { id: "a7c54570-6641-4589-87f8-e6dc8b51c5eb", email: "tamara@hcmgloans.com",        full_name: "Tamara Hodges-Brown",       role: "loan_officer", lo_slug: "tamara-hodges-brown", nmls: "2465567", password: "HCMGteam2025!" },
];

async function main() {
  let created = 0, skipped = 0, errors = 0;

  for (const u of TEAM) {
    const { data, error } = await sb.auth.admin.createUser({
      user_id: u.id,
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: {
        full_name: u.full_name,
        role: u.role,
        lo_slug: u.lo_slug,
        nmls: u.nmls,
      },
    });

    if (error) {
      if (error.message?.includes("already") || error.message?.includes("duplicate")) {
        console.log(`â­  SKIP  ${u.email} (already exists)`);
        skipped++;
      } else {
        console.log(`âŒ ERROR ${u.email}: ${error.message}`);
        errors++;
      }
    } else {
      console.log(`âœ… CREATED ${u.email} â†’ ${data.user.id}`);
      created++;
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);

  // Verify
  const { data: list } = await sb.auth.admin.listUsers({ perPage: 50 });
  console.log(`Auth users now: ${list?.users?.length ?? 0}`);
}

main().catch(console.error);
