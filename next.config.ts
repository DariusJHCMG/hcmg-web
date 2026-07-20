import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/fha-loans", destination: "/loans/fha", permanent: true },
      { source: "/fha", destination: "/loans/fha", permanent: true },
      { source: "/va-loans", destination: "/loans/va", permanent: true },
      { source: "/conventional-loans", destination: "/loans/conventional", permanent: true },
      { source: "/jumbo-loans", destination: "/loans/jumbo", permanent: true },
      { source: "/fixed-loans", destination: "/loans/conventional", permanent: true },
      { source: "/fixed-rate-loans", destination: "/loans/conventional", permanent: true },
      { source: "/adjustable-rate", destination: "/loans/arm", permanent: true },
      { source: "/adjustable-rate-mortgage-loans-arm", destination: "/loans/arm", permanent: true },
      { source: "/purchase", destination: "/loans/first-time-buyer", permanent: true },
      { source: "/rate-check", destination: "/get-started", permanent: true },
      { source: "/mortgage-application", destination: "/get-started", permanent: true },
      { source: "/apply", destination: "/get-started", permanent: true },
      { source: "/calculators", destination: "/mortgage-calculator", permanent: true },
      { source: "/mortgage-affordability-calculator", destination: "/mortgage-calculator", permanent: true },
      { source: "/mortgage-faqs", destination: "/learn", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      // Old SEO slug — 301 to correct URL
      {
        source: "/seo/orlando-fl-fha-loan",
        destination: "/seo/orlando-fha-loan",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
