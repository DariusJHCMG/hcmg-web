import type { Metadata } from "next";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { FunnelFlow } from "@/components/funnel/FunnelFlow";

export const metadata: Metadata = {
  title: "Get Your Mortgage Estimate — HCMG",
  description:
    "See what you can afford in 60 seconds. No hard credit check. FHA, VA, Conventional, and Refinance options. Harris Capital Mortgage Group · NMLS# 1918223.",
  alternates: { canonical: "https://getorangekey.com/get-started" },
  robots: { index: true, follow: true },
};

export default function GetStartedPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-sand pb-32 md:pb-0">
      <NavBar />

      <section className="section-pad">
        <div className="container-shell">
          <div className="mx-auto max-w-xl text-center mb-10">
            <div className="ok-gradient-text mb-3 text-xs font-bold uppercase tracking-[0.2em]">
              Harris Capital Mortgage Group · NMLS# 1918223
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              Find out what you can afford
            </h1>
            <p className="mt-3 text-base text-muted">
              Under 60 seconds · No hard credit check · No commitment
            </p>
          </div>

          <FunnelFlow />
        </div>
      </section>

      <Footer />
    </main>
  );
}
