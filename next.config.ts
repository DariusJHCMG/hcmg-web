import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
