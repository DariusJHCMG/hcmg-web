import type { Metadata } from "next";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { ValueProps } from "@/components/sections/ValueProps";
import { Calculator } from "@/components/sections/Calculator";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TrustSection } from "@/components/sections/TrustSection";
import { LocalSEO } from "@/components/sections/LocalSEO";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "HCMG, Find Out What You Can Afford in 60 Seconds",
  description:
    "Instant mortgage estimates. No hard credit check. FHA, VA, Conventional, Refinance. Harris Capital Mortgage Group, LLC · NMLS# 1918223 · Equal Housing Lender.",
  alternates: { canonical: "https://hcmgloans.com" },
};

export default function HomePage() {
  return (
    <main className="overflow-x-hidden pb-24 md:pb-0">
      <NavBar />
      <Hero />
      <TrustBar />
      <ValueProps />
      <Calculator />
      <HowItWorks />
      <TrustSection />
      <LocalSEO />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
