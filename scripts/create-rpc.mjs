// Create an RPC helper function to query auth.users directly
// Then use it to find and hard-delete the blocking users
// Run: node scripts/create-rpc.mjs

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://iryqfwktlwcqqlmvtngx.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Create the SQL for the helper function
// We'll create it by calling the Supabase Postgres Functions API
const createFunctionSQL = `
CREATE OR REPLACE FUNCTION public.admin_list_auth_users()
RETURNS TABLE(
  id uuid,
  email text,
  created_at timestamptz,
  deleted_at timestamptz,
  email_confirmed_at timestamptz,
  banned_until timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  RETURN QUERY
    SELECT 
      u.id,
      u.email,
      u.created_at,
      u.deleted_at,
      u.email_confirmed_at,
      u.banned_until
    FROM auth.users u
    ORDER BY u.email;
END;
$$;
`;

const deleteAuthUserSQL = `
CREATE OR REPLACE FUNCTION public.admin_hard_delete_auth_users(emails text[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Hard delete from auth.users (cascade will handle identities etc)
  DELETE FROM auth.users
  WHERE email = ANY(emails);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
`;

async function createFunction(sql, name) {
  // Use the Supabase REST API to run a query via a trick:
  // POST to /rest/v1/ with a raw SQL body - this won't work directly.
  // Instead, we need to use the Supabase management API or the pg proxy.
  
  // Try via the extensions/pg endpoint
  const r = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  return { status: r.status, body: await r.text() };
}

async function main() {
  // First check if the function already exists
  let r = await createFunction(null, "admin_list_auth_users");
  console.log("Function check:", r.status, r.body.substring(0, 200));

  if (r.status !== 200) {
    console.log("\nFunction doesn't exist. We need to create it via Supabase Dashboard.");
    console.log("\nRun this SQL in your Supabase Dashboard > SQL Editor:\n");
    console.log(createFunctionSQL);
    console.log("\n---\n");
    console.log(deleteAuthUserSQL);
    console.log(
      "\nThen run this script again, or use the Dashboard to investigate auth.users directly."
    );
  } else {
    const data = JSON.parse(r.body);
    console.log("Auth users found:", data.length);
    data.forEach((u) =>
      console.log(
        `  ${u.email.padEnd(45)} deleted_at: ${u.deleted_at || "NULL"} confirmed: ${u.email_confirmed_at || "no"}`
      )
    );
  }
}

main().catch(console.error);
