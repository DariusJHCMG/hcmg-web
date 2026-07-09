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
  title: "Harris Capital Mortgage Group — Home Mortgage Company | NMLS# 1918223",
  description:
    "Harris Capital Mortgage Group is a licensed home mortgage company serving FL, TX, GA, NV, CO, VA, DC, MD, CA & MS. FHA, VA, Conventional, Jumbo, USDA, Refinance & down payment assistance. Find out what you can afford in 60 seconds — no hard credit check.",
  alternates: { canonical: "https://hcmgloans.com" },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["MortgageLender", "LocalBusiness", "FinancialService"],
  name: "Harris Capital Mortgage Group, LLC",
  alternateName: "HCMG",
  legalName: "Harris Capital Mortgage Group, LLC",
  url: "https://hcmgloans.com",
  logo: "https://hcmgloans.com/hcmg-wordmark-on-light.svg",
  image: "https://hcmgloans.com/hcmg-social.png",
  telephone: "+18884413930",
  email: "info@hcmgloans.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "6375 S Pecos Rd, Suite 208",
    addressLocality: "Las Vegas",
    addressRegion: "NV",
    postalCode: "89120",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 36.0635,
    longitude: -115.1311,
  },
  sameAs: [
    "https://www.facebook.com/harriscapitalmortgage",
    "https://www.instagram.com/harriscapitalmortgage",
    "https://twitter.com/harriscapitalmtg",
    "https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/1918223",
  ],
  areaServed: [
    "Florida","Texas","Georgia","Nevada","Colorado","Virginia",
    "Washington DC","Maryland","California","Mississippi",
    "Michigan","Ohio","Indiana","Illinois","Wisconsin",
  ],
  identifier: {
    "@type": "PropertyValue",
    propertyID: "NMLS",
    value: "1918223",
  },
  description: "Harris Capital Mortgage Group, LLC (NMLS# 1918223) is a licensed mortgage lender offering FHA, VA, Conventional, Jumbo, and Refinance loans. Instant estimates, no hard credit check.",
};

const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Does getting an estimate affect my credit score?",
      acceptedAnswer: { "@type": "Answer", text: "No. The HCMG estimate is based entirely on information you provide — income range, price range, and credit band. We never run a credit inquiry of any kind during the estimate process. A hard credit pull only happens when you formally apply for a loan." },
    },
    {
      "@type": "Question",
      name: "Is this a pre-approval?",
      acceptedAnswer: { "@type": "Answer", text: "No. Your estimate is for informational purposes only. It is not a pre-approval, pre-qualification, or commitment to lend. Actual loan approval depends on a full application, credit review, employment verification, property appraisal, and other factors." },
    },
    {
      "@type": "Question",
      name: "What loan types does Harris Capital offer?",
      acceptedAnswer: { "@type": "Answer", text: "We offer conventional, FHA, VA, USDA, jumbo, and refinance loans. Our licensed loan officers will recommend the program that fits your credit profile, down payment, and financial goals." },
    },
    {
      "@type": "Question",
      name: "How quickly can I get pre-approved?",
      acceptedAnswer: { "@type": "Answer", text: "Most borrowers receive a decision within 24–48 hours of submitting a complete application with all required documents." },
    },
    {
      "@type": "Question",
      name: "What states are you licensed in?",
      acceptedAnswer: { "@type": "Answer", text: "Harris Capital Mortgage Group (NMLS# 1918223) is licensed in Florida, Texas, Georgia, Nevada, Colorado, Virginia, Washington DC, Maryland, California, Mississippi, Michigan, Ohio, Indiana, Illinois, and Wisconsin." },
    },
    {
      "@type": "Question",
      name: "What is the minimum credit score you accept?",
      acceptedAnswer: { "@type": "Answer", text: "FHA loans may be available with scores as low as 580. Conventional loans typically require 620 or higher. VA loans have no official minimum. Your loan officer will identify the best available path based on your complete profile." },
    },
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Get a Mortgage Estimate with HCMG",
  description: "Get an instant mortgage estimate in under 60 seconds — no hard credit check, no commitment.",
  totalTime: "PT1M",
  step: [
    { "@type": "HowToStep", position: 1, name: "Tell us your goal", text: "Select whether you want to buy, refinance, or compare options." },
    { "@type": "HowToStep", position: 2, name: "Share a few details", text: "Select your price range, credit range, and income range — no typing required." },
    { "@type": "HowToStep", position: 3, name: "See your estimate", text: "Instantly see your estimated buying power, monthly payment, and recommended loan type." },
    { "@type": "HowToStep", position: 4, name: "Connect when ready", text: "A licensed Harris Capital loan officer will reach out within one business day." },
  ],
};

export default function HomePage() {
  return (
    <main className="overflow-x-hidden pb-24 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
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
