import { createServiceClient } from "@/lib/supabase";
import type { FunnelLink } from "@/lib/database.types";

async function getFunnelLinks(): Promise<FunnelLink[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("funnel_links")
    .select("*")
    .neq("lo_slug", "__settings__")
    .is("funnel_type", null)          // base links only — excludes the 107 variants per LO
    .order("lo_name");
  return (data ?? []) as FunnelLink[];
}

export default async function FunnelsPage() {
  const links = await getFunnelLinks();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://hcmgloans.com";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Funnel Links</h1>
        <p className="mt-1 text-sm text-muted">
          Base personal funnel links for each loan officer. Each LO also has 107 typed funnel variants
          available in their portal under <strong>My Funnels</strong>.
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-line bg-sand p-5 text-sm leading-7 text-muted">
        <p className="font-semibold text-ink">How funnel links work</p>
        <p>
          Share the link <code className="rounded bg-white px-1.5 py-0.5 text-xs text-ink">{baseUrl}/go/[slug]</code> with
          your clients or on social media. When someone submits a lead through that link, it is
          assigned to that loan officer, saved to the database, and an email notification is sent
          instantly to the LO&apos;s notification email address.
        </p>
      </div>

      {/* UTM Builder */}
      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="mb-3 text-sm font-bold text-ink">UTM Link Builder</p>
        <p className="mb-4 text-xs text-muted">
          Add UTM parameters to track where leads come from (Facebook, Instagram, email, etc.)
        </p>
        <div className="grid gap-3 sm:grid-cols-3 text-xs text-muted">
          {[
            { param: "utm_source",   example: "facebook" },
            { param: "utm_medium",   example: "social" },
            { param: "utm_campaign", example: "spring2025" },
          ].map((u) => (
            <div key={u.param} className="rounded-xl border border-line bg-sand p-3">
              <p className="font-semibold text-ink">{u.param}</p>
              <p>e.g. <code>{u.example}</code></p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted/60">
          Example: <code className="text-ink">{baseUrl}/go/lamont-harris-jr?utm_source=facebook&utm_medium=social</code>
        </p>
      </div>

      {/* Links table */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-sand text-xs font-semibold uppercase tracking-[0.1em] text-muted/70">
              <th className="px-5 py-3 text-left">Loan Officer</th>
              <th className="px-5 py-3 text-left">Funnel URL</th>
              <th className="px-5 py-3 text-left">Clicks</th>
              <th className="px-5 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {links.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted/60">
                  No funnel links yet. They are created automatically when you add a loan officer with a slug.
                </td>
              </tr>
            )}
            {links.map((link, i) => (
              <tr key={link.id} className={i % 2 === 0 ? "bg-white" : "bg-sand/40"}>
                <td className="px-5 py-3 font-semibold text-ink">{link.lo_name}</td>
                <td className="px-5 py-3">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline hover:opacity-80 text-xs"
                  >
                    {link.url.replace(baseUrl, "")}
                  </a>
                </td>
                <td className="px-5 py-3 font-bold text-ink">{link.clicks}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${link.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {link.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
