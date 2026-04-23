import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-16 lg:py-20">
      <div className="container-shell">
        <div
          className="overflow-hidden rounded-[36px] px-8 py-14 text-center lg:px-16 lg:py-20"
          style={{ background: "var(--ok-gradient)" }}
        >
          <h2
            className="mx-auto max-w-3xl font-extrabold leading-tight tracking-tight text-white"
            style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
          >
            Your home is closer than you think.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/80">
            Get your estimate in 60 seconds. No credit check. No commitment. Just your numbers — right now.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-brand shadow-orange transition hover:scale-[1.02] hover:shadow-lg"
            >
              See what I qualify for →
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/50 bg-transparent px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Talk to a loan officer
            </Link>
          </div>

          <p className="mt-8 text-sm text-white/50">
            NMLS# 1918223 · Equal Housing Lender · Harris Capital Mortgage Group, LLC dba Orange Key
          </p>
        </div>
      </div>
    </section>
  );
}
