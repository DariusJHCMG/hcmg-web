import type { MetadataRoute } from "next";
import { seoPages } from "@/data/seo-pages";
import { glossaryTerms } from "@/data/glossary";
import { teamMembers } from "@/data/team";

const BASE = "https://hcmgloans.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "monthly", priority: 1.0, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/mortgage-calculator`, changeFrequency: "monthly", priority: 0.95, lastModified: new Date() },
    { url: `${BASE}/get-started`, changeFrequency: "monthly", priority: 0.9, lastModified: new Date("2026-07-08") },
    { url: `${BASE}/contact`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/glossary`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/team`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/careers`, changeFrequency: "monthly", priority: 0.9, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/join`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/careers/branch-partner`, changeFrequency: "monthly", priority: 0.7, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/careers/team-migration`, changeFrequency: "monthly", priority: 0.7, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/careers/corporate`, changeFrequency: "monthly", priority: 0.7, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/privacy`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/terms`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/sms-policy`, changeFrequency: "monthly", priority: 0.4, lastModified: new Date("2026-07-01") },
    { url: `${BASE}/licensing`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date("2026-07-01") },
  ];

  const seoRoutes: MetadataRoute.Sitemap = seoPages.map((p) => ({
    url: `${BASE}/seo/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
    lastModified: new Date(),
  }));

  const glossaryRoutes: MetadataRoute.Sitemap = glossaryTerms.map((t) => ({
    url: `${BASE}/glossary/${t.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: new Date(),
  }));

  const teamRoutes: MetadataRoute.Sitemap = teamMembers.map((m) => ({
    url: `${BASE}/team/${m.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...seoRoutes, ...glossaryRoutes, ...teamRoutes];
}
