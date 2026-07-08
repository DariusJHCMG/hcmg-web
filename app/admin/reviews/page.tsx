"use client";

import { useState, useEffect, useCallback } from "react";

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

export default function AdminReviewsPage() {
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [working,  setWorking]  = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/reviews");
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch { /* best effort */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function act(id: string, status: "approved" | "rejected") {
    setWorking(id);
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setWorking(null);
    fetchReviews();
  }

  async function del(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    setWorking(id);
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    setWorking(null);
    fetchReviews();
  }

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  const pendingCount  = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Reviews</h1>
          <p className="mt-0.5 text-sm text-muted">
            {reviews.length} total · {approvedCount} approved · {pendingCount} pending
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                ⚠ {pendingCount} need review
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex rounded-xl border border-line bg-white overflow-hidden text-sm font-semibold w-fit">
        {(["pending","approved","rejected","all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 capitalize transition-colors ${filter === f ? "bg-accent text-white" : "text-muted hover:bg-sand"}`}
          >
            {f}
            {f === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-black text-white">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-muted/60">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted/60">No {filter === "all" ? "" : filter} reviews.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-xs font-semibold uppercase tracking-[0.1em] text-muted/60">
                  <th className="px-5 py-3 text-left">Author</th>
                  <th className="px-5 py-3 text-left">Rating</th>
                  <th className="px-5 py-3 text-left">Review</th>
                  <th className="px-5 py-3 text-left">LO / Scope</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0 hover:bg-sand/40">
                    <td className="px-5 py-3.5 font-semibold text-ink whitespace-nowrap">{r.author}</td>
                    <td className="px-5 py-3.5"><Stars rating={r.rating} /></td>
                    <td className="px-5 py-3.5 text-muted max-w-xs">
                      <p className="line-clamp-2">{r.text}</p>
                    </td>
                    <td className="px-5 py-3.5 text-muted">
                      <p className="text-xs font-semibold">{r.lo_slug ?? "Company"}</p>
                      <p className="text-[11px] capitalize text-muted/60">{r.scope}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_COLORS[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {r.status !== "approved" && (
                          <button
                            onClick={() => act(r.id, "approved")}
                            disabled={working === r.id}
                            className="rounded-lg border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== "rejected" && (
                          <button
                            onClick={() => act(r.id, "rejected")}
                            disabled={working === r.id}
                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => del(r.id)}
                          disabled={working === r.id}
                          className="rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-bold text-muted transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
