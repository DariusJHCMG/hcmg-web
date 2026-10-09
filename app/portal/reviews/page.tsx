import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  scope: "personal" | "company";
  lo_slug: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} viewBox="0 0 16 16" className="h-3.5 w-3.5" fill={i <= rating ? "#F37021" : "#E2E8F0"}>
          <path d="M8 1l1.85 3.75 4.15.6-3 2.92.71 4.13L8 10.35l-3.71 1.95.71-4.13-3-2.92 4.15-.6z" />
        </svg>
      ))}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending:  "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-green-200 bg-green-50 text-green-700",
  rejected: "border-red-200 bg-red-50 text-red-600",
};

export const dynamic = "force-dynamic";

export default async function PortalReviewsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (!profile.lo_slug) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold text-ink">My Reviews</h1>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center text-sm text-amber-800">
          Your account doesn&apos;t have a loan officer slug set. Contact an admin to configure this.
        </div>
      </div>
    );
  }

  const sb = createServiceClient();
  const { data } = await sb
    .from("reviews")
    .select("*")
    .eq("lo_slug", profile.lo_slug)
    .order("created_at", { ascending: false });
  const reviews = (data ?? []) as Review[];

  const approved = reviews.filter((r) => r.status === "approved").length;
  const pending  = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-ink">My Reviews</h1>
        <p className="mt-0.5 text-sm text-muted">
          {reviews.length} total · {approved} approved · {pending} pending moderation
        </p>
      </div>

      {pending > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-800 font-semibold">
          ⏳ {pending} {pending === 1 ? "review is" : "reviews are"} pending moderation — they will appear on your public profile once approved by an admin.
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white px-6 py-12 text-center text-sm text-muted/60">
          No reviews yet. Reviews submitted through your profile page will appear here.
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-sand text-xs font-semibold uppercase tracking-[0.1em] text-muted/70">
                  <th className="px-5 py-3 text-left">Author</th>
                  <th className="px-5 py-3 text-left">Rating</th>
                  <th className="px-5 py-3 text-left">Review</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0 hover:bg-sand/40">
                    <td className="px-5 py-3.5 font-semibold text-ink whitespace-nowrap">{r.author}</td>
                    <td className="px-5 py-3.5"><Stars rating={r.rating} /></td>
                    <td className="px-5 py-3.5 text-muted max-w-xs">
                      <p className="line-clamp-2">{r.text}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_COLORS[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-muted/50">
        Reviews are read-only. Contact an admin to have a review removed.
      </p>
    </div>
  );
}
