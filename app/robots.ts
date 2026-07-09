import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/portal/",
          "/find-a-loan-officer?*",
          "/get-started?source=seo*",
        ],
      },
    ],
    sitemap: "https://hcmgloans.com/sitemap.xml",
  };
}
