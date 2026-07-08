"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────

interface Review {
  author: string;
  initials: string;
  rating: number;
  date: string;
  text: string;
  platform: "Google" | "Zillow" | "HCMG";
}

// ── Mock reviews — swap for real API data later ───────────────────

const LAMONT_REVIEWS: Review[] = [
  {
    author: "Marcus T.",
    initials: "MT",
    rating: 5,
    date: "2 months ago",
    text: "Lamont walked me through every step of my first home purchase. I came in with zero knowledge and left with keys in hand. He was available nights and weekends — that level of commitment is rare.",
    platform: "Google",
  },
  {
    author: "Denise & Ray W.",
    initials: "DW",
    rating: 5,
    date: "4 months ago",
    text: "We tried two other lenders before HCMG. Lamont got us approved in under a week and locked us into a rate the big banks said was impossible for our credit profile. Couldn't be happier.",
    platform: "Google",
  },
  {
    author: "Priya M.",
    initials: "PM",
    rating: 5,
    date: "6 months ago",
    text: "I was worried about my self-employment income killing my chances. Lamont knew exactly which programs fit my situation and we closed in 28 days. Professional, patient, and genuinely cares.",
    platform: "Zillow",
  },
  {
    author: "Kevin O.",
    initials: "KO",
    rating: 5,
    date: "7 months ago",
    text: "Refinanced with HCMG and dropped my rate significantly. Lamont was transparent about every fee — no surprises at closing. This is how mortgage should work.",
    platform: "Zillow",
  },
  {
    author: "Shanice B.",
    initials: "SB",
    rating: 5,
    date: "9 months ago",
    text: "First-time buyer and a VA loan — Lamont handled it perfectly. Explained my entitlement, the funding fee, all of it. Closed on time and under budget.",
    platform: "Google",
  },
  {
    author: "Luis & Carmen R.",
    initials: "LR",
    rating: 5,
    date: "1 year ago",
    text: "We've purchased three properties through HCMG. Every time Lamont finds us a better deal than we expected. We send everyone we know here.",
    platform: "Zillow",
  },
];

const COMPANY_REVIEWS: Review[] = [
  {
    author: "Tanya F.",
    initials: "TF",
    rating: 5,
    date: "1 month ago",
    text: "The entire HCMG team made our purchase seamless. From application to closing in 21 days — every email was answered same day. This company is built different.",
    platform: "Google",
  },
  {
    author: "Jerome K.",
    initials: "JK",
    rating: 5,
    date: "3 months ago",
    text: "Harris Capital got me into a home when every other lender said no. They found a program designed for my situation and walked me through every document. Five stars, no question.",
    platform: "Google",
  },
  {
    author: "Melinda S.",
    initials: "MS",
    rating: 5,
    date: "5 months ago",
    text: "I appreciated the honesty most. They told me exactly what I qualified for, what the numbers meant, and why. No pressure, no bait-and-switch — just solid advice.",
    platform: "Zillow",
  },
  {
    author: "Andre & Dominique L.",
    initials: "AL",
    rating: 5,
    date: "8 months ago",
    text: "HCMG has handled two purchases and one refinance for our family. Consistent excellence every time. They are the only mortgage company we'll ever use.",
    platform: "Google",
  },
  {
    author: "Patricia N.",
    initials: "PN",
    rating: 5,
    date: "10 months ago",
    text: "The team explained the FHA vs conventional decision in plain language. I didn't feel like I was being sold to — I felt like I was being advised. That's the difference.",
    platform: "Zillow",
  },
  {
    author: "David H.",
    initials: "DH",
    rating: 5,
    date: "1 year ago",
    text: "Called on a Tuesday, had a pre-approval letter on Thursday. HCMG moves fast and does it right. Our realtor even commented on how smooth the process was.",
    platform: "Google",
  },
];

// ── Stars ─────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 16 16" className="h-4 w-4" fill={i <= rating ? "#F37021" : "#E2E8F0"}>
          <path d="M8 1l1.85 3.75 4.15.6-3 2.92.71 4.13L8 10.35l-3.71 1.95.71-4.13-3-2.92 4.15-.6z" />
        </svg>
      ))}
    </div>
  );
}

// ── Platform badge ────────────────────────────────────────────────

const PLATFORM_STYLES: Record<string, string> = {
  Google: "border-blue-200 bg-blue-50 text-blue-700",
  Zillow: "border-[#006AFF]/20 bg-[#006AFF]/5 text-[#006AFF]",
  HCMG:   "border-accent/20 bg-accent/5 text-accent",
};

function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${PLATFORM_STYLES[platform] ?? ""}`}>
      {platform}
    </span>
  );
}

// ── Review card ───────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const long = review.text.length > 180;
  const displayText = !long || expanded ? review.text : review.text.slice(0, 177) + "…";

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card">
      {/* Top */}
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
              style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}
            >
              {review.initials}
            </div>
            <div>
              <p className="text-sm font-bold text-ink">{review.author}</p>
              <p className="text-[11px] text-muted">{review.date}</p>
            </div>
          </div>
          <PlatformBadge platform={review.platform} />
        </div>
        <Stars rating={review.rating} />
        <p className="mt-3 text-sm leading-6 text-ink/80">
          {displayText}
        </p>
        {long && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-1.5 text-xs font-semibold text-accent hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

export function ReviewsSection({ firstName }: { firstName: string }) {
  const [tab, setTab] = useState<"personal" | "company">("personal");
  const reviews = tab === "personal" ? LAMONT_REVIEWS : COMPANY_REVIEWS;

  // Stat summary
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const googleCount = reviews.filter((r) => r.platform === "Google").length;
  const zillowCount = reviews.filter((r) => r.platform === "Zillow").length;

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

          {/* Tab pills */}
          <div className="flex items-center gap-1 rounded-2xl border border-line bg-sand p-1">
            <button
              onClick={() => setTab("personal")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                tab === "personal"
                  ? "bg-accent text-white shadow-orange"
                  : "text-muted hover:text-ink"
              }`}
            >
              {firstName}&apos;s Reviews
            </button>
            <button
              onClick={() => setTab("company")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                tab === "company"
                  ? "bg-accent text-white shadow-orange"
                  : "text-muted hover:text-ink"
              }`}
            >
              HCMG Reviews
            </button>
          </div>
        </div>

        {/* Aggregate stats bar */}
        <div className="mb-8 flex flex-wrap items-center gap-5 rounded-2xl border border-line bg-sand px-5 py-4">
          <div className="flex items-center gap-2">
            <Stars rating={5} />
            <span className="text-2xl font-extrabold text-ink">{avg}</span>
            <span className="text-sm text-muted">/ 5.0</span>
          </div>
          <div className="h-5 w-px bg-line" />
          <span className="text-sm font-semibold text-muted">
            <strong className="text-ink">{reviews.length}</strong> verified reviews
          </span>
          {googleCount > 0 && (
            <>
              <div className="h-5 w-px bg-line" />
              <span className="text-sm font-semibold text-muted">
                <strong className="text-blue-700">{googleCount}</strong> Google
              </span>
            </>
          )}
          {zillowCount > 0 && (
            <>
              <div className="h-5 w-px bg-line" />
              <span className="text-sm font-semibold text-muted">
                <strong className="text-[#006AFF]">{zillowCount}</strong> Zillow
              </span>
            </>
          )}
        </div>

        {/* Cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <ReviewCard key={i} review={r} />
          ))}
        </div>
      </div>
    </section>
  );
}
