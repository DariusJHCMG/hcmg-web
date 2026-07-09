import { NextResponse } from "next/server";

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "FLIGHT_DECK_LEADS_URL",
  "FLIGHT_DECK_API_KEY",
  "GOOGLE_SA_CLIENT_EMAIL",
  "GOOGLE_SA_PRIVATE_KEY",
];

export async function GET() {
  const checks = REQUIRED_ENV.map((key) => {
    const val = process.env[key];
    const set = !!val && val.trim() !== "";
    return {
      key,
      ok:    set,
      label: key,
      value: set ? `${val!.slice(0, 6)}${"*".repeat(Math.min(10, val!.length - 6))}` : "—",
    };
  });

  return NextResponse.json({ checks });
}
