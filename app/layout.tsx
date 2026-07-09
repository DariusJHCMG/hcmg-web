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
  // `swap` prevents invisible text during load (avoids LCP delay from font blocking)
  display: "swap",
  // Preload only the weights used above the fold — reduces render-blocking font requests
  preload: true,
  adjustFontFallback: true,   // Generates a metric-compatible fallback → eliminates CLS from font swap
});

export const metadata: Metadata = {
  title: {
    default: "Harris Capital Mortgage Group: Home Mortgage Company | NMLS# 1918223",
    template: "%s | HCMG",
  },
  description:
    "Harris Capital Mortgage Group is a licensed home mortgage company serving FL, TX, GA, NV, CO, VA, DC, MD, CA & MS. FHA, VA, Conventional, Jumbo, USDA, Refinance & down payment assistance. No hard credit check.",
  metadataBase: new URL("https://hcmgloans.com"),
  openGraph: {
    type: "website",
    url: "https://hcmgloans.com",
    siteName: "HCMG, Harris Capital Mortgage Group",
    title: "Harris Capital Mortgage Group: Home Mortgage Company | NMLS# 1918223",
    description:
      "Licensed mortgage lender in FL, TX, GA, NV, CO, VA, DC, MD, CA & MS. FHA, VA, Conventional, Jumbo, USDA, Refinance. Harris Capital Mortgage Group · NMLS# 1918223.",
    images: [
      {
        url: "/hcmg-social.png",
        width: 1200,
        height: 630,
        alt: "Harris Capital Mortgage Group, Licensed Mortgage Lender",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Harris Capital Mortgage Group: Home Mortgage Company | NMLS# 1918223",
    description:
      "Licensed mortgage lender in FL, TX, GA, NV, CO, VA, DC, MD, CA & MS. FHA, VA, Conventional, Jumbo, USDA, Refinance. NMLS# 1918223.",
    images: ["/hcmg-social.png"],
  },
  keywords: [
    "mortgage company", "home mortgage", "mortgage lender", "FHA loan", "VA loan",
    "conventional loan", "jumbo loan", "USDA loan", "refinance", "down payment assistance",
    "Harris Capital Mortgage Group", "HCMG", "NMLS 1918223", "mortgage calculator",
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": ["MortgageLender", "LocalBusiness", "FinancialService"],
  name: "Harris Capital Mortgage Group, LLC",
  alternateName: "HCMG",
  legalName: "Harris Capital Mortgage Group, LLC",
  description:
    "Harris Capital Mortgage Group (NMLS# 1918223) is a licensed mortgage lender offering FHA, VA, Conventional, Jumbo, USDA, Refinance, and down payment assistance loans. Serving home buyers in FL, TX, GA, NV, CO, VA, DC, MD, CA, and MS.",
  url: "https://hcmgloans.com",
  telephone: "+18884413930",
  faxNumber: "+14048824100",
  email: "info@hcmgloans.com",
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
    "https://www.facebook.com/harriscapitalmortgage",
    "https://www.instagram.com/harriscapitalmortgage",
  ],
  areaServed: ["FL", "TX", "GA", "NV", "CO", "VA", "DC", "MD", "CA", "MS"],
  knowsAbout: [
    "FHA Loan", "VA Loan", "Conventional Loan", "Jumbo Loan", "USDA Loan",
    "Mortgage Refinance", "HELOC", "Down Payment Assistance", "First-Time Homebuyer Programs",
  ],
  identifier: {
    "@type": "PropertyValue",
    propertyID: "NMLS",
    value: "1918223",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await readSettings().catch(() => ({ ga4_measurement_id: "" }));
  return (
    <html lang="en" className={montserrat.variable}>
      <head>
        {/* Preconnect to Google Fonts origin — reduces DNS + TLS handshake time */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Resource hints for LCP image — ensures hero image fetch starts as early as possible */}
        <link rel="preload" as="image" href="/hcmg-social.png" fetchPriority="high" />

        {/* Viewport width — prevents horizontal-scroll CLS on mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

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
