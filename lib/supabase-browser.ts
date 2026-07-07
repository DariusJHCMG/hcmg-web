import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── Browser / client-side (uses @supabase/ssr for cookie-based sessions)
// Must use createBrowserClient from @supabase/ssr — NOT createClient from supabase-js —
// so that auth session cookies are synced with the server middleware.
export function createBrowserClient() {
  return createSSRBrowserClient(supabaseUrl, supabaseAnonKey);
}
