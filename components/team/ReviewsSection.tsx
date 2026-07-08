"use client";

import { useState, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  scope: "personal" | "company";
  created_at: string;
}

// ── Stars ─────────────────────────────────────────────────────────

function Stars({ rating, size = 4 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 16 16" className={`h-${size} w-${size}`} fill={i <= rating ? "#F37021" : "#E2E8F0"}>
          <path d="M8 1l1.85 3.75 4.15.6-3 2.92.71 4.13L8 10.35l-3.71 1.95.71-4.13-3-2.92 4.15-.6z" />
        </svg>
      ))}
    </div>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1)  return "Today";
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  return (words[0]?.[0] ?? "") + (words[1]?.[0] ?? "");
}

// ── Review card ───────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const long = review.text.length > 180;
  const displayText = !long || expanded ? review.text : review.text.slice(0, 177) + "…";

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card">
      <div>
        <div className="mb-3 flex items-start gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
            style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}
          >
            {initials(review.author).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-ink">{review.author}</p>
            <p className="text-[11px] text-muted">{relativeTime(review.created_at)}</p>
          </div>
        </div>
        <Stars rating={review.rating} />
        <p className="mt-3 text-sm leading-6 text-ink/80">{displayText}</p>
        {long && (
          <button onClick={() => setExpanded((e) => !e)}
            className="mt-1.5 text-xs font-semibold text-accent hover:underline">
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Leave a review form ───────────────────────────────────────────

function LeaveReviewForm({
  loSlug,
  scope,
  onClose,
}: {
  loSlug?: string;
  scope: "personal" | "company";
  onClose: () => void;
}) {
  const [author,     setAuthor]     = useState("");
  const [rating,     setRating]     = useState(5);
  const [text,       setText]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: author.trim(), rating, text: text.trim(), lo_slug: loSlug ?? null, scope }),
      });
      if (res.ok) setDone(true);
      else setError("Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  const IC = "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 transition";

  if (done) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-2xl mb-2">🎉</p>
        <p className="font-bold text-green-800">Thank you for your review!</p>
        <p className="mt-1 text-sm text-green-700">It will appear after a quick approval.</p>
        <button onClick={onClose} className="mt-4 text-sm font-semibold text-accent hover:underline">Close</button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-extrabold text-ink">Leave a Review</h3>
        <button onClick={onClose} className="text-xl text-muted hover:text-ink leading-none">×</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-ink">Your name</label>
          <input className={IC} placeholder="First name or initials" value={author} onChange={(e) => setAuthor(e.target.value)} required />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold text-ink">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="transition-transform hover:scale-110"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                <svg viewBox="0 0 16 16" className="h-7 w-7" fill={n <= rating ? "#F37021" : "#E2E8F0"}>
                  <path d="M8 1l1.85 3.75 4.15.6-3 2.92.71 4.13L8 10.35l-3.71 1.95.71-4.13-3-2.92 4.15-.6z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-ink">Your experience</label>
          <textarea className={IC + " min-h-[100px] resize-y"} placeholder="Tell us about your experience…"
            value={text} onChange={(e) => setText(e.target.value)} required />
        </div>
        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        <button type="submit" disabled={submitting}
          className="primary-button w-full justify-center !py-3 disabled:opacity-50">
          {submitting ? "Submitting…" : "Submit review →"}
        </button>
        <p className="text-center text-[11px] text-muted/60">Reviews are reviewed before publishing.</p>
      </form>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

export function ReviewsSection({
  firstName,
  loSlug,
}: {
  firstName: string;
  loSlug?: string;
}) {
  const [tab,          setTab]         = useState<"personal" | "company">("personal");
  const [reviews,      setReviews]     = useState<Review[]>([]);
  const [loading,      setLoading]     = useState(true);
  const [showForm,     setShowForm]    = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = tab === "company"
      ? "/api/reviews?scope=company"
      : `/api/reviews?scope=personal${loSlug ? `&lo_slug=${loSlug}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [tab, loSlug]);

  return (
    <section className="bg-white py-20">
      <div className="container-shell max-w-6xl">

        {/* Header row */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.18em] text-accent">Client Testimonials</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              What clients are saying
            </h2>
          </div>

          {/* Tab pills + Leave Review button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-2xl border border-line bg-sand p-1">
              <button
                onClick={() => setTab("personal")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  tab === "personal" ? "bg-accent text-white shadow-orange" : "text-muted hover:text-ink"
                }`}
              >
                {firstName}&apos;s Reviews
              </button>
              <button
                onClick={() => setTab("company")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  tab === "company" ? "bg-accent text-white shadow-orange" : "text-muted hover:text-ink"
                }`}
              >
                HCMG Reviews
              </button>
            </div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="secondary-button !py-2 !px-4 !text-sm"
            >
              ✏️ Leave a Review
            </button>
          </div>
        </div>

        {/* Leave a review form */}
        {showForm && (
          <div className="mb-8 max-w-lg">
            <LeaveReviewForm
              loSlug={loSlug}
              scope={tab}
              onClose={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Stats bar */}
        {reviews.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-5 rounded-2xl border border-line bg-sand px-5 py-4">
            <div className="flex items-center gap-2">
              <Stars rating={5} />
              <span className="text-2xl font-extrabold text-ink">
                {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
              </span>
              <span className="text-sm text-muted">/ 5.0</span>
            </div>
            <div className="h-5 w-px bg-line" />
            <span className="text-sm font-semibold text-muted">
              <strong className="text-ink">{reviews.length}</strong> verified review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Cards or empty states */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-line bg-sand" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-line bg-sand px-6 py-12 text-center">
            <p className="text-2xl mb-2">⭐</p>
            <p className="font-semibold text-ink">No reviews yet</p>
            <p className="mt-1 text-sm text-muted">Be the first to leave one!</p>
            <button onClick={() => setShowForm(true)}
              className="primary-button mt-4 !py-2.5 !px-5 !text-sm">
              ✏️ Leave a Review
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}
      </div>
    </section>
  );
}
