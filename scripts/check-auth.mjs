// Check auth.users state and diagnose the issue
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://iryqfwktlwcqqlmvtngx.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const sb = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  // Step 1: Get profiles
  const { data: profiles } = await sb.from("profiles").select("id,email").order("email");
  console.log("Profiles count:", profiles.length);

  // Step 2: Try to create a helper RPC function to inspect auth.users
  // We'll use the pg-proxy endpoint if available, or create an RPC
  const createFnSql = `
    CREATE OR REPLACE FUNCTION public.get_auth_users_debug()
    RETURNS TABLE(id uuid, email text, created_at timestamptz, deleted_at timestamptz)
    LANGUAGE plpgsql SECURITY DEFINER AS
    $$
    BEGIN
      RETURN QUERY SELECT au.id, au.email, au.created_at, au.deleted_at FROM auth.users au LIMIT 50;
    END;
    $$;
  `;

  // Try creating it via REST API header trick
  const r = await fetch(`${url}/rest/v1/rpc/get_auth_users_debug`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  const text = await r.text();
  console.log("RPC status:", r.status, text.substring(0, 400));
}

main().catch(console.error);
