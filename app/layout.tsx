import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Orange Key — Find Out What You Can Afford in 60 Seconds",
    template: "%s | Orange Key",
  },
  description:
    "Fast, simple mortgage estimates. No hard credit check. FHA, VA, Conventional, and Refinance. Harris Capital Mortgage Group, LLC dba Orange Key · NMLS# 1918223 · Equal Housing Lender.",
  metadataBase: new URL("https://getorangekey.com"),
  openGraph: {
    type: "website",
    url: "https://getorangekey.com",
    siteName: "Orange Key",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Orange Key — Fast mortgage estimates" }],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: "/brand/ok-favicon.svg",
    apple: "/brand/ok-app-icon.svg",
  },
  keywords: [
    "mortgage estimate", "FHA loan", "VA loan", "conventional loan", "home buying",
    "Harris Capital Mortgage", "NMLS 1918223", "Orange Key", "mortgage calculator",
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "MortgageLender",
  name: "Orange Key",
  alternateName: "Harris Capital Mortgage Group, LLC",
  description:
    "Fast mortgage estimates for home buyers across FL, TX, GA, NV, CO, VA, DC, and MD. Harris Capital Mortgage Group, LLC dba Orange Key · NMLS# 1918223.",
  url: "https://getorangekey.com",
  telephone: "+18884413930",
  email: "hello@getorangekey.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "455 E Eisenhower Pkwy, Suite 300",
    addressLocality: "Ann Arbor",
    addressRegion: "MI",
    postalCode: "48108",
    addressCountry: "US",
  },
  sameAs: [
    "https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/1918223",
  ],
  areaServed: ["FL", "TX", "GA", "NV", "CO", "VA", "DC", "MD"],
  knowsAbout: ["FHA Loan", "VA Loan", "Conventional Loan", "Mortgage Refinance", "First-Time Homebuyer Programs"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
