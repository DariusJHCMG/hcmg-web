import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { UtmCapture } from "@/components/ui/UtmCapture";
import { Tracker } from "@/components/ui/Tracker";
import { GoogleAnalytics } from "@/components/ui/GoogleAnalytics";
import { readSettings } from "@/lib/company-settings";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HCMG, Find Out What You Can Afford in 60 Seconds",
    template: "%s | HCMG",
  },
  description:
    "Fast, simple mortgage estimates. No hard credit check. FHA, VA, Conventional, and Refinance. Harris Capital Mortgage Group, LLC · NMLS# 1918223 · Equal Housing Lender.",
  metadataBase: new URL("https://hcmgloans.com"),
  openGraph: {
    type: "website",
    url: "https://hcmgloans.com",
    siteName: "HCMG, Harris Capital Mortgage Group",
    title: "HCMG, Find Out What You Can Afford in 60 Seconds",
    description:
      "Fast, simple mortgage estimates. No hard credit check. FHA, VA, Conventional, and Refinance. Harris Capital Mortgage Group, LLC · NMLS# 1918223.",
    images: [
      {
        url: "/hcmg-social-square.svg",
        width: 1000,
        height: 1000,
        alt: "HCMG, Harris Capital Mortgage Group",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HCMG, Find Out What You Can Afford in 60 Seconds",
    description:
      "Fast, simple mortgage estimates. No hard credit check. Harris Capital Mortgage Group · NMLS# 1918223.",
    images: ["/hcmg-social-square.svg"],
  },
  keywords: [
    "mortgage estimate", "FHA loan", "VA loan", "conventional loan", "home buying",
    "Harris Capital Mortgage Group", "HCMG", "NMLS 1918223", "mortgage calculator",
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "MortgageLender",
  name: "Harris Capital Mortgage Group, LLC",
  alternateName: "HCMG",
  description:
    "Fast mortgage estimates for home buyers across FL, TX, GA, NV, CO, VA, DC, and MD. Harris Capital Mortgage Group, LLC · NMLS# 1918223.",
  url: "https://hcmgloans.com",
  telephone: "+18884413930",
  faxNumber: "+14048824100",
  email: "info@harriscapitalmortgage.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "6375 S Pecos Rd, Suite 208",
    addressLocality: "Las Vegas",
    addressRegion: "NV",
    postalCode: "89120",
    addressCountry: "US",
  },
  sameAs: [
    "https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/1918223",
  ],
  areaServed: ["FL", "TX", "GA", "NV", "CO", "VA", "DC", "MD"],
  knowsAbout: ["FHA Loan", "VA Loan", "Conventional Loan", "Mortgage Refinance", "First-Time Homebuyer Programs"],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await readSettings().catch(() => ({ ga4_measurement_id: "" }));
  return (
    <html lang="en" className={montserrat.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body>
        <GoogleAnalytics id={settings.ga4_measurement_id || null} />
        <UtmCapture />
        <Tracker />
        {children}
      </body>
    </html>
  );
}
