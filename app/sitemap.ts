import type { MetadataRoute } from "next";
import { seoPages } from "@/data/seo-pages";
import { glossaryTerms } from "@/data/glossary";
import { teamMembers } from "@/data/team";

const BASE = "https://getorangekey.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "monthly", priority: 1.0, lastModified: new Date() },
    { url: `${BASE}/get-started`, changeFrequency: "monthly", priority: 0.9, lastModified: new Date() },
    { url: `${BASE}/contact`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date() },
    { url: `${BASE}/glossary`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date() },
    { url: `${BASE}/team`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date() },
    { url: `${BASE}/privacy`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date() },
    { url: `${BASE}/terms`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date() },
    { url: `${BASE}/sms-policy`, changeFrequency: "monthly", priority: 0.4, lastModified: new Date() },
    { url: `${BASE}/licensing`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date() },
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
